-- Keep interpreter accreditation revocation consistent across the profile and
-- application records. The Edge Function is the only caller allowed to run
-- this transition, so the actor is passed explicitly after the function has
-- verified the caller's JWT with the service role client.

create or replace function public.revoke_interpreter_access(
  p_actor_user_id uuid,
  p_target_user_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_role text;
  actor_admin_level text;
  actor_is_locked boolean;
  target_role text;
  target_application_id bigint;
  target_application_status text;
  now_utc timestamptz := timezone('utc', now());
  clean_reason text := left(trim(coalesce(p_reason, '')), 1000);
begin
  if p_actor_user_id is null or p_target_user_id is null then
    raise exception 'actor_and_target_required';
  end if;

  if clean_reason = '' then
    raise exception 'revocation_reason_required';
  end if;

  select role, admin_level, is_locked
  into actor_role, actor_admin_level, actor_is_locked
  from public.profiles
  where user_id = p_actor_user_id
  for update;

  if actor_role is distinct from 'Admin'
     or actor_admin_level is distinct from 'primary'
     or actor_is_locked is distinct from false then
    raise exception 'primary_admin_required';
  end if;

  select role
  into target_role
  from public.profiles
  where user_id = p_target_user_id
  for update;

  if target_role is null then
    raise exception 'target_profile_not_found';
  end if;

  if target_role <> 'Interpreter' then
    raise exception 'active_interpreter_required';
  end if;

  select application_id, status
  into target_application_id, target_application_status
  from public.interpreter_applications
  where user_id = p_target_user_id
    and status = 'approved'
  order by reviewed_at desc nulls last, application_id desc
  limit 1
  for update;

  if target_application_id is null or target_application_status <> 'approved' then
    raise exception 'approved_application_not_found';
  end if;

  update public.interpreter_applications
  set status = 'rejected',
      reject_reason = 'Interpreter accreditation revoked: ' || clean_reason,
      revision_note = null,
      reviewed_at = now_utc,
      reviewed_by_user_id = p_actor_user_id
  where application_id = target_application_id
    and status = 'approved';

  if not found then
    raise exception 'application_revoke_update_failed';
  end if;

  update public.profiles
  set role = 'User',
      admin_level = null,
      interpreter_access_status = 'revoked'
  where user_id = p_target_user_id
    and role = 'Interpreter';

  if not found then
    raise exception 'profile_revoke_update_failed';
  end if;

  return jsonb_build_object(
    'user_id', p_target_user_id,
    'role', 'User',
    'interpreter_access_status', 'revoked',
    'application_id', target_application_id,
    'application_status', 'rejected'
  );
end;
$$;

revoke all on function public.revoke_interpreter_access(uuid, uuid, text) from public;
grant execute on function public.revoke_interpreter_access(uuid, uuid, text) to service_role;
