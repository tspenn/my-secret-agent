import { useState, useEffect, useRef } from 'react';
import {
  Eye, Shield, Cloud, Tag, Settings, Bell, BellOff, LogOut, LogIn, TrendingUp,
  Bitcoin, Activity, Wind, Globe, Rss, Newspaper, Trophy, X,
} from 'lucide-react';
import { supabase, type SecretAgentMission, type WatchType, type NewMission, type ConditionOperator, parseCondition, resolveNewsKeyword } from '../lib/supabase';
import { signOut } from '../lib/auth';
import { pushSupported, getPushPermission, enablePushNotifications, disablePushNotifications } from '../lib/pushNotifications';
import AuthModal from '../components/AuthModal';
import AdCard from '../components/AdCard';
import AdSidebar from '../components/AdSidebar';
import type { AuthState } from '../lib/auth';
import { MODE, atMissionLimit, missionLimitForTier, resolveUserTier } from '../lib/appMode';
import { ADS, adsWithMedia } from '../lib/ads';

type UserTier = 'sa_free' | 'agent' | 'network';

// ─── Static config ────────────────────────────────────────────────────────────

const WATCH_OPTIONS: {
  boardId: string;
  value: WatchType;
  label: string;
  group: 'general' | 'more';
  placeholder: { target: string; condition: string };
}[] = [
  {
    boardId: 'news',
    value: 'news_keyword',
    label: 'News',
    group: 'general',
    placeholder: { target: 'Iran war', condition: 'any new article' },
  },
  {
    boardId: 'weather',
    value: 'severe_weather',
    label: 'Weather',
    group: 'general',
    placeholder: { target: '28677', condition: 'storms today' },
  },
  {
    boardId: 'sports',
    value: 'news_keyword',
    label: 'Sports',
    group: 'general',
    placeholder: { target: 'Lakers', condition: 'any new article' },
  },
  {
    boardId: 'website',
    value: 'website_change',
    label: 'A Website',
    group: 'general',
    placeholder: { target: 'https://robinhood.com/?classic=1', condition: 'stock goes down 8 pts' },
  },
  {
    boardId: 'sale_price',
    value: 'sale_price',
    label: 'A Sale Price',
    group: 'more',
    placeholder: { target: 'https://store.com/product', condition: 'price drops below $50' },
  },
  {
    boardId: 'stock_price',
    value: 'stock_price',
    label: 'A Stock Price',
    group: 'more',
    placeholder: { target: 'AAPL', condition: 'price drops below $150' },
  },
  {
    boardId: 'crypto_price',
    value: 'crypto_price',
    label: 'A Crypto Price',
    group: 'more',
    placeholder: { target: 'bitcoin', condition: 'drops below $60000' },
  },
  {
    boardId: 'earthquake',
    value: 'earthquake',
    label: 'Earthquake Activity',
    group: 'more',
    placeholder: { target: 'California', condition: 'magnitude above 4.5' },
  },
  {
    boardId: 'air_quality',
    value: 'air_quality',
    label: 'Air Quality',
    group: 'more',
    placeholder: { target: 'Los Angeles, CA', condition: 'AQI above 100' },
  },
  {
    boardId: 'rss_feed',
    value: 'rss_feed',
    label: 'An RSS Feed',
    group: 'more',
    placeholder: { target: 'https://blog.com/feed.xml', condition: 'a new post is published' },
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
  const isSports = (mission.metadata as { category?: string } | null)?.category === 'sports';
  const Icon = isSports ? Trophy : (WATCH_ICONS[mission.watch_type as WatchType] ?? Eye);
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
  const [boardId, setBoardId] = useState('news');
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
  const [userTier, setUserTier] = useState<UserTier>('sa_free');
  const [showVanUpgradePrompt, setShowVanUpgradePrompt] = useState(false);
  const [newNotifyPush, setNewNotifyPush] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = auth.user;
  const MISSION_LIMIT = missionLimitForTier(userTier);
  const isFreeTier = userTier === 'sa_free';
  const networkTier = MODE.tiers.find((t) => t.id === 'network');
  const selectedOption = WATCH_OPTIONS.find((o) => o.boardId === boardId)!;
  const watchType = selectedOption.value;

  useEffect(() => {
    if (user) {
      loadMissions();
      fetchUserTier();
    } else {
      setMissions([]);
      setUserTier('sa_free');
    }
  }, [user]);

  async function fetchUserTier() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .maybeSingle();
      if (error || !data) {
        setUserTier('sa_free');
        return;
      }
      setUserTier(resolveUserTier((data as { tier?: string }).tier));
    } catch {
      setUserTier('sa_free');
    }
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
    setLimitReached(atMissionLimit(activeMissions.length, userTier));
  }, [missions, userTier]);

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
    const resolvedTarget =
      watchType === 'news_keyword' ? resolveNewsKeyword(target, condition) : target.trim();
    if (!resolvedTarget || !condition.trim()) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (limitReached) return;

    setActivating(true);

    const parsed = parseCondition(condition);
    const operator: ConditionOperator =
      parsed.operator === 'down' || parsed.operator === 'up' ? 'changes' : parsed.operator;

    const newMission: NewMission = {
      user_id: user.id,
      codename: missionCodename(),
      watch_type: watchType,
      target: resolvedTarget,
      condition_text: condition.trim(),
      condition_operator: operator,
      condition_value: parsed.value,
      status_message: boardId === 'sports' ? 'Scanning sports wires.' : WATCH_STATUS[watchType],
      active: true,
      check_interval_minutes: 60,
      notify_push: newNotifyPush,
      metadata: boardId === 'sports' ? { category: 'sports' } : {},
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
          {!isFreeTier && (
            <button
              onClick={handleVanClick}
              className="text-[12px] font-mono uppercase tracking-widest text-[#8a8a8a] hover:text-amber-400 transition-colors duration-150 border border-[#333] hover:border-amber-500/40 px-2.5 py-1.5 rounded-sm"
            >
              The Van
            </button>
          )}

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

        {isFreeTier && <AdSidebar ads={adsWithMedia()} side="left" />}

        <main className="flex-1 min-w-0 px-2">

        {/* The Van upgrade prompt — Agent-tier users who click The Van (hidden on free) */}
        {showVanUpgradePrompt && !isFreeTier && (
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
                  {WATCH_OPTIONS.map((opt, i) => (
                    <span key={opt.boardId}>
                      {i > 0 && opt.group !== WATCH_OPTIONS[i - 1].group && (
                        <span className="block border-t border-[#3a3a3a] my-1" />
                      )}
                      <button
                        onClick={() => { setBoardId(opt.boardId); setDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-normal transition-colors duration-100 ${
                          boardId === opt.boardId
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-[#c8c0b0] hover:bg-[#2e2e2e] hover:text-[#f5f0e8]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    </span>
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
              onKeyDown={(e) => e.key === 'Enter' && activateMission()}
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
              <p className="font-mono text-[11px] text-[#777] uppercase tracking-[0.2em]">If this happens:</p>
              <button
                type="button"
                onClick={() => setNewNotifyPush((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-mono text-[12px] uppercase tracking-widest transition-colors duration-150 w-fit ${
                  newNotifyPush
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-[#333] text-[#666] hover:border-[#555] hover:text-[#999]'
                }`}
              >
                <Bell size={11} />
                Ping me
              </button>
              {newNotifyPush && !pushEnabled && pushPermission !== 'unsupported' && (
                <p className="font-mono text-[11px] text-amber-500/70">
                  Turn on notifications in Settings — and on your device/devices — to receive Pings.
                </p>
              )}
            </div>

            {/* Mission limit warning */}
            {limitReached && user && (
              <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-sm px-4 py-3">
                <p className="font-mono text-[12px] text-amber-500/80 tracking-wide">
                  MISSION LIMIT REACHED ({MISSION_LIMIT}/{MISSION_LIMIT}) — Deactivate one to free a slot
                  {userTier === 'sa_free' && (
                    <>
                      {' '}or{' '}
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                      >
                        upgrade to Agent ($4.99/mo, 5 active watches)
                      </button>
                    </>
                  )}
                  {userTier === 'agent' && networkTier?.stripeLink && (
                    <>
                      {' '}or{' '}
                      <a
                        href={networkTier.stripeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                      >
                        upgrade to Network ($14.99/mo, 20 active watches)
                      </a>
                    </>
                  )}
                  .
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

            {/* Auth nudge for unauthenticated users */}
            {!user && (
              <p className="font-mono text-[12px] text-[#8a8a8a] tracking-wide">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-amber-500/50 hover:text-amber-400 transition-colors underline underline-offset-2"
                >
                  Sign in
                </button>
                {' '}to save missions and receive notifications between sessions.
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
        {isFreeTier && ADS.length > 0 && (
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

                {!t.current && (t.stripeLink || t.stripeLinkAnnual) && (
                  <a
                    href={t.stripeLink ?? t.stripeLinkAnnual}
                    target="_blank"
                    rel="noopener noreferrer"
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

        {isFreeTier && <AdSidebar ads={adsWithMedia()} side="right" />}

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

            {/* Alert notifications — web push only */}
            <div>
              <p className="font-mono text-[13px] text-[#a0a0a0] uppercase tracking-widest mb-3 flex items-center gap-2">
                <Bell size={13} className="text-amber-400" />
                Notifications
              </p>

              <p className="font-mono text-[12px] text-[#888] leading-relaxed mb-4">
                Mission alerts are delivered as notifications (Ping). You must have notifications turned on on your device/devices to receive them.
              </p>

              {pushPermission === 'unsupported' || !pushSupported() ? (
                <p className="font-mono text-[12px] text-amber-500/70 leading-relaxed">
                  Notifications are not supported in this browser. Try Chrome, Edge, or Firefox on a device that allows web push.
                </p>
              ) : (
                <>
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <div
                      onClick={() => { void togglePush(); }}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${pushEnabled ? 'bg-amber-500' : 'bg-[#333]'}`}
                      role="switch"
                      aria-checked={pushEnabled}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${pushEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="font-mono text-[13px] text-[#c8c0b0]">
                      Alert notifications (Ping)
                    </span>
                  </label>

                  {pushEnabled ? (
                    <p className="font-mono text-[11px] text-green-500/70 leading-relaxed flex items-start gap-1.5">
                      <Bell size={11} className="mt-0.5 flex-shrink-0" />
                      Notifications are on for this device. Keep them enabled in your browser/OS settings too.
                    </p>
                  ) : pushPermission === 'denied' ? (
                    <p className="font-mono text-[11px] text-amber-500/70 leading-relaxed flex items-start gap-1.5">
                      <BellOff size={11} className="mt-0.5 flex-shrink-0" />
                      Notifications are blocked. Enable them in your browser or device settings, then turn this back on.
                    </p>
                  ) : (
                    <p className="font-mono text-[11px] text-[#666] leading-relaxed">
                      Turn this on to allow Pings on this device when a mission fires.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
