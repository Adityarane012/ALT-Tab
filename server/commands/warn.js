const { User } = require('../models/User');

module.exports = async function warnCommand({ io, socket, args, roomId }) {
  const { ROLES } = require('../models/User');

  const [username, ...reasonArgs] = args;
  const reason = reasonArgs.join(' ');
  
  if (!username) {
    socket.emit('systemMessage', { roomId, content: 'Usage: /warn username reason' });
    return;
  }

  if (!reason) {
    socket.emit('systemMessage', { roomId, content: 'You must provide a warning reason.' });
    return;
  }
  
  const target = await User.findOne({ username });
  if (!target) {
    socket.emit('systemMessage', { roomId, content: `User ${username} not found.` });
    return;
  }

  // Enforce hierarchical warn logic
  const requesterRole = socket.user.role;
  const targetRole = target.role;

  if (requesterRole === ROLES.MODERATOR && targetRole !== ROLES.USER) {
    socket.emit('permissionError', { 
      message: 'Permission denied: Moderators can only warn standard users.' 
    });
    return;
  }
  // Admins can warn anyone according to the spec, so no explicit block for Admins warning Admins.

  // Apply warning
  target.warnings.push({
    message: reason,
    issuedBy: socket.user.id,
    issuedByRole: socket.user.role,
    createdAt: new Date()
  });
  
  await target.save();

  // Notify the exact target socket
  const targetSocket = [...io.sockets.sockets.values()].find(
    (s) => s.user && String(s.user.id) === String(target._id)
  );

  if (targetSocket) {
    targetSocket.emit('userWarned', { message: `You have received a warning: ${reason}` });
  }

  // Also send a system message to moderators/admins
  [...io.sockets.sockets.values()].forEach(s => {
    // Check if socket is in the room and is an admin or moderator
    if (s.rooms.has(roomId) && s.user && (s.user.role === ROLES.ADMIN || s.user.role === ROLES.MODERATOR)) {
      s.emit('systemMessage', {
        roomId,
        content: `[WARNING] ${username} was warned by ${socket.user.username}: ${reason}`
      });
    }
  });
};
