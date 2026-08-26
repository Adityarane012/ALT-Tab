const { User } = require('../models/User');

module.exports = async function muteCommand({ io, socket, args }) {
  const { ROLES } = require('../models/User');

  const [username] = args;
  if (!username) return;
  
  const target = await User.findOne({ username });
  if (!target) {
    socket.emit('systemMessage', { content: `User ${username} not found.` });
    return;
  }

  // Enforce hierarchical mute logic
  const requesterRole = socket.user.role;
  const targetRole = target.role;

  if (targetRole === ROLES.ADMIN) {
    socket.emit('permissionError', { 
      message: 'Permission denied: You cannot mute an Administrator.' 
    });
    return;
  }

  if (requesterRole === ROLES.MODERATOR && targetRole !== ROLES.USER) {
    socket.emit('permissionError', { 
      message: 'Permission denied: Moderators can only mute standard users.' 
    });
    return;
  }

  // Allow Mute
  target.muted = true;
  target.mutedBy = socket.user.id;
  target.mutedByRole = socket.user.role;
  target.mutedAt = new Date();
  await target.save();

  // Notify all sockets for real-time frontend disablement
  io.emit('userMuted', { username });

  io.emit('systemMessage', {
    content: `${username} was muted by ${socket.user.username}`
  });
};
