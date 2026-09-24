-- Language and category names are non-sensitive reference data needed before sign-in.
grant usage on schema public to anon;
grant select on table public.languages, public.categories to anon;

drop policy if exists languages_read_anon on public.languages;
create policy languages_read_anon
  on public.languages
  for select
  to anon
  using (is_active = true);

drop policy if exists categories_read_anon on public.categories;
create policy categories_read_anon
  on public.categories
  for select
  to anon
  using (is_active = true);
