import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const WELCOME_MESSAGE = 'Welcome to MPSTME Internal Network — Built for students & faculty.';

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      void router.replace('/Dashboard');
    }
  }, [user, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let loggedInUser;
      if (!isRegister) { // If not registering, then logging in
        loggedInUser = await login(username, password);
      } else {
        loggedInUser = await register(username, password);
      }
      
      // Route banned users straight to the banned page
      if (loggedInUser && loggedInUser.banned) {
        void router.push('/banned');
      } else {
        void router.push('/Dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-acmDark via-[#050519] to-black relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-acmBlue blur-3xl animate-glow" />
        <div className="absolute right-0 top-12 w-80 h-80 rounded-full bg-acmPurple blur-3xl" />
        <div className="absolute left-24 bottom-0 w-80 h-80 rounded-full bg-acmTeal blur-3xl animate-glow" />
      </div>

      <div className="relative max-w-4xl w-full px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* Left side — branding */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-acmBorder text-[11px] uppercase tracking-wide text-slate-400 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MPSTME • Internal Network
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-4 leading-tight">
            {WELCOME_MESSAGE}
          </h1>
          <p className="text-sm text-slate-400 mb-5 max-w-md leading-relaxed">
            Real-time rooms, role-based controls, and a modern interface crafted for departments, faculty, and student collaboration at MPSTME.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
            {['#general', '#computer-engineering', '#ai-ds', '#announcements'].map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-acmBorder hover:border-acmTeal/30 transition-colors duration-200 cursor-default">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right side — auth form */}
        <div className="acm-panel p-6 shadow-glass-lg animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">
                {isRegister ? 'Create your account' : 'Sign in to continue'}
              </div>
              <div className="text-sm font-semibold text-slate-100">
                MPSTME Internal Network
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] bg-acmTeal/10 border border-acmTeal/20 text-acmTeal font-medium">
              Private Beta
            </span>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 animate-fade-in">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleAuth}>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Username</label>
              <input
                className="acm-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password</label>
              <input
                type="password"
                className="acm-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="acm-btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-acmBorder/40 text-xs text-slate-500 flex items-center justify-center">
            <button
              className="hover:text-acmTeal transition-colors duration-200"
              onClick={() => { setIsRegister((v) => !v); setError(''); }}
              type="button"
            >
              {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
