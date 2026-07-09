/*
  # Per-mission notification preferences

  Each mission now has independent push and SMS flags.
  Users choose at creation time and can toggle after.

  Defaults:
    notify_push = true   (web push on by default)
    notify_sms  = false  (SMS off by default — opt-in)
*/

ALTER TABLE public.secret_agent_missions
  ADD COLUMN IF NOT EXISTS notify_push boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_sms  boolean NOT NULL DEFAULT false;
