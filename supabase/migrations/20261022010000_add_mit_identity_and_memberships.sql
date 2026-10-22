create table mit.app_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email = lower(email))
);

create unique index app_users_email_lower_key
  on mit.app_users (lower(email));

create table mit.entity_memberships (
  entity_id uuid not null references mit.entities(id) on delete cascade,
  user_id uuid not null references mit.app_users(user_id) on delete cascade,
  role text not null
    check (role in ('owner', 'admin', 'staff', 'viewer')),
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (entity_id, user_id)
);

create index entity_memberships_user_id_idx
  on mit.entity_memberships (user_id);

create index entity_memberships_active_entity_role_idx
  on mit.entity_memberships (entity_id, role)
  where status = 'active';

comment on table mit.app_users is
  'Supabase Auth identities allowed to participate in MIT organizations.';
comment on table mit.entity_memberships is
  'Organization-scoped MIT roles. owner and admin manage the organization; staff performs daily operations; viewer has read-only access.';
comment on column mit.entity_memberships.role is
  'owner: full control, admin: administration, staff: daily operations, viewer: read-only.';

create function mit.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger app_users_set_updated_at
before update on mit.app_users
for each row execute function mit.set_updated_at();

create trigger entity_memberships_set_updated_at
before update on mit.entity_memberships
for each row execute function mit.set_updated_at();

alter table mit.app_users enable row level security;
alter table mit.entity_memberships enable row level security;

create policy app_users_select_self
on mit.app_users
for select
to authenticated
using ((select auth.uid()) = user_id and status = 'active');

create policy entity_memberships_select_self
on mit.entity_memberships
for select
to authenticated
using ((select auth.uid()) = user_id and status = 'active');

create policy entities_select_for_active_members
on mit.entities
for select
to authenticated
using (
  exists (
    select 1
    from mit.entity_memberships membership
    where membership.entity_id = entities.id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  )
);

grant usage on schema mit to authenticated, service_role;
grant select on mit.app_users, mit.entity_memberships, mit.entities to authenticated;
grant select, insert, update, delete
  on mit.app_users, mit.entity_memberships, mit.entities
  to service_role;

do $$
declare
  make_it_tech_entity_id uuid;
begin
  select id
  into make_it_tech_entity_id
  from mit.entities
  where lower(name) = 'make it tech'
  order by created_at
  limit 1;

  if make_it_tech_entity_id is null then
    insert into mit.entities (
      name,
      entity_type,
      lifecycle_status,
      legal_name,
      notes,
      metadata
    )
    values (
      'Make It Tech',
      'sole_proprietor',
      'active',
      'Make It Tech',
      '管理アプリの権限境界となる事業体',
      '{"slug":"make-it-tech"}'::jsonb
    )
    returning id into make_it_tech_entity_id;
  end if;

  insert into mit.app_users (user_id, email, display_name, status)
  select id, lower(email), coalesce(raw_user_meta_data ->> 'name', email), 'active'
  from auth.users
  where lower(email) in (
    'info@make-it-tech.com',
    'reallywannaknowthings@gmail.com'
  )
  on conflict (user_id) do update
  set email = excluded.email,
      display_name = coalesce(mit.app_users.display_name, excluded.display_name),
      status = 'active',
      updated_at = now();

  insert into mit.entity_memberships (entity_id, user_id, role, status)
  select
    make_it_tech_entity_id,
    app_user.user_id,
    case
      when app_user.email = 'info@make-it-tech.com' then 'owner'
      else 'admin'
    end,
    'active'
  from mit.app_users app_user
  where app_user.email in (
    'info@make-it-tech.com',
    'reallywannaknowthings@gmail.com'
  )
  on conflict (entity_id, user_id) do update
  set role = excluded.role,
      status = 'active',
      updated_at = now();

  if (
    select count(*)
    from mit.entity_memberships
    where entity_id = make_it_tech_entity_id
      and status = 'active'
      and user_id in (
        select user_id
        from mit.app_users
        where email in (
          'info@make-it-tech.com',
          'reallywannaknowthings@gmail.com'
        )
      )
  ) <> 2 then
    raise exception 'Expected both approved Supabase Auth users to be provisioned';
  end if;
end;
$$;
