import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoomList } from '../components/RoomList';
import { ChatWindow } from '../components/ChatWindow';
import { UserList } from '../components/UserList';
import { fetchRooms } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; username: string; role: string }[]>([]);

  useEffect(() => {
    if (!user) {
      void router.replace('/Login');
    } else if (user.banned) {
      void router.replace('/banned');
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

  // Real-time synchronization for Join Requests, Membership changes, and Online Users
  useEffect(() => {
    if (!socket || !user) return;

    const onOnlineUsersUpdate = (users: any[]) => {
      setOnlineUsers(users);
    };

    const onNewJoinRequest = (payload: { roomId: string, user: { _id: string, username: string } }) => {
      setRooms(prev => prev.map(r => 
        r._id === payload.roomId 
          ? { ...r, pendingRequests: [...(r.pendingRequests || []), payload.user] }
          : r
      ));
      // Also update activeRoom if it's the one receiving a request
      setActiveRoom(prev => prev?._id === payload.roomId 
        ? { ...prev, pendingRequests: [...(prev.pendingRequests || []), payload.user] }
        : prev
      );
    };

    const onJoinRequestHandled = (payload: { roomId: string, userId: string }) => {
      const filterPending = (r: any) => ({
        ...r,
        pendingRequests: (r.pendingRequests || []).filter((u: any) => (u._id || u) !== payload.userId)
      });

      setRooms(prev => prev.map(r => r._id === payload.roomId ? filterPending(r) : r));
      setActiveRoom(prev => prev?._id === payload.roomId ? filterPending(prev) : prev);
    };

    const onJoinApproved = (payload: { roomId: string }) => {
      const reload = async () => {
        if (!token) return;
        const data = await fetchRooms(token);
        setRooms(data);
        // Find and update the active room with fresh data (membership, etc)
        const updatedActive = data.find(r => r._id === payload.roomId);
        if (updatedActive && activeRoom?._id === payload.roomId) {
          setActiveRoom(updatedActive);
        }
      };
      reload();
    };

    socket.on('onlineUsersUpdate', onOnlineUsersUpdate);
    socket.on('newJoinRequest', onNewJoinRequest);
    socket.on('joinRequestHandled', onJoinRequestHandled);
    socket.on('joinApproved', onJoinApproved);

    return () => {
      socket.off('onlineUsersUpdate', onOnlineUsersUpdate);
      socket.off('newJoinRequest', onNewJoinRequest);
      socket.off('joinRequestHandled', onJoinRequestHandled);
      socket.off('joinApproved', onJoinApproved);
    };
  }, [socket, user, token, activeRoom]);

  if (!user) {
    return null;
  }

  const handleSelectRoom = (room: any) => {
    setActiveRoom(room);
    setSidebarOpen(false); // close sidebar on mobile after selection
  };

  return (
    <div className="min-h-screen h-screen bg-acmDark text-slate-100 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="border-b border-acmBorder/60 px-4 sm:px-6 py-3 flex items-center justify-between bg-gradient-to-r from-black/60 via-acmDark to-black/80 backdrop-blur-md flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-9 h-9 rounded-xl bg-acmSurface border border-acmBorder flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>

          {/* Brand */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-acmBlue via-acmPurple to-acmTeal flex items-center justify-center text-xs font-black text-white shadow-lg shadow-acmPurple/20">
            AT
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold tracking-wide">
              MPSTME Internal Network
            </div>
            <div className="text-[10px] text-slate-500">
              Campus-wide collaboration platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Panel button */}
          {user.role === 'admin' && (
            <button
              onClick={() => router.push('/AdminPanel')}
              className="acm-btn-ghost flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-acmPurple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* User avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-acmBorder/40">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-acmBlue to-acmPurple flex items-center justify-center text-[11px] font-bold text-white">
              {user.username[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs text-slate-200 font-medium">{user.username}</span>
              <span className="text-[10px] text-slate-500 uppercase">{user.role}</span>
            </div>
          </div>

          {/* Logout */}
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

      {/* ── Main content ── */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-72 lg:w-64 xl:w-72
          transition-transform duration-300 ease-in-out
          p-2 lg:p-2
          flex-shrink-0
          bg-acmDark lg:bg-transparent
        `}>
          <RoomList
            rooms={rooms}
            activeRoomId={activeRoom?._id || null}
            onSelect={handleSelectRoom}
            currentUserId={user.id}
            currentUserRole={user.role}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 p-2 min-w-0">
          <ChatWindow room={activeRoom} />
        </div>

        {/* User list (hidden on small screens) */}
        <div className="hidden xl:block w-64 p-2 flex-shrink-0">
          <UserList users={onlineUsers} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-6 py-2 border-t border-acmBorder/40 text-[10px] text-slate-600 flex items-center justify-between flex-shrink-0">
        <span>Built by MPSTME • Internal Network</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
          Connected
        </span>
      </footer>
    </div>
  );
}
