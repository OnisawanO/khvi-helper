BEGIN;

REVOKE INSERT ON TABLE public.reports FROM authenticated;

GRANT INSERT (category, title, description, reporter_id, booking_id)
  ON TABLE public.reports TO authenticated;

DROP POLICY IF EXISTS reports_insert_authenticated_system ON public.reports;

CREATE POLICY reports_insert_authenticated_system
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
        AND role IN ('User', 'Interpreter')
        AND is_locked = false
    )
    AND (
      booking_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.bookings
        WHERE booking_id = reports.booking_id
          AND (
            user_id = (SELECT auth.uid())
            OR interpreter_id = (SELECT auth.uid())
          )
      )
    )
  );

COMMIT;
