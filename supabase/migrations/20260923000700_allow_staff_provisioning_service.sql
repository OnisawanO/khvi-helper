-- The create-manager-account Edge Function uses Supabase's service_role.
-- Explicit grants are required because profiles privileges are restricted by
-- earlier migrations; RLS remains enabled for all client-facing roles.

grant select, update on table public.profiles to service_role;
