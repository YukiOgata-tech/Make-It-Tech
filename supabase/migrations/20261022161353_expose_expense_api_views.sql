create view public.mit_expense_categories
with (security_invoker = true)
as select * from mit.expense_categories;

create view public.mit_expense_records
with (security_invoker = true)
as select * from mit.expense_records;

create view public.mit_expense_receipt_files
with (security_invoker = true)
as select * from mit.expense_receipt_files;

create view public.mit_expense_activity_logs
with (security_invoker = true)
as select * from mit.expense_activity_logs;

revoke all on public.mit_expense_categories from public, anon;
revoke all on public.mit_expense_records from public, anon;
revoke all on public.mit_expense_receipt_files from public, anon;
revoke all on public.mit_expense_activity_logs from public, anon;

grant select, insert, update, delete on public.mit_expense_categories to authenticated;
grant select, insert, update on public.mit_expense_records to authenticated;
grant select, insert, delete on public.mit_expense_receipt_files to authenticated;
grant select on public.mit_expense_activity_logs to authenticated;

comment on view public.mit_expense_categories is
  'RLS-preserving Data API view for mit.expense_categories.';
comment on view public.mit_expense_records is
  'RLS-preserving Data API view for mit.expense_records.';
comment on view public.mit_expense_receipt_files is
  'RLS-preserving Data API view for mit.expense_receipt_files.';
comment on view public.mit_expense_activity_logs is
  'RLS-preserving Data API view for mit.expense_activity_logs.';
