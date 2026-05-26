import { useState, useEffect } from 'react';
import SecretAgent from './views/SecretAgent';
import CommandCenter from './views/CommandCenter';
import Landing from './views/Landing';
import { useAuth } from './lib/auth';
import { MODE } from './lib/appMode';

type View = 'agent' | 'command';

export default function App() {
  const [view, setView] = useState<View>('agent');
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

  if (!auth.user) {
    return <Landing />;
  }

  return view === 'agent'
    ? <SecretAgent auth={auth} onSwitchMode={() => setView('command')} />
    : <CommandCenter auth={auth} onSwitchMode={() => setView('agent')} />;
}
