BEGIN;

GRANT USAGE, SELECT
  ON SEQUENCE public.reports_report_id_seq
  TO authenticated;

COMMIT;
