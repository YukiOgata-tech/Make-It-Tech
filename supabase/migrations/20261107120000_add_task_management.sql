-- MIT task management: distinct businesses, departments and multi-category tasks.
-- Legal entities remain mit.entities; business lines are a separate taxonomy.
create table mit.task_businesses (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references mit.entities(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  color text not null default 'sky'
    check (color in ('slate','sky','emerald','amber','orange','rose','violet','cyan')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_id, id)
);
create unique index mit_task_businesses_name_unique
  on mit.task_businesses (entity_id, lower(name));

create table mit.task_departments (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references mit.entities(id) on delete cascade,
  business_id uuid not null,
  name text not null check (char_length(trim(name)) between 1 and 100),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_id, business_id, id),
  foreign key (entity_id, business_id)
    references mit.task_businesses (entity_id, id)
);
create unique index mit_task_departments_name_unique
  on mit.task_departments (entity_id, business_id, lower(name));

create table mit.task_categories (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references mit.entities(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  color text not null default 'slate'
    check (color in ('slate','sky','emerald','amber','orange','rose','violet','cyan')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_id, id)
);
create unique index mit_task_categories_name_unique
  on mit.task_categories (entity_id, lower(name));

create table mit.tasks (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references mit.entities(id) on delete cascade,
  business_id uuid,
  department_id uuid,
  assignee_id uuid,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  status text not null default 'todo'
    check (status in ('todo','in_progress','waiting','done','archived')),
  priority text not null default 'normal'
    check (priority in ('low','normal','high','urgent')),
  due_date date,
  due_time time(0) without time zone,
  due_timezone text not null default 'Asia/Tokyo'
    check (due_timezone = 'Asia/Tokyo'),
  completed_at timestamptz,
  created_by uuid not null references mit.app_users(user_id),
  updated_by uuid not null references mit.app_users(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_id, id),
  check (department_id is null or business_id is not null),
  check (due_time is null or due_date is not null),
  foreign key (entity_id, business_id)
    references mit.task_businesses(entity_id, id),
  foreign key (entity_id, business_id, department_id)
    references mit.task_departments(entity_id, business_id, id),
  foreign key (entity_id, assignee_id)
    references mit.entity_memberships(entity_id, user_id)
);
create index mit_tasks_entity_due_idx
  on mit.tasks (entity_id, due_date, due_time, created_at desc);
create index mit_tasks_entity_status_idx
  on mit.tasks (entity_id, status, priority, created_at desc);
create index mit_tasks_entity_business_idx
  on mit.tasks (entity_id, business_id, department_id);
create index mit_tasks_entity_assignee_idx
  on mit.tasks (entity_id, assignee_id);

create table mit.task_category_links (
  entity_id uuid not null references mit.entities(id) on delete cascade,
  task_id uuid not null,
  category_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (entity_id, task_id, category_id),
  foreign key (entity_id, task_id)
    references mit.tasks(entity_id, id) on delete cascade,
  foreign key (entity_id, category_id)
    references mit.task_categories(entity_id, id)
);
create index mit_task_category_links_category_idx
  on mit.task_category_links (entity_id, category_id, task_id);

create trigger task_businesses_set_updated_at before update on mit.task_businesses
  for each row execute function mit.set_updated_at();
create trigger task_departments_set_updated_at before update on mit.task_departments
  for each row execute function mit.set_updated_at();
create trigger task_categories_set_updated_at before update on mit.task_categories
  for each row execute function mit.set_updated_at();
create trigger tasks_set_updated_at before update on mit.tasks
  for each row execute function mit.set_updated_at();

create function mit.protect_task_record()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.id := old.id;
  new.entity_id := old.entity_id;
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  if new.status = 'done' and old.status is distinct from 'done' then
    new.completed_at := now();
  elsif new.status <> 'done' then
    new.completed_at := null;
  else
    new.completed_at := old.completed_at;
  end if;
  return new;
end;
$$;
create trigger tasks_protect_identity before update on mit.tasks
  for each row execute function mit.protect_task_record();

create function mit.set_task_completion_on_insert()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'done' then
    new.completed_at := now();
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;
create trigger tasks_set_completion_on_insert before insert on mit.tasks
  for each row execute function mit.set_task_completion_on_insert();

alter table mit.task_businesses enable row level security;
alter table mit.task_departments enable row level security;
alter table mit.task_categories enable row level security;
alter table mit.tasks enable row level security;
alter table mit.task_category_links enable row level security;

-- Reads: any active entity member. Writes: administrators manage taxonomy;
-- administrators and staff manage tasks. The existing membership table is
-- read through the caller's own RLS policy.
create policy task_businesses_read on mit.task_businesses for select to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_businesses.entity_id
    and m.user_id = (select auth.uid()) and m.status = 'active'));
create policy task_businesses_insert on mit.task_businesses for insert to authenticated
with check (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_businesses.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin')));
create policy task_businesses_update on mit.task_businesses for update to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_businesses.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin')))
with check (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_businesses.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin')));

create policy task_departments_read on mit.task_departments for select to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_departments.entity_id
    and m.user_id = (select auth.uid()) and m.status = 'active'));
create policy task_departments_insert on mit.task_departments for insert to authenticated
with check (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_departments.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin')));
create policy task_departments_update on mit.task_departments for update to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_departments.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin')))
with check (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_departments.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin')));

create policy task_categories_read on mit.task_categories for select to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_categories.entity_id
    and m.user_id = (select auth.uid()) and m.status = 'active'));
