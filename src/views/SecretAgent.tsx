import { useState, useEffect, useRef } from 'react';
import {
  Eye, Shield, Cloud, Tag, Settings, Bell, BellOff, LogOut, LogIn, TrendingUp,
  Bitcoin, Activity, Wind, Globe, Rss, Newspaper, X, MessageSquare, Phone,
} from 'lucide-react';
import { supabase, type SecretAgentMission, type WatchType, type NewMission, parseCondition } from '../lib/supabase';
import { signOut } from '../lib/auth';
import { pushSupported, getPushPermission, enablePushNotifications, disablePushNotifications } from '../lib/pushNotifications';
import AuthModal from '../components/AuthModal';
import AdCard from '../components/AdCard';
import AdSidebar from '../components/AdSidebar';
import type { AuthState } from '../lib/auth';
import { MODE, atMissionLimit } from '../lib/appMode';
import { ADS, adsWithMedia } from '../lib/ads';

type UserTier = 'free' | 'agent' | 'network';

// ─── Static config ────────────────────────────────────────────────────────────

const WATCH_OPTIONS: { value: WatchType; label: string; placeholder: { target: string; condition: string } }[] = [
  {
    value: 'sale_price',
    label: 'A Sale Price',
    placeholder: { target: 'https://store.com/product', condition: 'price drops below $50' },
  },
  {
    value: 'severe_weather',
    label: 'Severe Weather',
    placeholder: { target: 'Miami, FL', condition: 'any severe weather warning' },
  },
  {
    value: 'bank_balance',
    label: 'My Bank Balance',
    placeholder: { target: 'checking account', condition: 'balance drops below $500' },
  },
  {
    value: 'stock_price',
    label: 'A Stock Price',
    placeholder: { target: 'AAPL', condition: 'price drops below $150' },
  },
  {
    value: 'crypto_price',
    label: 'A Crypto Price',
    placeholder: { target: 'bitcoin', condition: 'drops below $60000' },
  },
  {
    value: 'earthquake',
    label: 'Earthquake Activity',
    placeholder: { target: 'California', condition: 'magnitude above 4.5' },
  },
  {
    value: 'air_quality',
    label: 'Air Quality',
    placeholder: { target: 'Los Angeles, CA', condition: 'AQI above 100' },
  },
  {
    value: 'website_change',
    label: 'A Website Change',
    placeholder: { target: 'https://example.com/page', condition: 'any change appears' },
  },
  {
    value: 'rss_feed',
    label: 'An RSS Feed',
    placeholder: { target: 'https://blog.com/feed.xml', condition: 'a new post is published' },
  },
  {
    value: 'news_keyword',
    label: 'News for a Keyword',
    placeholder: { target: 'tesla recall', condition: 'any new article appears' },
  },
];

const WATCH_ICONS: Record<WatchType, typeof Eye> = {
  sale_price: Tag,
  severe_weather: Cloud,
  bank_balance: Shield,
  stock_price: TrendingUp,
  crypto_price: Bitcoin,
  earthquake: Activity,
  air_quality: Wind,
  website_change: Globe,
  rss_feed: Rss,
  news_keyword: Newspaper,
};

const WATCH_STATUS: Record<WatchType, string> = {
  sale_price: 'Scanning price feeds — no movement yet.',
  severe_weather: 'Monitoring atmospheric conditions.',
  bank_balance: 'Eyes on the account. All quiet.',
  stock_price: 'Tracking market activity.',
  crypto_price: 'Watching the chain — markets steady.',
  earthquake: 'Listening to seismic feeds.',
  air_quality: 'Sampling the atmosphere.',
  website_change: 'Watching the page for any movement.',
  rss_feed: 'Awaiting the next dispatch.',
  news_keyword: 'Scanning news wires.',
};

const TICKER_TEXT =
  '[ SYSTEM SECURE ] · ALL AGENTS ACTIVE · WATCHING THE GRID · NO ANOMALIES DETECTED · CHANNEL ENCRYPTED · STANDING BY · ';

