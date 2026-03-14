import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Banned() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-acmDark flex items-center justify-center p-4 selection:bg-red-500/30">
      <Head>
        <title>Account Banned | MPSTME Network</title>
      </Head>

      <div className="acm-card w-full max-w-lg overflow-hidden animate-slide-up relative">
        {/* Subtle red top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/80 to-rose-600/80"></div>

        <div className="p-8 sm:p-10">
          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)] mx-auto animate-pulse-dot">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 mb-2">
              You have been banned from the platform
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              You have been restricted from accessing this communication system due to a violation of the community guidelines.
            </p>
          </div>

          <div className="bg-slate-800/40 rounded-xl border border-acmBorder/50 p-6 mb-8">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Community Rules
            </h3>
            
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></span>
                Maintain respectful communication
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></span>
                No profanity or offensive language
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></span>
                No harassment or bullying
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></span>
                No spam or disruptive behavior
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></span>
                Do not impersonate other users
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></span>
                Follow room guidelines
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></span>
                Maintain a professional and collaborative environment
              </li>
            </ul>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs text-slate-500">
              If you believe this action was taken in error, please contact an administrator.
            </p>
            <button 
              onClick={() => router.push('/Login')}
              className="acm-btn-ghost text-sm px-6 mx-auto"
            >
              Return to Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
