import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoomManager } from '../components/admin/RoomManager';
import { UserManager } from '../components/admin/UserManager';
import { ActivityMonitor } from '../components/admin/ActivityMonitor';

export default function AdminPanelPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      void router.replace('/Login');
    } else if (user.role !== 'admin') {
      void router.replace('/Dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-acmDark text-slate-100 flex flex-col">
      <header className="border-b border-slate-900 px-6 py-3 flex items-center justify-between bg-gradient-to-r from-black/60 via-acmDark to-black/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md border border-slate-800 flex items-center justify-center text-xs font-bold text-acmTeal">
            ACM
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">
              MPSTME ACM Internal Network
            </div>
            <div className="text-[11px] text-slate-500">
              Admin Control Center
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/Dashboard')}
            className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:border-acmTeal transition"
          >
            Back to Dashboard
          </button>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-200">{user.username}</span>
            <span className="text-[10px] text-slate-500 uppercase">{user.role}</span>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:border-acmTeal transition"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-12 gap-3 px-4 py-3">
        <div className="col-span-4">
          <RoomManager />
        </div>
        <div className="col-span-5">
          <UserManager />
        </div>
        <div className="col-span-3">
          <ActivityMonitor />
        </div>
      </main>
      <footer className="px-6 py-2 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Admin Panel • MPSTME ACM Internal Network</span>
      </footer>
    </div>
  );
}

