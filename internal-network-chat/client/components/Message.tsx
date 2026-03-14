import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

type MessageProps = {
  message: any;
  onReact: (messageId: string, emoji: string) => void;
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-acmPurple/15 text-acmPurple border-acmPurple/30',
  moderator: 'bg-acmTeal/15 text-acmTeal border-acmTeal/30',
  user: 'bg-slate-700/30 text-slate-300 border-slate-600/30'
};

const AVATAR_GRADIENTS: Record<string, string> = {
  admin: 'from-acmPurple to-acmBlue',
  moderator: 'from-acmTeal to-acmBlue',
  user: 'from-slate-600 to-slate-700'
};

const REACTION_EMOJIS = ['👍', '🔥', '🎯', '❤️', '😂', '🚀'];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const Message = ({ message, onReact }: MessageProps) => {
  const { user } = useAuth();
  const isOwn = user && message.sender?.id === user.id;
  const isSystem = message.sender?.id === 'system';
  const role = message.sender?.role || 'user';
  const [showAllReactions, setShowAllReactions] = useState(false);

  // System message
  if (isSystem) {
    return (
      <div className="flex justify-center my-3 animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/40 border border-acmBorder/40">
          <svg className="w-3.5 h-3.5 text-acmTeal/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-slate-400 italic">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'msg-row group flex gap-3 py-2 px-2 -mx-2 rounded-xl transition-colors duration-150 animate-fade-in',
      isOwn ? 'flex-row-reverse' : '',
      'hover:bg-slate-800/20'
    )}>
      {/* Avatar */}
      <div className={clsx(
        'w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br shadow-lg',
        AVATAR_GRADIENTS[role] || AVATAR_GRADIENTS.user
      )}>
        {message.sender?.username?.[0]?.toUpperCase()}
      </div>

      {/* Content */}
      <div className={clsx('max-w-xl min-w-0', isOwn && 'text-right')}>
        {/* Header */}
        <div className={clsx('flex items-center gap-2 mb-0.5', isOwn && 'flex-row-reverse')}>
          <span className="text-sm font-semibold text-slate-100 truncate">
            {message.sender?.username}
          </span>
          <span className={clsx('acm-badge', ROLE_COLORS[role])}>
            {role}
          </span>
          <span className="text-[10px] text-slate-500 tabular-nums">
            {timeAgo(message.timestamp)}
          </span>
        </div>

        {/* Message body */}
        <div className={clsx(
          'text-sm text-slate-200 leading-relaxed mt-0.5',
          isOwn && 'text-right'
        )}>
          {message.content}
        </div>

        {/* Reactions row */}
        <div className={clsx('flex items-center gap-1.5 mt-1.5 flex-wrap', isOwn && 'justify-end')}>
          {/* Existing reactions */}
          {message.reactions?.filter((r: any) => r.users.length > 0).map((r: any) => {
            const isOwn = r.users.some((u: any) => String(u) === String(user?.id));
            return (
              <button
                key={r.emoji}
                onClick={(e) => {
                  const el = e.currentTarget;
                  el.classList.remove('reaction-pop');
                  void el.offsetWidth; // trigger reflow
                  el.classList.add('reaction-pop');
                  onReact(message._id, r.emoji);
                }}
                className={clsx(
                  'reaction-pill text-[11px] px-2.5 py-1 rounded-lg border inline-flex items-center gap-1',
                  isOwn
                    ? 'bg-acmTeal/15 border-acmTeal/30 text-acmTeal shadow-glow-teal'
                    : 'bg-slate-800/60 border-acmBorder/40 text-slate-300 hover:border-slate-600 hover:bg-slate-700/40'
                )}
              >
                <span className="text-sm">{r.emoji}</span>
                <span className="font-semibold tabular-nums">{r.users.length}</span>
              </button>
            );
          })}

          {/* Quick react buttons (shown on hover) */}
          <div className="msg-actions flex items-center gap-0.5 bg-slate-800/40 rounded-xl border border-acmBorder/30 px-1 py-0.5">
            {(showAllReactions ? REACTION_EMOJIS : REACTION_EMOJIS.slice(0, 3)).map((emoji) => (
              <button
                key={emoji}
                className="reaction-emoji-btn w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                onClick={() => onReact(message._id, emoji)}
              >
                {emoji}
              </button>
            ))}
            <button
              className="reaction-emoji-btn w-7 h-7 rounded-lg flex items-center justify-center text-xs text-slate-500 hover:text-slate-300"
              onClick={() => setShowAllReactions(v => !v)}
            >
              {showAllReactions ? '−' : '+'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
