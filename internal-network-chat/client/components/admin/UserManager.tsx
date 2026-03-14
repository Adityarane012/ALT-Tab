import { useEffect, useState } from 'react';
import { fetchUsers, toggleUserBan, updateUserRole } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ErrorModal } from '../ErrorModal';
import clsx from 'clsx';

type AdminUser = {
  _id: string;
  username: string;
  role: 'admin' | 'moderator' | 'user';
  banned: boolean;
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-acmPurple/15 text-acmPurple border-acmPurple/30',
  moderator: 'bg-acmTeal/15 text-acmTeal border-acmTeal/30',
  user: 'bg-slate-700/30 text-slate-400 border-slate-600/30'
};

const AVATAR_GRADIENT: Record<string, string> = {
  admin: 'from-acmPurple to-acmBlue',
  moderator: 'from-acmTeal to-acmBlue',
  user: 'from-slate-600 to-slate-700'
};

export const UserManager = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [banErrorMsg, setBanErrorMsg] = useState('');

  const loadUsers = async () => {
    if (!token) return;
    const data = await fetchUsers(token);
    setUsers(data);
  };

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRoleChange = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    if (!token) return;
    await updateUserRole(token, userId, role);
    void loadUsers();
  };

  const handleBanToggle = async (userId: string, banned: boolean) => {
    if (!token) return;
    try {
      await toggleUserBan(token, userId, banned);
      void loadUsers();
    } catch (err: any) {
      setBanErrorMsg(err.response?.data?.message || 'Action Not Allowed');
    }
  };

  return (
    <>
      <ErrorModal 
        isOpen={!!banErrorMsg} 
        message={banErrorMsg} 
        onClose={() => setBanErrorMsg('')} 
      />
      <div className="acm-card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-acmPurple/10 border border-acmPurple/20 flex items-center justify-center text-acmPurple">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">User Manager</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              {users.length} user{users.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider border-b border-acmBorder/40 mb-1">
        <span>User</span>
        <span>Role</span>
        <span>Action</span>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {users.map((u, i) => {
          const isSelf = user?.id === u._id;
          const gradient = AVATAR_GRADIENT[u.role] || AVATAR_GRADIENT.user;
          const badge = ROLE_BADGE[u.role] || ROLE_BADGE.user;

          return (
            <div
              key={u._id}
              className={clsx(
                'grid grid-cols-[1fr_auto_auto] gap-3 items-center py-2.5 px-3 rounded-xl transition-colors duration-150 animate-fade-in',
                u.banned ? 'bg-red-500/5' : 'hover:bg-slate-800/30'
              )}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* User info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={clsx(
                  'w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br',
                  gradient,
                  u.banned && 'opacity-40'
                )}>
                  {u.username[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={clsx('text-sm text-slate-200 truncate', u.banned && 'line-through opacity-50')}>
                      {u.username}
                    </span>
                    {u.banned && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-medium uppercase">
                        Banned
                      </span>
                    )}
                    {isSelf && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-acmBlue/15 text-acmBlue border border-acmBlue/20 font-medium">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Role selector */}
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u._id, e.target.value as any)}
                className="bg-slate-950/80 border border-acmBorder text-[11px] rounded-lg px-2 py-1.5 outline-none focus:border-acmTeal/40 transition-colors cursor-pointer"
                disabled={isSelf}
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>

              {/* Ban/Unban */}
              <button
                type="button"
                onClick={() => handleBanToggle(u._id, !u.banned)}
                disabled={isSelf}
                className={clsx(
                  'acm-btn text-[11px] px-3 py-1.5',
                  u.banned
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
                  isSelf && 'opacity-30 cursor-not-allowed'
                )}
              >
                {u.banned ? 'Unban' : 'Ban'}
              </button>
            </div>
          );
        })}

        {/* Empty state */}
        {!users.length && (
          <div className="flex flex-col items-center py-8 text-center animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-acmBorder flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">No users registered</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
