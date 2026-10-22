create function public.get_mit_admin_access()
returns table (
  user_id uuid,
  email text,
  entity_id uuid,
  role text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    app_user.user_id,
    app_user.email,
    membership.entity_id,
    membership.role
  from mit.app_users app_user
  join mit.entity_memberships membership
    on membership.user_id = app_user.user_id
  join mit.entities entity
    on entity.id = membership.entity_id
  where app_user.user_id = (select auth.uid())
    and app_user.status = 'active'
    and membership.status = 'active'
    and entity.lifecycle_status = 'active'
    and entity.metadata ->> 'slug' = 'make-it-tech'
  limit 1;
$$;

revoke all on function public.get_mit_admin_access() from public;
revoke all on function public.get_mit_admin_access() from anon;
grant execute on function public.get_mit_admin_access() to authenticated;

comment on function public.get_mit_admin_access() is
  'Returns the active caller membership for the Make It Tech organization. The function accepts no user-controlled identity.';
