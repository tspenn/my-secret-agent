/*
  # Extend secret_agent_missions.watch_type with 6 new mission types

  New types:
    - crypto_price       (CoinGecko, no key)
    - earthquake         (USGS, no key)
    - air_quality        (Open-Meteo, no key)
    - website_change     (HTML hash diff, no key)
    - rss_feed           (RSS/Atom poll, no key)
    - news_keyword       (Currents API — requires CURRENTS_API_KEY in edge fn secrets)
*/

ALTER TABLE secret_agent_missions
  DROP CONSTRAINT IF EXISTS secret_agent_missions_watch_type_check;

ALTER TABLE secret_agent_missions
  ADD CONSTRAINT secret_agent_missions_watch_type_check
  CHECK (watch_type IN (
    'severe_weather',
    'sale_price',
    'bank_balance',
    'stock_price',
    'crypto_price',
    'earthquake',
    'air_quality',
    'website_change',
    'rss_feed',
    'news_keyword'
  ));