create policy task_categories_insert on mit.task_categories for insert to authenticated
with check (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_categories.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin')));
create policy task_categories_update on mit.task_categories for update to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_categories.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin')))
with check (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_categories.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin')));

create policy tasks_read on mit.tasks for select to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = tasks.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active'));
create policy tasks_insert on mit.tasks for insert to authenticated
with check (
  created_by = (select auth.uid()) and updated_by = (select auth.uid())
  and exists (select 1 from mit.entity_memberships m
    where m.entity_id = tasks.entity_id and m.user_id = (select auth.uid())
      and m.status = 'active' and m.role in ('owner','admin','staff'))
);
create policy tasks_update on mit.tasks for update to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = tasks.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin','staff')))
with check (
  updated_by = (select auth.uid())
  and exists (select 1 from mit.entity_memberships m
    where m.entity_id = tasks.entity_id and m.user_id = (select auth.uid())
      and m.status = 'active' and m.role in ('owner','admin','staff'))
);

create policy task_category_links_read on mit.task_category_links for select to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_category_links.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active'));
create policy task_category_links_insert on mit.task_category_links for insert to authenticated
with check (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_category_links.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin','staff')));
create policy task_category_links_delete on mit.task_category_links for delete to authenticated
using (exists (select 1 from mit.entity_memberships m
  where m.entity_id = task_category_links.entity_id and m.user_id = (select auth.uid())
    and m.status = 'active' and m.role in ('owner','admin','staff')));

grant select, insert, update on
  mit.task_businesses, mit.task_departments, mit.task_categories, mit.tasks
  to authenticated;
grant select, insert, delete on mit.task_category_links to authenticated;
grant select, insert, update, delete on
  mit.task_businesses, mit.task_departments, mit.task_categories,
  mit.tasks, mit.task_category_links to service_role;

create view public.mit_task_businesses with (security_invoker = true)
  as select * from mit.task_businesses;
create view public.mit_task_departments with (security_invoker = true)
  as select * from mit.task_departments;
create view public.mit_task_categories with (security_invoker = true)
  as select * from mit.task_categories;
create view public.mit_tasks with (security_invoker = true)
  as select * from mit.tasks;
create view public.mit_task_category_links with (security_invoker = true)
  as select * from mit.task_category_links;

revoke all on
  public.mit_task_businesses, public.mit_task_departments,
  public.mit_task_categories, public.mit_tasks, public.mit_task_category_links
  from public, anon;
grant select, insert, update on
  public.mit_task_businesses, public.mit_task_departments,
  public.mit_task_categories, public.mit_tasks to authenticated;
grant select, insert, delete on public.mit_task_category_links to authenticated;

-- Atomic task + category persistence, under the caller's RLS permissions.
create function public.mit_save_task(
  p_entity_id uuid,
  p_task_id uuid,
  p_title text,
  p_description text,
  p_business_id uuid,
  p_department_id uuid,
  p_assignee_id uuid,
  p_status text,
  p_priority text,
  p_due_date date,
  p_due_time time without time zone,
  p_category_ids uuid[]
)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_task_id uuid;
begin
  if coalesce(cardinality(p_category_ids), 0) > 12 then
    raise exception 'Too many task categories' using errcode = '22023';
  end if;

  if p_task_id is null then
    insert into mit.tasks (
      entity_id, title, description, business_id, department_id, assignee_id,
      status, priority, due_date, due_time, created_by, updated_by
    ) values (
      p_entity_id, trim(p_title), coalesce(p_description,''),
      p_business_id, p_department_id, p_assignee_id,
      p_status, p_priority, p_due_date, p_due_time,
      (select auth.uid()), (select auth.uid())
    ) returning id into v_task_id;
  else
    update mit.tasks
    set title = trim(p_title), description = coalesce(p_description,''),
        business_id = p_business_id, department_id = p_department_id,
        assignee_id = p_assignee_id, status = p_status, priority = p_priority,
        due_date = p_due_date, due_time = p_due_time, updated_by = (select auth.uid())
    where id = p_task_id and entity_id = p_entity_id
    returning id into v_task_id;
    if v_task_id is null then
      raise exception 'Task does not exist or permission denied' using errcode = '42501';
    end if;
  end if;

  delete from mit.task_category_links
   where entity_id = p_entity_id and task_id = v_task_id;
  insert into mit.task_category_links (entity_id, task_id, category_id)
    select p_entity_id, v_task_id, category_id
    from (select distinct unnest(coalesce(p_category_ids, '{}'::uuid[])) as category_id) categories;
  return v_task_id;
end;
$$;
revoke all on function public.mit_save_task(
  uuid,uuid,text,text,uuid,uuid,uuid,text,text,date,time without time zone,uuid[]
) from public, anon;
grant execute on function public.mit_save_task(
  uuid,uuid,text,text,uuid,uuid,uuid,text,text,date,time without time zone,uuid[]
) to authenticated;

-- Restrict the colleague picker to active members of the caller's MIT entity.
create function public.get_mit_task_members()
returns table (user_id uuid, display_name text, email text, role text)
language sql stable security definer set search_path = '' as $$
  select u.user_id, coalesce(nullif(u.display_name, ''), u.email),
         u.email, m.role
  from mit.app_users u
  join mit.entity_memberships m on m.user_id = u.user_id
  join mit.entities e on e.id = m.entity_id
  where exists (
    select 1 from mit.entity_memberships mine
    join mit.app_users caller on caller.user_id = mine.user_id
    where mine.entity_id = m.entity_id
      and mine.user_id = (select auth.uid())
      and mine.status = 'active'
      and caller.status = 'active'
  )
    and e.metadata ->> 'slug' = 'make-it-tech'
    and e.lifecycle_status = 'active'
    and m.status = 'active' and u.status = 'active'
  order by u.display_name nulls last, u.email;
$$;
revoke all on function public.get_mit_task_members() from public, anon;
grant execute on function public.get_mit_task_members() to authenticated;
notify pgrst, 'reload schema';