import { useEffect, useState } from 'react';
import { fetchRecentMessages } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type ActivityMessage = {
  _id: string;
  roomId: string;
  content: string;
  timestamp: string;
  senderId?: {
    _id: string;
    username: string;
    role: string;
  };
};

export const ActivityMonitor = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ActivityMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = async () => {
    if (!token) return;
    setIsRefreshing(true);
    const data = await fetchRecentMessages(token, 50);
    setMessages(data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      void load();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const commandActivity = messages.filter((m) => m.content.startsWith('/'));

  return (
    <div className="acm-card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-acmBlue/10 border border-acmBlue/20 flex items-center justify-center text-acmBlue">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Live Monitor
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              Real-time activity feed
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={isRefreshing}
          className="acm-btn-ghost flex items-center gap-1.5 text-[11px]"
        >
          <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 14.652" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Recent Messages */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              Recent Messages
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-acmBorder/40">
              {messages.length}
            </span>
          </div>
          <div className="space-y-0.5 max-h-44 overflow-y-auto border-b border-acmBorder/30 pb-3">
            {messages.map((m, i) => (
              <div
                key={m._id}
                className="flex gap-2 text-[11px] text-slate-300 py-1.5 px-2 rounded-lg hover:bg-slate-800/20 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <span className="text-slate-500 tabular-nums flex-shrink-0">
                  {new Date(m.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-acmTeal flex-shrink-0">
                  #{(m as any).roomId?.name || 'room'}
                </span>
                <span className="text-slate-200 font-medium flex-shrink-0">
                  {m.senderId?.username || 'system'}
                </span>
                <span className="text-slate-400 truncate">{m.content}</span>
              </div>
            ))}
            {!messages.length && (
              <div className="text-slate-500 text-xs py-4 text-center">
                No activity yet — messages will appear here in real-time.
              </div>
            )}
          </div>
        </div>

        {/* Command Activity */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5 text-acmPurple/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              Command Activity
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-acmPurple/10 text-acmPurple border border-acmPurple/20">
              {commandActivity.length}
            </span>
          </div>
          <div className="space-y-0.5 max-h-36 overflow-y-auto">
            {commandActivity.map((m, i) => (
              <div
                key={m._id}
                className="flex gap-2 text-[11px] py-1.5 px-2 rounded-lg hover:bg-slate-800/20 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <span className="text-slate-500 tabular-nums flex-shrink-0">
                  {new Date(m.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-slate-200 font-medium flex-shrink-0">
                  {m.senderId?.username || 'system'}
                </span>
                <span className="text-acmPurple font-mono truncate">{m.content}</span>
              </div>
            ))}
            {!commandActivity.length && (
              <div className="text-slate-500 text-xs py-4 text-center">
                No commands executed recently.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
