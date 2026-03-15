import clsx from 'clsx';

type Room = {
  _id: string;
  name: string;
  members: string[];
  pendingRequests: any[];
  isPrivate: boolean;
};

type RoomListProps = {
  rooms: Room[];
  activeRoomId: string | null;
  onSelect: (room: Room) => void;
  currentUserId: string;
  currentUserRole: string; // Needed for admin bypass and badge visibility
};

const ROOM_ICONS: Record<string, string> = {
  general: '💬',
  announcements: '📢',
  computer: '💻',
  'ai-ds': '🤖',
  it: '🌐',
  extc: '📡',
  mechanical: '⚙️',
  civil: '🏗️',
  events: '📅',
  projects: '🚀',
  random: '🎲',
};

function getRoomIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ROOM_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '#';
}

export const RoomList = ({ rooms, activeRoomId, onSelect, currentUserId, currentUserRole }: RoomListProps) => {
  const isAdminOrMod = ['admin', 'moderator'].includes(currentUserRole);

  return (
    <div className="acm-panel h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-acmBorder/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-acmTeal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Channels
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-acmTeal/10 text-acmTeal border border-acmTeal/20 font-medium">
            {rooms.length}
          </span>
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {rooms.map((room, i) => {
          const isActive = activeRoomId === room._id;
          const icon = getRoomIcon(room.name);
          const isMember = room.members?.includes(currentUserId);
          // Admins and Moderators automatically have access
          const isLocked = room.isPrivate && !isMember && !isAdminOrMod;
          const pendingCount = room.pendingRequests?.length || 0;

          return (
            <button
              key={room._id}
              className={clsx(
                'w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-all duration-200 group relative animate-fade-in',
                isActive
                  ? 'bg-acmTeal/10 text-acmTeal border-l-2 border-acmTeal'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-2 border-transparent',
                isLocked && !isActive && 'opacity-60 hover:opacity-100'
              )}
              style={{ animationDelay: `${i * 30}ms` }}
              onClick={() => onSelect(room)}
            >
              <span className={clsx(
                'text-sm transition-transform duration-200 group-hover:scale-110',
                isActive && 'scale-110'
              )}>
                {icon === '#' ? (
                  <span className={clsx(
                    'font-bold text-base',
                    isActive ? 'text-acmTeal' : 'text-slate-500 group-hover:text-slate-400'
                  )}>#</span>
                ) : (
                  <span className="text-sm">{icon}</span>
                )}
              </span>
              <span className={clsx(
                'font-medium truncate flex-1',
                isActive ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-200'
              )}>
                {room.name}
              </span>

              {/* Pending Request Indicator for Admins/Mods */}
              {isAdminOrMod && pendingCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-acmPurple text-white font-bold animate-pulse">
                  ({pendingCount})
                </span>
              )}
              
              {/* Lock Icon for private unjoined rooms */}
              {isLocked && (
                <svg className="ml-auto w-3 h-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}

              {isActive && !isLocked && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-acmTeal animate-pulse" />
              )}
            </button>
          );
        })}

        {/* Empty state */}
        {!rooms.length && (
          <div className="flex flex-col items-center justify-center h-full px-4 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-acmBorder flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">No channels yet</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Create one from Admin Panel</p>
          </div>
        )}
      </div>
    </div>
  );
};
