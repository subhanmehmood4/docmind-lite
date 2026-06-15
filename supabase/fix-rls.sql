-- Run this in Supabase SQL Editor if uploads fail with RLS errors

alter table documents disable row level security;

drop policy if exists "docmind_demo_all" on documents;
create policy "docmind_demo_all"
  on documents
  for all
  to anon, authenticated
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant all on table documents to anon, authenticated;
grant execute on function match_documents(vector, int) to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
