/*
  # Add app_id to user_push_subscriptions

  The user_push_subscriptions table is shared across all Skyland apps in the
  same Supabase project. Adding app_id lets each app:
    1. Register subscriptions scoped to its own VAPID key pair
    2. Only send push notifications to devices subscribed to that specific app
    3. Avoid cross-app notification bleed

  Existing rows default to 'friday' (the original app).

  Convention: app_id values match the app slug used in skyland_app_inbox
    - 'friday'        — FRIDAY Canvas
    - 'secret-agent'  — My Secret Agent
    - 'gonews'        — GoNews
    - 'goshop'        — GoShop
    - 'my-money'      — My Money
*/

ALTER TABLE public.user_push_subscriptions
  ADD COLUMN IF NOT EXISTS app_id text NOT NULL DEFAULT 'friday';

CREATE INDEX IF NOT EXISTS idx_ups_app_id
  ON public.user_push_subscriptions(app_id);

CREATE INDEX IF NOT EXISTS idx_ups_user_app
  ON public.user_push_subscriptions(user_id, app_id);
