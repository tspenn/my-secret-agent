/*
  # Schedule weekly-digest edge function

  Runs every Sunday night at 10 pm ET (Monday 02:00 UTC).
  Cron: 0 2 * * 1  → minute 0, hour 2, any day-of-month, any month, Monday (= end of Sunday)

  Only fires for agency-tier users.
  Requires RESEND_API_KEY set in Edge Function secrets.
*/

select cron.schedule(
  'weekly-digest-sunday-night',
  '0 2 * * 1',
  $$
  select net.http_post(
    url     := 'https://psbdjnqcjpxapypcfigx.supabase.co/functions/v1/weekly-digest',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body    := '{}'::jsonb
  )
  $$
);
