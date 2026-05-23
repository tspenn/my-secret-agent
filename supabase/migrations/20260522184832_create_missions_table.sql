/*
  # Create missions table

  1. New Tables
    - `missions`
      - `id` (uuid, primary key)
      - `name` (text) — user-facing mission name like "Operation: Blue Jeans"
      - `watch_type` (text) — one of: sale_price, severe_weather, bank_balance, stock_price
      - `target` (text) — what to monitor (URL, location, ticker, account)
      - `condition` (text) — the alarm trigger description
      - `status` (text) — current status message shown in green monospace
      - `active` (boolean) — whether the mission is running
      - `created_at` (timestamptz)
      - `user_id` (uuid) — ties mission to auth user (nullable for anonymous use)

  2. Security
    - Enable RLS
    - Authenticated users can only access their own missions
    - Anonymous users can insert/read missions with no user_id (session-local pattern)
*/

CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  watch_type text NOT NULL DEFAULT 'sale_price',
  target text NOT NULL DEFAULT '',
  condition text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Standing by...',
  active boolean NOT NULL DEFAULT true,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own missions"
  ON missions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions"
  ON missions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions"
  ON missions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own missions"
  ON missions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous (anon role) to manage missions without user_id
CREATE POLICY "Anon can insert missions"
  ON missions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anon can view missions"
  ON missions FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE POLICY "Anon can update missions"
  ON missions FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anon can delete missions"
  ON missions FOR DELETE
  TO anon
  USING (user_id IS NULL);
