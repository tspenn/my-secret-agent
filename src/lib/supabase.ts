import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Watch types ──────────────────────────────────────────────────────────────

export type WatchType =
  | 'sale_price'
  | 'severe_weather'
  | 'bank_balance'
  | 'stock_price'
  | 'crypto_price'
  | 'earthquake'
  | 'air_quality'
  | 'website_change'
  | 'rss_feed'
  | 'news_keyword';

export type ConditionOperator = 'below' | 'above' | 'equals' | 'contains' | 'changes';

// ─── secret_agent_missions ────────────────────────────────────────────────────

export interface SecretAgentMission {
  id: string;
  user_id: string;
  codename: string;
  watch_type: WatchType;
  target: string;
  condition_text: string;
  condition_operator: ConditionOperator | null;
  condition_value: number | null;
  active: boolean;
  status_message: string;
  last_checked_at: string | null;
  last_alert_sent_at: string | null;
  last_value: string | null;
  check_interval_minutes: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type NewMission = Omit<
  SecretAgentMission,
  'id' | 'last_checked_at' | 'last_alert_sent_at' | 'last_value' | 'created_at' | 'updated_at'
>;

// ─── secret_agent_alerts ──────────────────────────────────────────────────────

export interface SecretAgentAlert {
  id: string;
  mission_id: string;
  user_id: string;
  alert_type: 'condition_met' | 'check_error' | 'check_ok';
  message: string;
  payload: Record<string, unknown>;
  triggered_at: string;
}

// ─── Condition parser ─────────────────────────────────────────────────────────
// Parses a natural-language condition string into structured operator + value.
// Examples:
//   "price drops below $50"  → { operator: 'below', value: 50 }
//   "goes above 200"         → { operator: 'above', value: 200 }
//   "any severe weather"     → { operator: 'above', value: 44 }  (WMO code threshold)
//   "balance drops below 500" → { operator: 'below', value: 500 }

export function parseCondition(text: string): {
  operator: ConditionOperator;
  value: number | null;
} {
  const below = text.match(
    /(?:drops?\s+)?(?:below|under|less\s+than)\s*\$?\s*([\d,]+(?:\.\d+)?)/i
  );
  if (below) return { operator: 'below', value: parseFloat(below[1].replace(/,/g, '')) };

  const above = text.match(
    /(?:rises?\s+|goes?\s+)?(?:above|over|more\s+than|exceeds?)\s*\$?\s*([\d,]+(?:\.\d+)?)/i
  );
  if (above) return { operator: 'above', value: parseFloat(above[1].replace(/,/g, '')) };

  const equals = text.match(/(?:equals?|reaches?|hits?)\s*\$?\s*([\d,]+(?:\.\d+)?)/i);
  if (equals) return { operator: 'equals', value: parseFloat(equals[1].replace(/,/g, '')) };

  const severeWeather = /severe|storm|warning|alert|thunder|hurricane|tornado|blizzard|hail/i.test(text);
  if (severeWeather) return { operator: 'above', value: 44 };

  const anyChange = /change|update|different|new|any/i.test(text);
  if (anyChange) return { operator: 'changes', value: null };

  return { operator: 'changes', value: null };
}

// ─── Legacy Mission type (original missions table — kept for backward compat) ─

/** @deprecated Use SecretAgentMission instead */
export interface Mission {
  id: string;
  name: string;
  watch_type: WatchType;
  target: string;
  condition: string;
  status: string;
  active: boolean;
  created_at: string;
}
