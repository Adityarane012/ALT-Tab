import clsx from 'clsx';

type UserListProps = {
  users: { id: string; username: string; role: string }[];
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

export const UserList = ({ users }: UserListProps) => {
  return (
    <div className="acm-panel h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-acmBorder/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Online
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          {users.length}
        </span>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {users.map((u, i) => {
          const gradient = AVATAR_GRADIENT[u.role] || AVATAR_GRADIENT.user;
          const badge = ROLE_BADGE[u.role] || ROLE_BADGE.user;
          return (
            <div
              key={u.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/30 rounded-lg mx-1 transition-colors duration-150 group animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Avatar with presence dot */}
              <div className="relative flex-shrink-0">
                <div className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br',
                  gradient
                )}>
                  {u.username[0]?.toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-acmSurface" />
              </div>

              {/* Name & role */}
              <div className="min-w-0 flex-1">
                <div className="text-sm text-slate-200 font-medium truncate group-hover:text-slate-100 transition-colors">
                  {u.username}
                </div>
              </div>

              {/* Role badge */}
              <span className={clsx('acm-badge flex-shrink-0', badge)}>
                {u.role}
              </span>
            </div>
          );
        })}

        {/* Empty state */}
        {!users.length && (
          <div className="flex flex-col items-center justify-center h-full px-4 py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-acmBorder flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">No users online</p>
          </div>
        )}
      </div>
    </div>
  );
};
