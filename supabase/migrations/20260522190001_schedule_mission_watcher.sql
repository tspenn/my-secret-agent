/*
  # Schedule mission-watcher Edge Function via pg_cron

  Prerequisites (do once in Supabase Dashboard → Settings → Database → Extensions):
    1. Enable "pg_cron"
    2. Enable "pg_net"

  After running this migration, replace the two placeholder values:
    - YOUR_PROJECT_REF  → your Supabase project reference (e.g. abcdefghijkl)
    - YOUR_SERVICE_ROLE_KEY → from Dashboard → Settings → API → service_role key

  To update an existing job, call cron.unschedule first, then re-run.
*/

SELECT cron.schedule(
  'secret-agent-mission-watcher',           -- job name (unique)
  '0 * * * *',                              -- every hour at :00
  $$
  SELECT net.http_post(
    url     := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/mission-watcher',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body    := '{"source":"cron"}'::jsonb
  )
  $$
);
