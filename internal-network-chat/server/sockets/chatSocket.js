const Message = require('../models/Message');
const Room = require('../models/Room');
const { User } = require('../models/User');
const { handleCommand } = require('../utils/commandParser');

function attachSocketHandlers(io, socket) {
  socket.on('joinRoom', async ({ roomId }) => {
    socket.join(roomId);
    await Room.findByIdAndUpdate(roomId, { $addToSet: { members: socket.user.id } });
    io.to(roomId).emit('systemMessage', {
      roomId,
      content: `${socket.user.username} joined the room`
    });
  });

  socket.on('leaveRoom', async ({ roomId }) => {
    socket.leave(roomId);
    await Room.findByIdAndUpdate(roomId, { $pull: { members: socket.user.id } });
    io.to(roomId).emit('systemMessage', {
      roomId,
      content: `${socket.user.username} left the room`
    });
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('typing', {
      roomId,
      user: { id: socket.user.id, username: socket.user.username },
      isTyping
    });
  });

  socket.on('sendMessage', async ({ roomId, content }) => {
    if (!content || !roomId) return;

    // Check mute status dynamically
    const dbUser = await User.findById(socket.user.id);
    if (!dbUser) return;
    if (dbUser.muted) {
      socket.emit('muteError', { message: 'You are muted and cannot send messages.' });
      return;
    }

    const handled = await handleCommand({ io, socket, roomId, content });
    if (handled) return;

    const message = await Message.create({
      roomId,
      senderId: socket.user.id,
      content
    });

    const payload = {
      _id: message._id,
      roomId,
      sender: {
        id: socket.user.id,
        username: socket.user.username,
        role: socket.user.role
      },
      content: message.content,
      reactions: [],
      timestamp: message.timestamp
    };

    io.to(roomId).emit('receiveMessage', payload);
  });

  socket.on('reaction', async ({ messageId, emoji, roomId }) => {
    if (!messageId || !emoji) return;
    const message = await Message.findById(messageId);
    if (!message) return;

    let reaction = message.reactions.find((r) => r.emoji === emoji);
    if (!reaction) {
      message.reactions.push({ emoji, users: [socket.user.id] });
    } else {
      const hasReacted = reaction.users.some(
        (u) => String(u) === String(socket.user.id)
      );
      if (hasReacted) {
        reaction.users.pull(socket.user.id);
      } else {
        reaction.users.push(socket.user.id);
      }
    }

    await message.save();
    io.to(roomId).emit('reaction', {
      messageId,
      emoji,
      userId: socket.user.id
    });
  });

  // Microsoft Teams Channel Requests
  socket.on('requestJoinChannel', async ({ roomId }) => {
    if (!roomId) return;
    const room = await Room.findById(roomId);
    if (!room) return;

    if (room.members.includes(socket.user.id)) return; // Already in

    if (!room.pendingRequests.includes(socket.user.id)) {
      room.pendingRequests.push(socket.user.id);
      await room.save();
      
      // Notify active admins and moderators
      io.sockets.sockets.forEach((s) => {
        if (s.user && ['admin', 'moderator'].includes(s.user.role)) {
          s.emit('newJoinRequest', { 
            roomId, 
            user: { _id: socket.user.id, username: socket.user.username } 
          });
        }
      });
    }
  });

  socket.on('approveJoinRequest', async ({ roomId, userId }) => {
    if (!['admin', 'moderator'].includes(socket.user.role)) return; // Auth check!
    
    const room = await Room.findById(roomId);
    if (!room || !userId) return;

    if (room.pendingRequests.includes(userId)) {
      room.pendingRequests.pull(userId);
      room.members.push(userId);
      await room.save();

      // Find the specific user's socket to grant them explicit entry
      io.sockets.sockets.forEach((s) => {
        if (s.user && String(s.user.id) === String(userId)) {
          s.emit('joinApproved', { roomId });
          s.emit('systemMessage', { roomId, content: 'Your join request was approved!' });
        }
      });

      // Notify the admins that the request banner can disappear
      io.sockets.sockets.forEach((s) => {
        if (s.user && ['admin', 'moderator'].includes(s.user.role)) {
          s.emit('joinRequestHandled', { roomId, userId });
        }
      });
    }
  });

  socket.on('rejectJoinRequest', async ({ roomId, userId }) => {
    if (!['admin', 'moderator'].includes(socket.user.role)) return;

    const room = await Room.findById(roomId);
    if (!room || !userId) return;

    if (room.pendingRequests.includes(userId)) {
      room.pendingRequests.pull(userId);
      await room.save();

      io.sockets.sockets.forEach((s) => {
        if (s.user && String(s.user.id) === String(userId)) {
          s.emit('joinRejected', { roomId });
        }
      });

      io.sockets.sockets.forEach((s) => {
        if (s.user && ['admin', 'moderator'].includes(s.user.role)) {
          s.emit('joinRequestHandled', { roomId, userId });
        }
      });
    }
  });

  socket.on('disconnect', () => {
    // Optional: broadcast disconnect info
  });
}

module.exports = {
  attachSocketHandlers
};