function missionCodename(): string {
  const adj = ['BLUE', 'GOLDEN', 'SILENT', 'IRON', 'CRIMSON', 'AMBER', 'SILVER', 'DARK', 'SWIFT', 'HOLLOW'];
  const noun = ['FALCON', 'LOTUS', 'CLOCK', 'CURTAIN', 'SIGNAL', 'NEEDLE', 'SPARROW', 'DESK', 'ANCHOR', 'VIPER'];
  return `Operation: ${adj[Math.floor(Math.random() * adj.length)]} ${noun[Math.floor(Math.random() * noun.length)]}`;
}

function Ticker() {
  const full = TICKER_TEXT.repeat(4);
  return (
    <div className="overflow-hidden border-t border-amber-900/30 bg-[#111111] py-2.5">
      <div className="ticker-scroll font-mono text-xs text-green-500/60 tracking-widest whitespace-nowrap">
        {full}{full}
      </div>
    </div>
  );
}

function MissionCard({
  mission,
  onDeactivate,
}: {
  mission: SecretAgentMission;
  onDeactivate: (id: string) => void;
}) {
  const Icon = WATCH_ICONS[mission.watch_type as WatchType] ?? Eye;
  const isAlert = mission.status_message.startsWith('⚠') || mission.status_message.startsWith('✓');

  return (
    <div className="mission-card flex items-start gap-4 bg-[#232323] border border-[#333] rounded-sm p-5 group">
      <div className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-sm bg-[#1a1a1a] border border-[#333] flex-shrink-0">
        <Icon size={15} className={isAlert ? 'text-amber-400 animate-pulse' : 'text-amber-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#f5f0e8] font-semibold text-sm tracking-wide mb-1 truncate">{mission.codename}</p>
        <p className={`font-mono text-[13px] leading-relaxed truncate ${isAlert ? 'text-amber-400/90' : 'text-green-400/80'}`}>
          {mission.status_message}
        </p>
        <p className="font-mono text-[12px] text-[#a0a0a0] mt-1 truncate">
          TARGET: {mission.target || '—'} · TRIGGER: {mission.condition_text || '—'}
        </p>
        {mission.last_checked_at && (
          <p className="font-mono text-[13px] text-[#8a8a8a] mt-0.5">
            Last check: {new Date(mission.last_checked_at).toLocaleString()}
          </p>
        )}
      </div>
      <button
        onClick={() => onDeactivate(mission.id)}
        className="flex-shrink-0 text-[12px] font-mono uppercase tracking-widest text-red-700 hover:text-red-400 transition-colors duration-150 opacity-0 group-hover:opacity-100 pt-0.5"
      >
        Deactivate
      </button>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function SecretAgent({
  auth,
  onSwitchMode,
}: {
  auth: AuthState;
  onSwitchMode: () => void;
}) {
  const [watchType, setWatchType] = useState<WatchType>('sale_price');
  const [target, setTarget] = useState('');
  const [condition, setCondition] = useState('');
  const [missions, setMissions] = useState<SecretAgentMission[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<string>('default');
  const [activating, setActivating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [showVanUpgradePrompt, setShowVanUpgradePrompt] = useState(false);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSmsEnabled, setProfileSmsEnabled] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [newNotifyPush, setNewNotifyPush] = useState(true);
  const [newNotifySms, setNewNotifySms] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = auth.user;
  const MISSION_LIMIT = MODE.missionLimit;

  useEffect(() => {
    if (user) {
      loadMissions();
      fetchUserTier();
    } else {
      setMissions([]);
      setUserTier('free');
    }
  }, [user]);

  async function fetchUserTier() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tier, phone, sms_enabled')
        .eq('id', user.id)
        .maybeSingle();
      if (error || !data) {
        setUserTier('free');
        return;
      }
      const row = data as { tier?: string; phone?: string | null; sms_enabled?: boolean };
      const t = row.tier;
      if (t === 'agent' || t === 'network') {
        setUserTier(t);
      } else {
        setUserTier('free');
      }
      setProfilePhone(row.phone ?? '');
      setProfileSmsEnabled(row.sms_enabled ?? false);
    } catch {
      setUserTier('free');
    }
  }

  async function saveProfileSettings() {
    if (!user) return;
    setSettingsSaving(true);
    setSettingsSaved(false);
    const phone = profilePhone.trim() || null;
    await supabase
      .from('profiles')
      .upsert({ id: user.id, phone, sms_enabled: profileSmsEnabled }, { onConflict: 'id' });
    setSettingsSaving(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  }

  function handleVanClick() {
    if (userTier !== 'network') {
      setShowVanUpgradePrompt(true);
    } else {
      setShowVanUpgradePrompt(false);
      onSwitchMode();
    }
  }

  useEffect(() => {
    getPushPermission().then((p) => setPushPermission(p));
    // Check if already subscribed
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/sw.js').then(async (reg) => {
        if (!reg) return;
        const sub = await reg.pushManager.getSubscription();
        setPushEnabled(!!sub);
      });
    }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const activeMissions = missions.filter((m) => m.active);
    setLimitReached(atMissionLimit(activeMissions.length));
  }, [missions]);

  async function loadMissions() {
    if (!user) return;
    const { data } = await supabase
      .from('secret_agent_missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (data) setMissions(data as SecretAgentMission[]);
  }

  async function activateMission() {
    if (!target.trim() || !condition.trim()) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (limitReached) return;

    setActivating(true);

    const { operator, value } = parseCondition(condition);

    const newMission: NewMission = {
      user_id: user.id,
      codename: missionCodename(),
      watch_type: watchType,
      target: target.trim(),
      condition_text: condition.trim(),
      condition_operator: operator,
      condition_value: value,
      status_message: WATCH_STATUS[watchType],
      active: true,
      check_interval_minutes: 60,
      notify_push: newNotifyPush,
      notify_sms: newNotifySms,
      metadata: {},
    };

    const { data } = await supabase
      .from('secret_agent_missions')
      .insert(newMission)
      .select()
      .maybeSingle();

    if (data) setMissions((prev) => [data as SecretAgentMission, ...prev]);
    setTarget('');
    setCondition('');
    setActivating(false);
  }

  async function deactivateMission(id: string) {
    await supabase.from('secret_agent_missions').update({ active: false }).eq('id', id);
    setMissions((prev) => prev.filter((m) => m.id !== id));
  }

  async function togglePush() {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (pushEnabled) {
      await disablePushNotifications(user.id);
      setPushEnabled(false);
      setPushPermission('default');
    } else {
      const success = await enablePushNotifications(user.id);
      if (success) {
        setPushEnabled(true);
        setPushPermission('granted');
      } else {
        setPushPermission(await getPushPermission());
      }
    }
  }

  const selectedOption = WATCH_OPTIONS.find((o) => o.value === watchType)!;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f5f0e8] flex flex-col font-['DM_Sans',sans-serif]">

      {/* Header */}
      <header className="border-b border-[#2e2e2e] px-6 py-4 flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="pulse-dot" />
          <span className="font-sans font-semibold text-sm tracking-[0.25em] uppercase text-[#f5f0e8]">
            {MODE.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleVanClick}
            className="text-[12px] font-mono uppercase tracking-widest text-[#8a8a8a] hover:text-amber-400 transition-colors duration-150 border border-[#333] hover:border-amber-500/40 px-2.5 py-1.5 rounded-sm"
          >
            The Van
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block font-mono text-[13px] text-[#a0a0a0] max-w-[120px] truncate">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#333] hover:border-red-500/40 transition-colors duration-200 text-[#a0a0a0] hover:text-red-400"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-widest text-[#a0a0a0] hover:text-amber-400 transition-colors duration-150 border border-[#333] hover:border-amber-500/40 px-2.5 py-1.5 rounded-sm"
            >
              <LogIn size={11} />
              Sign In
            </button>
          )}

          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#333] hover:border-amber-500/50 transition-colors duration-200 text-[#a0a0a0] hover:text-amber-400"
            title="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </header>

      {/* Sidebar + content layout — sidebars only visible on large screens for free users */}
      <div className="flex-1 flex gap-4 max-w-7xl mx-auto w-full px-4 py-12 md:py-16">

        {userTier === 'free' && <AdSidebar ads={adsWithMedia()} side="left" />}

        <main className="flex-1 min-w-0 px-2">

        {/* The Van upgrade prompt — shown inline when a free-tier user clicks The Van */}
        {showVanUpgradePrompt && (
          <div className="mb-8 flex items-start gap-4 bg-amber-500/10 border border-amber-500/30 rounded-sm px-5 py-4">
            <div className="flex-1">
              <p className="font-mono text-[13px] text-amber-400 tracking-wide leading-relaxed">
                The Van is where your handler watches everything. Upgrade to Network to unlock it.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="mt-3 inline-block font-mono text-[12px] uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-[#1a1a1a] font-semibold px-4 py-1.5 rounded-sm transition-colors duration-150"
              >
                Upgrade
              </button>
            </div>
            <button
              onClick={() => setShowVanUpgradePrompt(false)}
              className="text-[#8a8a8a] hover:text-amber-400 transition-colors mt-0.5 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Briefing form */}
        <section className="mb-14">
          <p className="font-mono text-[12px] text-amber-400/90 tracking-[0.3em] uppercase mb-8">
            — Classified Briefing Form —
          </p>

          <div className="briefing-form text-2xl md:text-3xl text-[#f5f0e8] leading-loose font-light">
            <span>I want to watch</span>{' '}

            <span className="relative inline-block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="inline-flex items-center gap-1 border-b-2 border-amber-500/60 hover:border-amber-400 focus:border-amber-400 outline-none transition-colors duration-150 text-amber-400 font-semibold pb-0.5 cursor-pointer"
              >
                {selectedOption.label}
                <span className="text-amber-500/40 text-base ml-0.5">▾</span>
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 bg-[#232323] border border-[#3a3a3a] rounded-sm shadow-2xl z-50 min-w-[200px]">
                  {WATCH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setWatchType(opt.value); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-normal transition-colors duration-100 ${
                        watchType === opt.value
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-[#c8c0b0] hover:bg-[#2e2e2e] hover:text-[#f5f0e8]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </span>

            <span>. Monitor it here:</span>{' '}
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={selectedOption.placeholder.target}
              className="ledger-input"
            />
            <span>. Sound the alarm when</span>{' '}
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder={selectedOption.placeholder.condition}
              className="ledger-input"
              onKeyDown={(e) => e.key === 'Enter' && activateMission()}
            />
            <span>.</span>
          </div>

          <div className="mt-10 flex flex-col items-start gap-5">

            {/* Per-mission notification preference */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] text-[#777] uppercase tracking-[0.2em]">If this happens, notify me via:</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewNotifyPush((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-mono text-[12px] uppercase tracking-widest transition-colors duration-150 ${
                    newNotifyPush
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-[#333] text-[#666] hover:border-[#555] hover:text-[#999]'
                  }`}
                >
                  <Bell size={11} />
                  Push
                </button>
                <button
                  type="button"
                  onClick={() => setNewNotifySms((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-mono text-[12px] uppercase tracking-widest transition-colors duration-150 ${
                    newNotifySms
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-[#333] text-[#666] hover:border-[#555] hover:text-[#999]'
                  }`}
                >
                  <MessageSquare size={11} />
                  SMS
                </button>
              </div>
              {newNotifySms && !profilePhone && (
                <p className="font-mono text-[11px] text-amber-500/70">
                  Add your phone number in Settings to receive texts.
                </p>
              )}
            </div>

            {/* Mission limit warning */}
            {limitReached && user && (
              <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-sm px-4 py-3">
                <p className="font-mono text-[12px] text-amber-500/80 tracking-wide">
                  MISSION LIMIT REACHED ({MISSION_LIMIT}/{MISSION_LIMIT}) — Deactivate your mission or{' '}
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                  >
                    upgrade to Agent ($4.99/mo, up to 10 missions)
                  </button>{' '}
                  for up to 10 missions.
                </p>
              </div>
            )}

            <button
              onClick={activateMission}
              disabled={activating || !target.trim() || !condition.trim() || (limitReached && !!user)}
              className="activate-btn"
            >
              {activating
                ? 'Activating...'
                : !user
                  ? 'Activate Agent (Sign In Required)'
                  : 'Activate Agent'}
            </button>

            {/* Push notifications toggle */}
            {pushPermission !== 'unsupported' && pushSupported() && (
              <button
                onClick={togglePush}
                className="flex items-center gap-2.5 text-xs font-mono text-[#b0b0b0] hover:text-[#999] transition-colors duration-150 tracking-wide"
              >
                {pushEnabled
                  ? <Bell size={13} className="text-amber-500/70" />
                  : <BellOff size={13} />
                }
                <span className={pushEnabled ? 'text-amber-500/80' : ''}>
                  {pushEnabled
                    ? 'Push alerts ON — you will be notified'
                    : pushPermission === 'denied'
                      ? 'Push blocked — enable in browser settings'
                      : 'Allow push notifications to this device'}
                </span>
              </button>
            )}

            {/* Auth nudge for unauthenticated users */}
            {!user && (
              <p className="font-mono text-[12px] text-[#8a8a8a] tracking-wide">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-amber-500/50 hover:text-amber-400 transition-colors underline underline-offset-2"
                >
                  Sign in
                </button>
                {' '}to save missions and receive alerts between sessions.
              </p>
            )}
          </div>
        </section>

        {/* Active missions */}
        {missions.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <p className="font-mono text-[12px] text-amber-400/90 tracking-[0.3em] uppercase">
                — Active Missions —
              </p>
              <span className="font-mono text-[12px] text-green-400/80">
                {missions.length} running
                {user && isFinite(MISSION_LIMIT) && ` · ${Math.max(0, MISSION_LIMIT - missions.length)} slot${MISSION_LIMIT - missions.length !== 1 ? 's' : ''} remaining`}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {missions.map((m) => (
                <MissionCard key={m.id} mission={m} onDeactivate={deactivateMission} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {missions.length === 0 && (
          <div className="text-center py-12 border border-dashed border-[#2e2e2e] rounded-sm">
            <p className="font-mono text-xs text-[#8a8a8a] tracking-widest uppercase">No active missions</p>
            <p className="font-mono text-[12px] text-[#777] mt-1">Your agent is standing by. Deploy one above.</p>
          </div>
        )}

        {/* In-app ad card — free tier only, shown below mission list */}
        {userTier === 'free' && ADS.length > 0 && (
          <div className="mt-8">
            <AdCard ad={ADS[0]} />
          </div>
        )}

        {/* Pricing tiers */}
        <section className="mt-16 pt-10 border-t border-[#222]">
          <p className="font-mono text-[12px] text-amber-400/90 tracking-[0.3em] uppercase mb-6">— {MODE.landing.pricingHeading} —</p>
          <div className={`grid grid-cols-1 gap-3 ${MODE.tiers.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
            {MODE.tiers.map((t) => (
              <div
                key={t.id}
                className={`border rounded-sm p-4 ${t.current ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#2a2a2a] bg-[#1e1e1e]'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-[13px] tracking-widest uppercase ${t.current ? 'text-amber-400' : 'text-[#c8c0b0]'}`}>
                    {t.label}
                  </span>
                  {t.current && (
                    <span className="font-mono text-[12px] text-amber-500/60 bg-amber-500/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      Current
                    </span>
                  )}
                </div>

                {t.trial && (
                  <div className="inline-block bg-green-500/10 border border-green-500/30 rounded-sm px-2 py-0.5 mb-2">
                    <span className="font-mono text-[13px] text-green-400 tracking-widest uppercase">
                      {t.trial}
                    </span>
                  </div>
                )}

                <p className="text-[#f5f0e8] font-semibold text-lg mb-1">
                  {t.trial ? <span className="text-[#888] text-sm">then </span> : null}
                  {t.price}
                </p>
                <p className="font-mono text-[12px] text-[#a0a0a0]">{t.missionsLabel}</p>
                <p className="font-mono text-[12px] text-[#8a8a8a]">{t.interval}</p>

                {t.trialNote && (
                  <p className="font-mono text-[13px] text-green-500/60 mt-2 leading-relaxed">
                    {t.trialNote}
                  </p>
                )}

                {!t.current && (
                  <a
                    href="#"
                    className="mt-3 block text-center w-full font-mono text-[12px] text-amber-500/60 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/40 py-1.5 rounded-sm transition-colors uppercase tracking-widest"
                  >
                    Upgrade
                  </a>
                )}
              </div>
            ))}
          </div>

          <p className="font-mono text-[12px] text-[#8a8a8a] mt-4 leading-relaxed text-center">
            {MODE.landing.pricingSubhead}
          </p>
        </section>
        </main>

        {userTier === 'free' && <AdSidebar ads={adsWithMedia()} side="right" />}

      </div>{/* end sidebar layout */}

      <Ticker />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            loadMissions();
          }}
        />
      )}

      {/* Settings modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative bg-[#1c1c1c] border border-[#333] rounded-sm w-full max-w-md p-6 shadow-2xl">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-[#666] hover:text-amber-400 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <p className="font-mono text-[11px] text-amber-400/70 tracking-[0.3em] uppercase mb-4">— Settings —</p>

            {/* Account section */}
            <div className="mb-6 pb-6 border-b border-[#2a2a2a]">
              <p className="font-mono text-[13px] text-[#a0a0a0] uppercase tracking-widest mb-2">Account</p>
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-[#f5f0e8] text-sm truncate max-w-[200px]">{user.email}</span>
                  <button
                    onClick={() => { signOut(); setShowSettingsModal(false); }}
                    className="flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-widest text-[#a0a0a0] hover:text-red-400 transition-colors duration-150"
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowSettingsModal(false); setShowAuthModal(true); }}
                  className="flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <LogIn size={12} />
                  Sign in
                </button>
              )}
            </div>

            {/* SMS alerts — available to all tiers */}
            <div>
              <p className="font-mono text-[13px] text-[#a0a0a0] uppercase tracking-widest mb-3 flex items-center gap-2">
                <MessageSquare size={13} className="text-amber-400" />
                SMS Alerts
              </p>

              <label className="block mb-3">
                <span className="font-mono text-[12px] text-[#888] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Phone size={11} /> Mobile number
                </span>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full bg-[#111] border border-[#333] focus:border-amber-500/60 outline-none rounded-sm px-3 py-2 font-mono text-sm text-[#f5f0e8] placeholder-[#555] transition-colors"
                />
                <span className="font-mono text-[11px] text-[#666] mt-1 block">Include country code (e.g. +1 for US)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer mb-5">
                <div
                  onClick={() => setProfileSmsEnabled((v) => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${profileSmsEnabled ? 'bg-amber-500' : 'bg-[#333]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${profileSmsEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="font-mono text-[13px] text-[#c8c0b0]">
                  Text me when a mission fires
                </span>
              </label>

              <button
                onClick={saveProfileSettings}
                disabled={settingsSaving}
                className="w-full font-mono text-[12px] uppercase tracking-widest bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 text-[#1a1a1a] font-semibold px-4 py-2 rounded-sm transition-colors duration-150"
              >
                {settingsSaving ? 'Saving…' : settingsSaved ? 'Saved ✓' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
