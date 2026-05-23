import { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../lib/auth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = 'signin' | 'signup';

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
        onSuccess();
      } else {
        const { error: err, data } = await signUp(email, password);
        if (err) throw err;
        // If email confirmation is required, show confirmation message
        if (data.session) {
          onSuccess();
        } else {
          setConfirmSent(true);
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-[#1a1a1a] border border-[#333] rounded-sm shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-3">
            <Lock size={13} className="text-amber-500/70" />
            <span className="font-mono text-[12px] text-amber-500/60 tracking-[0.3em] uppercase">
              {mode === 'signin' ? 'Secure Access' : 'Register Agent'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a8a8a] hover:text-[#888] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {confirmSent ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-green-400 text-lg">✓</span>
            </div>
            <p className="text-[#f5f0e8] font-semibold mb-2">Confirmation Sent</p>
            <p className="font-mono text-xs text-[#b0b0b0] leading-relaxed">
              Check your email to confirm your account,<br />then sign in.
            </p>
            <button
              onClick={() => { setConfirmSent(false); setMode('signin'); }}
              className="mt-6 font-mono text-[12px] text-amber-500/60 hover:text-amber-400 tracking-widest uppercase transition-colors"
            >
              Sign In →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[12px] text-[#a0a0a0] tracking-widest uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="agent@example.com"
                className="bg-[#111] border border-[#333] rounded-sm px-3 py-2.5 text-sm text-[#f5f0e8] placeholder-[#444] font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[12px] text-[#a0a0a0] tracking-widest uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-[#333] rounded-sm px-3 py-2.5 text-sm text-[#f5f0e8] placeholder-[#444] font-mono focus:outline-none focus:border-amber-500/50 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-[#888] transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-mono text-[12px] text-red-500/80 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="activate-btn mt-1"
            >
              {loading ? 'Authenticating...' : mode === 'signin' ? 'Access Granted' : 'Register'}
            </button>

            <p className="text-center font-mono text-[12px] text-[#a0a0a0] mt-1">
              {mode === 'signin' ? "Don't have clearance?" : 'Already registered?'}{' '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                className="text-amber-500/70 hover:text-amber-400 transition-colors"
              >
                {mode === 'signin' ? 'Request access →' : 'Sign in →'}
              </button>
            </p>

            <p className="text-center font-mono text-[11px] text-[#777] leading-relaxed">
              One account for Secret Agent, FRIDAY Canvas,<br />GoShop, GoTRVL &amp; LnkLokr.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
