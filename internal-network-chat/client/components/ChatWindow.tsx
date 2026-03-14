import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { fetchRoomMessages } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { ErrorModal } from './ErrorModal';

type ChatWindowProps = {
  room: { _id: string; name: string } | null;
};

export const ChatWindow = ({ room }: ChatWindowProps) => {
  const { socket } = useSocket();
  const { token } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ id: string; username: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [banErrorMsg, setBanErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  useEffect(() => {
    if (!room || !socket) return;

    socket.emit('joinRoom', { roomId: room._id });
    const load = async () => {
      if (!token) return;
      setIsLoading(true);
      const data = await fetchRoomMessages(token, room._id);
      setMessages(
        data.map((m: any) => ({
          ...m,
          sender: {
            id: m.senderId?._id || m.senderId,
            username: m.senderId?.username || m.sender?.username,
            role: m.senderId?.role || m.sender?.role
          }
        }))
      );
      setIsLoading(false);
      setTimeout(() => scrollToBottom(false), 50);
    };
    load();

    const onReceive = (msg: any) => {
      if (msg.roomId === room._id) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => scrollToBottom(), 50);
      }
    };
    const onSystem = (msg: any) => {
      if (!msg.roomId || msg.roomId === room._id) {
        setMessages((prev) => [...prev, {
          _id: `system-${Date.now()}`,
          roomId: room._id,
          sender: { id: 'system', username: 'system', role: 'admin' },
          content: msg.content,
          reactions: [],
          timestamp: new Date().toISOString()
        }]);
        setTimeout(() => scrollToBottom(), 50);
      }
    };
    const onClear = (payload: any) => {
      if (payload.roomId === room._id) {
        setMessages([]);
      }
    };
    const onTyping = (payload: any) => {
      if (payload.roomId !== room._id) return;
      setTypingUsers((prev) => {
        const exists = prev.some((u) => u.id === payload.user.id);
        if (payload.isTyping && !exists) {
          return [...prev, payload.user];
        }
        if (!payload.isTyping) {
          return prev.filter((u) => u.id !== payload.user.id);
        }
        return prev;
      });
    };
    const onReaction = (payload: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === payload.messageId
            ? {
                ...m,
                reactions: updateReactions(m.reactions || [], payload.emoji, payload.userId)
              }
            : m
        )
      );
    };
    const onBanError = (payload: any) => {
      setBanErrorMsg(payload.message || 'Action Not Allowed');
    };

    socket.on('receiveMessage', onReceive);
    socket.on('systemMessage', onSystem);
    socket.on('clearMessages', onClear);
    socket.on('typing', onTyping);
    socket.on('reaction', onReaction);
    socket.on('banError', onBanError);

    return () => {
      socket.emit('leaveRoom', { roomId: room._id });
      socket.off('receiveMessage', onReceive);
      socket.off('systemMessage', onSystem);
      socket.off('clearMessages', onClear);
      socket.off('typing', onTyping);
      socket.off('reaction', onReaction);
      socket.off('banError', onBanError);
    };
  }, [room?._id, socket, token]);

  // Scroll detection
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  const handleSend = (content: string) => {
    if (!socket || !room) return;
    socket.emit('sendMessage', { roomId: room._id, content });
  };

  const handleTypingChange = (isTyping: boolean) => {
    if (!socket || !room) return;
    socket.emit('typing', { roomId: room._id, isTyping });
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (!socket || !room) return;
    socket.emit('reaction', { messageId, emoji, roomId: room._id });
  };

  // No room selected state
  if (!room) {
    return (
      <div className="acm-panel h-full flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-acmBlue/20 to-acmPurple/20 border border-acmBorder flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Select a channel</h3>
          <p className="text-xs text-slate-500 max-w-[200px]">Pick a room from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ErrorModal 
        isOpen={!!banErrorMsg} 
        message={banErrorMsg} 
        onClose={() => setBanErrorMsg('')} 
      />
      
      <div className="acm-panel h-full flex flex-col">
        {/* Channel header */}
      <div className="px-5 py-3.5 border-b border-acmBorder/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-acmTeal/10 border border-acmTeal/20 flex items-center justify-center">
            <span className="text-acmTeal font-bold text-sm">#</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">
              {room.name}
            </div>
            <div className="text-[10px] text-slate-500">
              {messages.length} message{messages.length !== 1 ? 's' : ''} in this channel
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 relative"
        onScroll={handleScroll}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 animate-fade-in">
              <svg className="w-5 h-5 text-acmTeal animate-spin-slow" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-slate-400">Loading messages...</span>
            </div>
          </div>
        )}

        {/* Empty room state */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-acmTeal/10 to-acmBlue/10 border border-acmBorder flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              No messages yet
            </h3>
            <p className="text-xs text-slate-500">
              Be the first to say something in <span className="text-acmTeal">#{room.name}</span>
            </p>
          </div>
        )}

        {/* Message list */}
        {!isLoading && messages.map((m) => (
          <Message key={m._id} message={m} onReact={handleReact} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom FAB */}
      {showScrollBtn && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => scrollToBottom()}
            className="px-3 py-1.5 rounded-full bg-acmSurface/90 border border-acmBorder text-xs text-slate-300 shadow-glass flex items-center gap-1.5 hover:border-acmTeal/40 transition-all duration-200 animate-slide-up"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            New messages
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-3">
        <MessageInput
          onSend={handleSend}
          onTypingChange={handleTypingChange}
          typingUsers={typingUsers}
        />
      </div>
      </div>
    </>
  );
};

function updateReactions(reactions: any[], emoji: string, userId: string) {
  let exists = false;
  const newReactions = reactions.map((r) => {
    if (r.emoji === emoji) {
      exists = true;
      const has = r.users.some((u: any) => String(u) === String(userId));
      return {
        ...r,
        users: has
          ? r.users.filter((u: any) => String(u) !== String(userId))
          : [...r.users, userId]
      };
    }
    return r;
  });

  if (!exists) {
    newReactions.push({ emoji, users: [userId] });
  }

  return newReactions;
}
