-- Firestore document paths are retained so existing URLs, token hashes and
-- contract audit event IDs survive the database migration unchanged.
create table public.site_documents (
  path text primary key
    check (path ~ '^[^/]+/[^/]+(/[^/]+/[^/]+)*$'),
  collection_path text generated always as
    (regexp_replace(path, '/[^/]+$', '')) stored,
  data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(data) = 'object'),
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index site_documents_collection_path_idx
  on public.site_documents (collection_path);

alter table public.site_documents enable row level security;
revoke all on public.site_documents from public, anon, authenticated;
grant select, insert, update, delete on public.site_documents to service_role;

-- All reads in p_reads are version checked before any write is committed.
-- Advisory locks also protect a document that did not exist at read time.
create function public.commit_site_documents(p_reads jsonb, p_writes jsonb)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_path text;
  v_read jsonb;
  v_write jsonb;
  v_field text;
  v_spec jsonb;
  v_action text;
  v_operation text;
  v_existing jsonb;
  v_next jsonb;
  v_version bigint;
  v_expected bigint;
  v_exists boolean;
  v_number numeric;
begin
  if jsonb_typeof(p_reads) <> 'array' or jsonb_typeof(p_writes) <> 'array' then
    raise exception 'Invalid document transaction payload' using errcode = '22023';
  end if;

  for v_path in
    select distinct paths.path
    from (
      select item ->> 'path' as path from jsonb_array_elements(p_reads) as item
      union all
      select item ->> 'path' as path from jsonb_array_elements(p_writes) as item
    ) as paths
    where paths.path is not null
    order by paths.path
  loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_path, 91703));
  end loop;

  for v_read in select value from jsonb_array_elements(p_reads)
  loop
    v_path := v_read ->> 'path';
    v_expected := (v_read ->> 'version')::bigint;
    select version into v_version
    from public.site_documents
    where path = v_path;
    if v_version is distinct from v_expected then
      raise exception 'Document changed during transaction: %', v_path
        using errcode = 'PT409';
    end if;
    v_version := null;
  end loop;

  for v_write in select value from jsonb_array_elements(p_writes)
  loop
    v_path := v_write ->> 'path';
    v_action := v_write ->> 'action';
    if v_path is null or v_path !~ '^[^/]+/[^/]+(/[^/]+/[^/]+)*$' then
      raise exception 'Invalid document path' using errcode = '22023';
    end if;

    select data into v_existing
    from public.site_documents
    where path = v_path;
    v_exists := found;

    if v_action = 'delete' then
      delete from public.site_documents where path = v_path;
      continue;
    end if;

    if v_action = 'create' and v_exists then
      raise exception 'Document already exists: %', v_path
        using errcode = '23505';
    end if;
    if v_action = 'update' and not v_exists then
      raise exception 'Document does not exist: %', v_path
        using errcode = 'P0002';
    end if;
    if v_action not in ('create', 'set', 'update') or
       jsonb_typeof(v_write -> 'fields') <> 'object' then
      raise exception 'Invalid document write' using errcode = '22023';
    end if;

    if v_action = 'set' and (v_write ->> 'merge')::boolean is not true then
      v_next := '{}'::jsonb;
    elsif v_action = 'create' then
      v_next := '{}'::jsonb;
    else
      v_next := coalesce(v_existing, '{}'::jsonb);
    end if;

    for v_field, v_spec in
      select key, value from jsonb_each(v_write -> 'fields')
    loop
      v_operation := v_spec ->> 'operation';
      if v_operation = 'set' then
        v_next := jsonb_set(v_next, array[v_field], v_spec -> 'value', true);
      elsif v_operation = 'delete' then
        v_next := v_next - v_field;
      elsif v_operation = 'increment' then
        if jsonb_typeof(v_next -> v_field) = 'number' then
          v_number := (v_next ->> v_field)::numeric;
        else
          v_number := 0;
        end if;
        v_next := jsonb_set(
          v_next,
          array[v_field],
          to_jsonb(v_number + (v_spec ->> 'value')::numeric),
          true
        );
      else
        raise exception 'Invalid field operation' using errcode = '22023';
      end if;
    end loop;

    if v_exists then
      update public.site_documents
      set data = v_next, version = version + 1, updated_at = now()
      where path = v_path;
    else
      insert into public.site_documents (path, data)
      values (v_path, v_next);
    end if;
  end loop;

  return true;
end;
$$;

revoke all on function public.commit_site_documents(jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.commit_site_documents(jsonb, jsonb)
  to service_role;
