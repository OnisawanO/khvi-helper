-- Keep requester and interpreter workspaces in sync when a booking changes.
-- The application also refreshes on a short interval so the core flow remains
-- usable while Realtime is reconnecting or before this migration is deployed.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end;
$$;
