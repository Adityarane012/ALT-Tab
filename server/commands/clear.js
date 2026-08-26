const Message = require('../models/Message');

module.exports = async function clearCommand({ io, socket, roomId }) {
  await Message.deleteMany({ roomId });
  io.to(roomId).emit('clearMessages', { roomId });
  io.to(roomId).emit('systemMessage', {
    roomId,
    content: `Messages were cleared by ${socket.user.username}`
  });
};

