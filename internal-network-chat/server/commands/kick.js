const { User } = require('../models/User');

module.exports = async function kickCommand({ io, socket, args, roomId }) {
  const [username] = args;
  if (!username) return;
  const target = await User.findOne({ username });
  if (!target) return;

  const targetSocket = [...io.sockets.sockets.values()].find(
    (s) => s.user && String(s.user.id) === String(target._id)
  );
  if (targetSocket) {
    targetSocket.leave(roomId);
    targetSocket.emit('systemMessage', {
      roomId,
      content: `You were kicked from this room by ${socket.user.username}`
    });
  }

  io.to(roomId).emit('systemMessage', {
    roomId,
    content: `${username} was kicked by ${socket.user.username}`
  });
};

