import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { fetchRoomMessages } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Message } from './Message';
import { MessageInput } from './MessageInput';

type ChatWindowProps = {
  room: { _id: string; name: string } | null;
};

export const ChatWindow = ({ room }: ChatWindowProps) => {
  const { socket } = useSocket();
  const { token } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ id: string; username: string }[]>([]);

  useEffect(() => {
    if (!room || !socket) return;

    socket.emit('joinRoom', { roomId: room._id });
    const load = async () => {
      if (!token) return;
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
    };
    load();

    const onReceive = (msg: any) => {
      if (msg.roomId === room._id) {
        setMessages((prev) => [...prev, msg]);
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

    socket.on('receiveMessage', onReceive);
    socket.on('systemMessage', onSystem);
    socket.on('clearMessages', onClear);
    socket.on('typing', onTyping);
    socket.on('reaction', onReaction);

    return () => {
      socket.emit('leaveRoom', { roomId: room._id });
      socket.off('receiveMessage', onReceive);
      socket.off('systemMessage', onSystem);
      socket.off('clearMessages', onClear);
      socket.off('typing', onTyping);
      socket.off('reaction', onReaction);
    };
  }, [room?._id, socket, token]);

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

  if (!room) {
    return (
      <div className="acm-panel h-full flex items-center justify-center text-slate-500 text-sm">
        Select a room to get started.
      </div>
    );
  }

  return (
    <div className="acm-panel h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Channel
          </div>
          <div className="text-sm text-slate-100 flex items-center gap-2">
            <span className="text-acmTeal">#</span>
            {room.name}
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wide">
          MPSTME ACM Internal Network
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.map((m) => (
          <Message key={m._id} message={m} onReact={handleReact} />
        ))}
      </div>
      <div className="px-4 pb-3">
        <MessageInput
          onSend={handleSend}
          onTypingChange={handleTypingChange}
          typingUsers={typingUsers}
        />
      </div>
    </div>
  );
};

function updateReactions(reactions: any[], emoji: string, userId: string) {
  let reaction = reactions.find((r) => r.emoji === emoji);
  if (!reaction) {
    reaction = { emoji, users: [] };
    reactions.push(reaction);
  }
  const has = reaction.users.some((u: any) => String(u) === String(userId));
  if (has) {
    reaction.users = reaction.users.filter((u: any) => String(u) !== String(userId));
  } else {
    reaction.users.push(userId);
  }
  return [...reactions];
}

