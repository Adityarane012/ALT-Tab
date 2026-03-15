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

  socket.on('disconnect', () => {
    // Optional: broadcast disconnect info
  });
}

module.exports = {
  attachSocketHandlers
};

