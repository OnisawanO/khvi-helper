-- A fresh approval after a real accreditation revocation restores access.
create or replace function private.reset_interpreter_access_on_approval()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'approved'
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    update public.profiles
    set interpreter_access_status = 'active'
    where user_id = new.user_id;
  end if;

  return new;
end;
$$;

revoke all on function private.reset_interpreter_access_on_approval() from public;

drop trigger if exists interpreter_access_reset_on_approval on public.interpreter_applications;
create trigger interpreter_access_reset_on_approval
  after insert or update of status on public.interpreter_applications
  for each row
  execute function private.reset_interpreter_access_on_approval();
