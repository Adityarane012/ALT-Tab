const { User } = require('../models/User');

module.exports = async function unmuteCommand({ io, socket, args }) {
  const { ROLES } = require('../models/User');

  const [username] = args;
  if (!username) return;
  
  const target = await User.findOne({ username });
  if (!target) {
    socket.emit('systemMessage', { content: `User ${username} not found.` });
    return;
  }

  if (!target.muted) {
    socket.emit('systemMessage', { content: `User ${username} is not currently muted.` });
    return;
  }

  // Enforce hierarchical unmute logic
  const requesterRole = socket.user.role;
  const mutedByRole = target.mutedByRole;

  if (requesterRole === ROLES.MODERATOR && mutedByRole === ROLES.ADMIN) {
    socket.emit('permissionError', { 
      message: 'You do not have permission to unmute a user who was muted by an Administrator.' 
    });
    return;
  }

  // Allow Unmute
  target.muted = false;
  target.mutedBy = undefined;
  target.mutedByRole = undefined;
  target.mutedAt = undefined;
  await target.save();

  io.emit('userUnmuted', { username });

  io.emit('systemMessage', {
    content: `${username} was unmuted by ${socket.user.username}`
  });
};
