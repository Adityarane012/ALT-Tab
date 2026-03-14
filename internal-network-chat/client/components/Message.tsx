import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

type MessageProps = {
  message: any;
  onReact: (messageId: string, emoji: string) => void;
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-acmPurple/20 text-acmPurple border-acmPurple/40',
  moderator: 'bg-acmTeal/20 text-acmTeal border-acmTeal/40',
  user: 'bg-slate-700/40 text-slate-200 border-slate-500/40'
};

export const Message = ({ message, onReact }: MessageProps) => {
  const { user } = useAuth();
  const isOwn = user && message.sender?.id === user.id;

  const role = message.sender?.role || 'user';

  return (
    <div className={clsx('flex gap-2 mb-2', isOwn && 'flex-row-reverse')}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-acmBlue to-acmPurple flex items-center justify-center text-xs font-semibold">
        {message.sender?.username?.[0]?.toUpperCase()}
      </div>
      <div className="max-w-xl">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-100">
            {message.sender?.username}
          </span>
          <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', ROLE_COLORS[role])}>
            {role.toUpperCase()}
          </span>
          <span className="text-[10px] text-slate-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="text-sm text-slate-100 mt-0.5">
          {message.content}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {['👍', '🔥', '🎯'].map((emoji) => (
            <button
              key={emoji}
              className="text-xs text-slate-500 hover:text-acmTeal transition"
              onClick={() => onReact(message._id, emoji)}
            >
              {emoji}
            </button>
          ))}
          <div className="flex gap-1">
            {message.reactions?.map((r: any) => (
              <span
                key={r.emoji}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-100"
              >
                {r.emoji} {r.users.length}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

