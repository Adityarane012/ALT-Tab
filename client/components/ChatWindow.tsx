import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { fetchRoomMessages, requestJoinRoom, approveJoinRoom } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { ErrorModal } from './ErrorModal';
import { useRouter } from 'next/router';

type RoomType = {
  _id: string;
  name: string;
  members?: string[];
  pendingRequests?: any[]; // Populated with { _id, username }
  isPrivate?: boolean;
};

type ChatWindowProps = {
  room: RoomType | null;
};

export const ChatWindow = ({ room }: ChatWindowProps) => {
  const { socket } = useSocket();
  const { token, user: currentUser } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ id: string; username: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [banErrorMsg, setBanErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [joinRequested, setJoinRequested] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check Membership
  const isAdminOrMod = currentUser && ['admin', 'moderator'].includes(currentUser.role);
  const isMember = room && currentUser && (room.members?.includes(currentUser.id) || isAdminOrMod);
  const isPending = room && currentUser && (room.pendingRequests?.some((u: any) => (u._id || u) === currentUser.id));
  const isLockedOut = room?.isPrivate && !isMember;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  useEffect(() => {
    // Reset local state when switching rooms
    setJoinRequested(false);

    if (!room || !socket || isLockedOut) return;

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

    // Synchronize initial mute state from AuthContext
    if (currentUser && currentUser.muted !== undefined) {
      setIsMuted(currentUser.muted);
    }

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
    const onPermissionError = (payload: any) => {
      setBanErrorMsg(payload.message || 'Action Not Allowed');
    };
    const onUserMuted = (payload: any) => {
      if (currentUser && payload.username === currentUser.username) {
        setIsMuted(true);
      }
    };
    const onUserUnmuted = (payload: any) => {
      if (currentUser && payload.username === currentUser.username) {
        setIsMuted(false);
        setBanErrorMsg(''); // Clear error if they were staring at a mute error
      }
    };
    const onUserUnbanned = (payload: any) => {
      if (currentUser && payload.username === currentUser.username) {
        // Just in case we need to reset any states
      }
    };
    const onMuteError = (payload: any) => {
      setBanErrorMsg(payload.message || 'You are muted and cannot send messages.');
    };
    const onKicked = (payload: any) => {
      if (payload.roomId === room._id) {
        setWarningMsg('You were removed from this room by a moderator.');
        router.push('/dashboard');
      }
    };
    const onWarned = (payload: any) => {
      setWarningMsg(payload.message || 'You have received a warning.');
    };
    const onJoinApproved = (payload: any) => {
      if (payload.roomId === room?._id) {
         // Drop the gate locally
         setWarningMsg('Your join request was approved!');
      }
    };
    const onJoinRejected = (payload: any) => {
      if (payload.roomId === room?._id) {
         setWarningMsg('Your join request was rejected by a moderator.');
         setJoinRequested(false);
      }
    };

    socket.on('receiveMessage', onReceive);
    socket.on('systemMessage', onSystem);
    socket.on('clearMessages', onClear);
    socket.on('typing', onTyping);
    socket.on('reaction', onReaction);
    socket.on('permissionError', onPermissionError);
    socket.on('userMuted', onUserMuted);
    socket.on('userUnmuted', onUserUnmuted);
    socket.on('userUnbanned', onUserUnbanned);
    socket.on('muteError', onMuteError);
    socket.on('kickedFromRoom', onKicked);
    socket.on('userWarned', onWarned);
    socket.on('joinApproved', onJoinApproved);
    socket.on('joinRejected', onJoinRejected);

    return () => {
      socket.emit('leaveRoom', { roomId: room._id });
      socket.off('receiveMessage', onReceive);
      socket.off('systemMessage', onSystem);
      socket.off('clearMessages', onClear);
      socket.off('typing', onTyping);
      socket.off('reaction', onReaction);
      socket.off('permissionError', onPermissionError);
      socket.off('userMuted', onUserMuted);
      socket.off('userUnmuted', onUserUnmuted);
      socket.off('userUnbanned', onUserUnbanned);
      socket.off('muteError', onMuteError);
      socket.off('kickedFromRoom', onKicked);
      socket.off('userWarned', onWarned);
      socket.off('joinApproved', onJoinApproved);
      socket.off('joinRejected', onJoinRejected);
    };
  }, [room?._id, socket, token, currentUser, router, isLockedOut]);

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

  const handleRequestJoin = () => {
    if (!room || !socket) return;
    socket.emit('requestJoinChannel', { roomId: room._id });
    setJoinRequested(true);
  };

  const handleApproveJoin = (targetId: string) => {
    if (!room || !socket) return;
    socket.emit('approveJoinRequest', { roomId: room._id, userId: targetId });
  };

  const handleRejectJoin = (targetId: string) => {
    if (!room || !socket) return;
    socket.emit('rejectJoinRequest', { roomId: room._id, userId: targetId });
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

  // Private Room Lock State
  if (isLockedOut) {
    return (
      <div className="acm-panel h-full flex items-center justify-center relative">
        <div className="text-center animate-fade-in max-w-sm px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-gradient-to-br from-slate-800 to-acmDark border-[3px] border-slate-700/50 shadow-2xl flex items-center justify-center relative overflow-hidden">
             {/* Glow effect behind lock */}
            <div className="absolute inset-0 bg-acmPurple/20 blur-xl rounded-full" />
            <svg className="w-10 h-10 text-acmPurple relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-slate-100 mb-2 tracking-tight">Private Channel</h3>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            You need to be a member to see the messages in <span className="font-semibold text-acmTeal">#{room.name}</span>.
          </p>

          <button
            onClick={handleRequestJoin}
            disabled={isPending || joinRequested}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-300 shadow-glass ${
              isPending || joinRequested 
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-acmBlue via-acmPurple to-acmTeal text-white hover:opacity-90 active:scale-95'
            }`}
          >
            {isPending || joinRequested ? 'Request Pending...' : 'Request to Join'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ErrorModal 
        isOpen={!!banErrorMsg || !!warningMsg} 
        onClose={() => {
          setBanErrorMsg('');
          setWarningMsg('');
        }} 
        title={warningMsg ? 'Notice' : 'Action Failed'} 
        message={banErrorMsg || warningMsg} 
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

      {/* Admin Panel: Redesigned Pending Requests */}
      {isAdminOrMod && room.pendingRequests && room.pendingRequests.length > 0 && (
         <div className="bg-slate-900/80 border-b border-acmPurple/30 px-5 py-4 animate-fade-in shadow-2xl backdrop-blur-xl z-20">
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-acmPurple/20 text-acmPurple flex items-center justify-center text-xs font-black ring-1 ring-acmPurple/30 animate-pulse">
                     !
                  </div>
                  <span className="text-xs text-slate-100 font-bold uppercase tracking-wider">Pending Join Requests</span>
               </div>
               <span className="text-[10px] bg-acmPurple/20 text-acmPurple px-2 py-0.5 rounded-full font-bold border border-acmPurple/30">
                  {room.pendingRequests.length} QUEUED
               </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto max-h-[120px] pr-2 custom-scrollbar">
               {room.pendingRequests.map((pendingUser: any) => (
                  <div 
                    key={pendingUser._id || pendingUser} 
                    className="group bg-slate-800/40 border border-acmBorder/50 rounded-xl p-2.5 flex items-center justify-between hover:border-acmPurple/40 hover:bg-slate-800/60 transition-all duration-300"
                  >
                     <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-acmBorder flex items-center justify-center text-[10px] font-bold text-slate-300">
                           {pendingUser.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-xs text-slate-200 font-medium truncate">
                           {pendingUser.username || 'User'}
                        </span>
                     </div>
                     
                     <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                           onClick={() => handleApproveJoin(pendingUser._id || pendingUser)}
                           className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
                           title="Approve"
                        >
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                           </svg>
                        </button>
                        <button
                           onClick={() => handleRejectJoin(pendingUser._id || pendingUser)}
                           className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                           title="Reject"
                        >
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                           </svg>
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

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
          isMuted={isMuted}
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
