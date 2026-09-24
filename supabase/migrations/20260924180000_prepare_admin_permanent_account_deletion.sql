-- Preserve system reports while allowing a Primary Admin to permanently delete
-- the account that created the report or owned the referenced booking.

alter table public.reports
  alter column reporter_id drop not null;

alter table public.reports
  drop constraint if exists reports_reporter_fk;

alter table public.reports
  add constraint reports_reporter_fk
  foreign key (reporter_id)
  references public.profiles(user_id)
  on delete set null;

alter table public.reports
  drop constraint if exists reports_assigned_to_fk;

alter table public.reports
  add constraint reports_assigned_to_fk
  foreign key (assigned_to)
  references public.profiles(user_id)
  on delete set null;

alter table public.reports
  drop constraint if exists reports_booking_fk;

alter table public.reports
  add constraint reports_booking_fk
  foreign key (booking_id)
  references public.bookings(booking_id)
  on delete set null;
