BEGIN;

ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_system_only_check;

DROP INDEX IF EXISTS public.reports_type_idx;

ALTER TABLE public.reports
  DROP COLUMN IF EXISTS report_type;

COMMIT;
