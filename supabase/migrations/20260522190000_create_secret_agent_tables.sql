/*
  # Secret Agent / GIA — Core Tables

  1. secret_agent_missions
     - Stores each user-defined watch mission
     - Typed: severe_weather, sale_price, bank_balance, stock_price
     - Stores parsed condition_operator + condition_value alongside raw condition_text
     - Tracks last_checked_at and last_alert_sent_at for the cron watcher
     - metadata JSONB stores type-specific state (geocoded coords, last scraped price, etc.)

  2. secret_agent_alerts
     - Immutable log of every alert fired per mission
     - Drives the Command Center live feed

  Notes:
  - Additive only — no existing tables are modified
  - Shares auth.users with FRIDAY Canvas, GoShop, GoTRVL, LnkLokr
  - RLS: authenticated users can only see/manage their own rows
*/

-- ─── Missions ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS secret_agent_missions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  codename               text        NOT NULL,
  watch_type             text        NOT NULL
                                     CHECK (watch_type IN ('severe_weather','sale_price','bank_balance','stock_price')),
  target                 text        NOT NULL,          -- url, city, ticker, account label
  condition_text         text        NOT NULL,          -- raw human description
  condition_operator     text        CHECK (condition_operator IN ('below','above','equals','contains','changes')),
  condition_value        numeric,                       -- numeric threshold when applicable
  active                 boolean     NOT NULL DEFAULT true,
  status_message         text        NOT NULL DEFAULT 'Standing by...',
  last_checked_at        timestamptz,
  last_alert_sent_at     timestamptz,
  last_value             text,                          -- last fetched value for display
  check_interval_minutes int         NOT NULL DEFAULT 60,
  metadata               jsonb       NOT NULL DEFAULT '{}',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE secret_agent_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sam_select_own"
  ON secret_agent_missions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "sam_insert_own"
  ON secret_agent_missions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sam_update_own"
  ON secret_agent_missions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sam_delete_own"
  ON secret_agent_missions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Service role (edge functions) can update check state and alerts
CREATE POLICY "sam_service_update"
  ON secret_agent_missions FOR UPDATE
  TO service_role USING (true) WITH CHECK (true);

-- Indexes for cron performance
CREATE INDEX IF NOT EXISTS idx_sam_active_check
  ON secret_agent_missions(active, last_checked_at)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_sam_user_id
  ON secret_agent_missions(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION _update_sam_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sam_updated_at
  BEFORE UPDATE ON secret_agent_missions
  FOR EACH ROW EXECUTE FUNCTION _update_sam_updated_at();


-- ─── Alerts (immutable event log) ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS secret_agent_alerts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id   uuid        NOT NULL REFERENCES secret_agent_missions(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type   text        NOT NULL CHECK (alert_type IN ('condition_met','check_error','check_ok')),
  message      text        NOT NULL,
  payload      jsonb       NOT NULL DEFAULT '{}',  -- e.g. { wmo_code: 71, value: 42.50 }
  triggered_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE secret_agent_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saa_select_own"
  ON secret_agent_alerts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "saa_service_insert"
  ON secret_agent_alerts FOR INSERT
  TO service_role WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_saa_user_recent
  ON secret_agent_alerts(user_id, triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_saa_mission
  ON secret_agent_alerts(mission_id, triggered_at DESC);
