/*
  Recreate secret-agent-mission-watcher cron without an Authorization JWT.

  The previous job sent Bearer <service_role>, which the Edge Function gateway
  rejected with 401 (function never ran; missions stayed last_checked_at null).

  Cron authenticates with x-cron-job instead. verify_jwt stays off on
  mission-watcher. Timeout is 60s so news/price checks can finish.
*/

SELECT cron.unschedule('secret-agent-mission-watcher');

SELECT cron.schedule(
  'secret-agent-mission-watcher',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://psbdjnqcjpxapypcfigx.supabase.co/functions/v1/mission-watcher',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-job', 'secret-agent-mission-watcher'
    ),
    body := '{"source":"cron"}'::jsonb,
    timeout_milliseconds := 60000
  )
  $$
);
