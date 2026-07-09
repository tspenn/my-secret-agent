/*
  # Add phone number and SMS opt-in to profiles

  Allows users to register a phone number for SMS alerts.
  SMS alerts are only sent when:
    1. profiles.sms_enabled = true
    2. profiles.phone IS NOT NULL
    3. profiles.tier = 'agency' (SMS is an Agency-tier feature)
*/

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS sms_enabled boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_phone
  ON public.profiles(phone)
  WHERE phone IS NOT NULL;
