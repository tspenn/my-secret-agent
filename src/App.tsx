import { useState, useEffect } from 'react';
import SecretAgent from './views/SecretAgent';
import CommandCenter from './views/CommandCenter';
import Landing from './views/Landing';
import { useAuth } from './lib/auth';
import { MODE, isGIA } from './lib/appMode';

type Mode = 'agent' | 'command';

export default function App() {
  const [mode, setMode] = useState<Mode>(MODE.defaultView);
  const auth = useAuth();

  useEffect(() => {
    document.title = MODE.documentTitle;
  }, []);

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="pulse-dot" />
          <span className="font-mono text-xs text-[#a0a0a0] tracking-widest uppercase">
            Establishing secure connection...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated users see the landing page.
  if (!auth.user) {
    return <Landing />;
  }

  // GIA mode always renders the Command Center directly — no entry-form toggle.
  if (isGIA) {
    return <CommandCenter auth={auth} onSwitchMode={() => {}} />;
  }

  // Secret Agent mode: toggle between entry form and The Van (gated by tier in SecretAgent).
  return mode === 'agent'
    ? <SecretAgent auth={auth} onSwitchMode={() => setMode('command')} />
    : <CommandCenter auth={auth} onSwitchMode={() => setMode('agent')} />;
}
