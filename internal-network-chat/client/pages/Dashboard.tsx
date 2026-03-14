import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoomList } from '../components/RoomList';
import { ChatWindow } from '../components/ChatWindow';
import { UserList } from '../components/UserList';
import { fetchRooms } from '../services/api';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      void router.replace('/Login');
    }
  }, [user, router]);

  useEffect(() => {
    const loadRooms = async () => {
      if (!token) return;
      const data = await fetchRooms(token);
      setRooms(data);
      if (!activeRoom && data.length) {
        setActiveRoom(data[0]);
      }
    };
    void loadRooms();
  }, [token, activeRoom]);

  if (!user) {
    return null;
  }

  const mockUsers = [
    { id: user.id, username: user.username, role: user.role }
  ];

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
              Private organizational messaging for engineers
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <button
              onClick={() => router.push('/AdminPanel')}
              className="px-3 py-1.5 rounded-md bg-acmPurple/30 border border-acmPurple/60 text-xs text-slate-100 hover:bg-acmPurple/50 transition"
            >
              Admin Panel
            </button>
          )}
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
        <div className="col-span-3">
          <RoomList
            rooms={rooms}
            activeRoomId={activeRoom?._id || null}
            onSelect={setActiveRoom}
          />
        </div>
        <div className="col-span-6 flex flex-col gap-3">
          <ChatWindow room={activeRoom} />
        </div>
        <div className="col-span-3">
          <UserList users={mockUsers} />
        </div>
      </main>
      <footer className="px-6 py-2 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Built by MPSTME ACM • Internal Network</span>
      </footer>
    </div>
  );
}

