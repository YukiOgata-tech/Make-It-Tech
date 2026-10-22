drop policy expense_categories_write_admins on mit.expense_categories;

create policy expense_categories_insert_admins
on mit.expense_categories for insert to authenticated
with check (
  exists (
    select 1 from mit.entity_memberships membership
    where membership.entity_id = expense_categories.entity_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.role in ('owner', 'admin')
  )
);

create policy expense_categories_update_admins
on mit.expense_categories for update to authenticated
using (
  exists (
    select 1 from mit.entity_memberships membership
    where membership.entity_id = expense_categories.entity_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1 from mit.entity_memberships membership
    where membership.entity_id = expense_categories.entity_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.role in ('owner', 'admin')
  )
);

create policy expense_categories_delete_admins
on mit.expense_categories for delete to authenticated
using (
  exists (
    select 1 from mit.entity_memberships membership
    where membership.entity_id = expense_categories.entity_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.role in ('owner', 'admin')
  )
);

create index expense_records_created_by_idx on mit.expense_records (created_by);
create index expense_records_updated_by_idx on mit.expense_records (updated_by);
create index expense_records_confirmed_by_idx on mit.expense_records (confirmed_by)
  where confirmed_by is not null;
create index expense_receipt_files_uploaded_by_idx on mit.expense_receipt_files (uploaded_by);
create index expense_activity_logs_performed_by_idx on mit.expense_activity_logs (performed_by)
  where performed_by is not null;
