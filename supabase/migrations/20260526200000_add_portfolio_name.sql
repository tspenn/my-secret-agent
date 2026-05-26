/*
  # Add portfolio_name to secret_agent_missions

  GIA users group missions into named intelligence portfolios
  (e.g. "Tech Sector Watch", "Competitor Intel", "Market Signals").

  This is an additive, nullable column — existing missions are unaffected.
*/

ALTER TABLE secret_agent_missions
  ADD COLUMN IF NOT EXISTS portfolio_name text;

COMMENT ON COLUMN secret_agent_missions.portfolio_name IS
  'GIA: optional portfolio grouping label (e.g. "Tech Sector Watch")';

CREATE INDEX IF NOT EXISTS idx_sam_portfolio
  ON secret_agent_missions(user_id, portfolio_name)
  WHERE portfolio_name IS NOT NULL;
