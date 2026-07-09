/*
  # Schedule mission-watcher Edge Function via pg_cron

  Prerequisites (do once in Supabase Dashboard → Settings → Database → Extensions):
    1. Enable "pg_cron"
    2. Enable "pg_net"

  NOTE: This cron job is already live on the Friday Canvas Supabase project
  (psbdjnqcjpxapypcfigx) running on schedule '0 * * * *' (every hour at :00).
  The job was created manually with the real project ref and service role key.

  To recreate or update the job, run in the SQL editor:

    SELECT cron.unschedule('secret-agent-mission-watcher');

  Then re-run this migration with real values substituted below.
  The service role key is in: Dashboard → Settings → API → service_role (secret key)
*/

SELECT cron.schedule(
  'secret-agent-mission-watcher',           -- job name (unique)
  '0 * * * *',                              -- every hour at :00
  $$
  SELECT net.http_post(
    url     := 'https://psbdjnqcjpxapypcfigx.supabase.co/functions/v1/mission-watcher',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body    := '{"source":"cron"}'::jsonb
  )
  $$
);
