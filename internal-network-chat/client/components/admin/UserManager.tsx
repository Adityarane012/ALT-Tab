import { useEffect, useState } from 'react';
import { fetchUsers, toggleUserBan, updateUserRole } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type AdminUser = {
  _id: string;
  username: string;
  role: 'admin' | 'moderator' | 'user';
  banned: boolean;
};

export const UserManager = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);

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
    await toggleUserBan(token, userId, banned);
    void loadUsers();
  };

  return (
    <div className="acm-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Users
          </div>
          <div className="text-sm text-slate-100">
            User Manager
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto text-sm">
        {users.map((u) => (
          <div
            key={u._id}
            className="flex items-center justify-between py-1.5 border-b border-slate-900 last:border-b-0"
          >
            <div className="flex flex-col">
              <span className="text-slate-200 text-xs">{u.username}</span>
              <span className="text-[10px] text-slate-500 uppercase">
                {u.role}{u.banned ? ' • BANNED' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u._id, e.target.value as any)}
                className="bg-slate-950/80 border border-slate-800 text-[11px] rounded px-1.5 py-0.5 outline-none"
                disabled={user?.id === u._id}
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
              <button
                type="button"
                onClick={() => handleBanToggle(u._id, !u.banned)}
                className={`text-[11px] px-2 py-0.5 rounded ${
                  u.banned ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}
                disabled={user?.id === u._id}
              >
                {u.banned ? 'Unban' : 'Ban'}
              </button>
            </div>
          </div>
        ))}
        {!users.length && (
          <div className="text-xs text-slate-500 mt-2">
            No users yet. Seed the database or register accounts.
          </div>
        )}
      </div>
    </div>
  );
};

