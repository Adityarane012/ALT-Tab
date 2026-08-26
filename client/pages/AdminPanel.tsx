import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoomManager } from '../components/admin/RoomManager';
import { UserManager } from '../components/admin/UserManager';
import { ActivityMonitor } from '../components/admin/ActivityMonitor';
import { fetchRooms, fetchUsers, fetchRecentMessages } from '../services/api';

export default function AdminPanelPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ rooms: 0, users: 0, messages: 0 });

  useEffect(() => {
    if (!user) {
      void router.replace('/Login');
    } else if (user.banned) {
      void router.replace('/banned');
    } else if (user.role !== 'admin') {
      void router.replace('/Dashboard');
    }
  }, [user, router]);

  const loadStats = async () => {
    if (!token) return;
    try {
      const [rooms, users, msgs] = await Promise.all([
        fetchRooms(token),
        fetchUsers(token),
        fetchRecentMessages(token, 50)
      ]);
      setStats({ rooms: rooms.length, users: users.length, messages: msgs.length });
    } catch {}
  };

  useEffect(() => {
    void loadStats();
  }, [token]);

  const handleRoomsUpdated = (rooms: any[]) => {
    setStats((prev) => ({ ...prev, rooms: rooms.length }));
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const statCards = [
    {
      label: 'Total Channels',
      value: stats.rooms,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ),
      color: 'text-acmTeal',
      bg: 'bg-acmTeal/10 border-acmTeal/20'
    },
    {
      label: 'Total Users',
      value: stats.users,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: 'text-acmPurple',
      bg: 'bg-acmPurple/10 border-acmPurple/20'
    },
    {
      label: 'Recent Activity',
      value: stats.messages,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      color: 'text-acmBlue',
      bg: 'bg-acmBlue/10 border-acmBlue/20'
    }
  ];

  return (
    <div className="min-h-screen bg-acmDark text-slate-100 flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-acmBorder/60 px-4 sm:px-6 py-3 flex items-center justify-between bg-gradient-to-r from-black/60 via-acmDark to-black/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-acmPurple to-acmBlue flex items-center justify-center text-xs font-black text-white shadow-lg shadow-acmPurple/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">
              Admin Control Center
            </div>
            <div className="text-[10px] text-slate-500">
              MPSTME Internal Network
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/Dashboard')}
            className="acm-btn-ghost flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="flex items-center gap-2.5 pl-2 border-l border-acmBorder/40">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-acmPurple to-acmBlue flex items-center justify-center text-[11px] font-bold text-white">
              {user.username[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs text-slate-200 font-medium">{user.username}</span>
              <span className="text-[10px] text-slate-500 uppercase">{user.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-9 h-9 rounded-xl bg-slate-900/60 border border-acmBorder text-slate-400 flex items-center justify-center hover:border-red-500/40 hover:text-red-400 transition-all duration-200"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Stat cards ── */}
      <div className="px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className="acm-card p-4 flex items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`w-11 h-11 rounded-xl ${card.bg} border flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{card.value}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main panels ── */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 px-4 sm:px-6 pb-4">
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <RoomManager onRoomsUpdated={handleRoomsUpdated} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <UserManager />
        </div>
        <div className="md:col-span-2 xl:col-span-1 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <ActivityMonitor />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-6 py-2 border-t border-acmBorder/40 text-[10px] text-slate-600 flex items-center justify-between flex-shrink-0">
        <span>Admin Panel • MPSTME Internal Network</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-acmPurple/60" />
          Admin Mode
        </span>
      </footer>
    </div>
  );
}
