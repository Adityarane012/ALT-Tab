import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const WELCOME_MESSAGE = 'Welcome to MPSTME ACM Internal Network — Built for engineers.';

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      void router.replace('/Dashboard');
    }
  }, [user, router]);

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      await register(username, password);
    } else {
      await login(username, password);
    }
    setUsername('');
    setPassword('');
    void router.replace('/Dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-acmDark via-[#050519] to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -left-32 -top-32 w-80 h-80 rounded-full bg-acmBlue blur-3xl" />
        <div className="absolute right-0 top-12 w-72 h-72 rounded-full bg-acmPurple blur-3xl" />
        <div className="absolute left-24 bottom-0 w-72 h-72 rounded-full bg-acmTeal blur-3xl" />
      </div>
      <div className="relative max-w-4xl w-full px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 text-[11px] uppercase tracking-wide text-slate-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MPSTME ACM • Internal Network
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-3 leading-tight">
            {WELCOME_MESSAGE}
          </h1>
          <p className="text-sm text-slate-400 mb-4 max-w-md">
            Real-time rooms, role-based controls, and a developer-first interface crafted for engineering clubs, hackathons, and internal collaboration.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              #acm-general
            </span>
            <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              #acm-backend
            </span>
            <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              #acm-frontend
            </span>
            <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              #acm-announcements
            </span>
          </div>
        </div>
        <div className="acm-panel p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {isRegister ? 'Create your account' : 'Sign in to continue'}
              </div>
              <div className="text-sm text-slate-100">
                MPSTME ACM Internal Network
              </div>
            </div>
            <span className="px-2 py-1 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-slate-300">
              Private Beta
            </span>
          </div>
          <form className="space-y-4" onSubmit={handleAuthSubmit}>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Username</label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-sm outline-none focus:border-acmTeal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-sm outline-none focus:border-acmTeal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-acmBlue via-acmPurple to-acmTeal text-sm font-medium text-white shadow-lg shadow-acmPurple/30"
            >
              {isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <div className="mt-4 text-xs text-slate-500 flex items-center justify-between">
            <button
              className="underline underline-offset-4"
              onClick={() => setIsRegister((v) => !v)}
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

