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

  const load = async () => {
    if (!token) return;
    const data = await fetchRecentMessages(token, 50);
    setMessages(data);
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
    <div className="acm-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Activity
          </div>
          <div className="text-sm text-slate-100">
            Live Monitor
          </div>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="text-[11px] text-slate-400 hover:text-acmTeal"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-y-auto text-xs space-y-2">
        <div>
          <div className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">
            Recent Messages
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1 border-b border-slate-900 pb-2">
            {messages.map((m) => (
              <div key={m._id} className="flex gap-2 text-[11px] text-slate-300">
                <span className="text-slate-500">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-acmTeal">#{(m as any).roomId?.name || 'room'}</span>
                <span className="text-slate-200">
                  {m.senderId?.username || 'system'}:
                </span>
                <span className="text-slate-100">{m.content}</span>
              </div>
            ))}
            {!messages.length && (
              <div className="text-slate-500 text-[11px]">
                No activity yet.
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">
            Command Activity
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {commandActivity.map((m) => (
              <div key={m._id} className="flex gap-2 text-[11px] text-slate-300">
                <span className="text-slate-500">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-slate-200">
                  {m.senderId?.username || 'system'}:
                </span>
                <span className="text-acmPurple">{m.content}</span>
              </div>
            ))}
            {!commandActivity.length && (
              <div className="text-slate-500 text-[11px]">
                No recent commands.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

