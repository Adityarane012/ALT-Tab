const { User } = require('../models/User');

module.exports = async function kickCommand({ io, socket, args, roomId }) {
  const { ROLES } = require('../models/User');

  const [username] = args;
  if (!username) return;
  const target = await User.findOne({ username });
  if (!target) {
    socket.emit('systemMessage', { roomId, content: `User ${username} not found.` });
    return;
  }

  // Enforce hierarchical kick logic
  const requesterRole = socket.user.role;
  const targetRole = target.role;

  if (targetRole === ROLES.ADMIN) {
    socket.emit('permissionError', { 
      message: 'Permission denied: You cannot kick an Administrator.' 
    });
    return;
  }

  if (requesterRole === ROLES.MODERATOR && targetRole !== ROLES.USER) {
    socket.emit('permissionError', { 
      message: 'Permission denied: Moderators can only kick standard users.' 
    });
    return;
  }

  // Execute Kick and Log
  target.kickedFromRooms.push(roomId);
  await target.save();

  const targetSocket = [...io.sockets.sockets.values()].find(
    (s) => s.user && String(s.user.id) === String(target._id)
  );

  if (targetSocket) {
    targetSocket.leave(roomId);
    targetSocket.emit('kickedFromRoom', { roomId });
  }

  io.to(roomId).emit('systemMessage', {
    roomId,
    content: `${username} was kicked from the room by ${socket.user.username}`
  });
};

