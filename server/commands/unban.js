const { User } = require('../models/User');

module.exports = async function unbanCommand({ io, socket, args }) {
  const { ROLES } = require('../models/User');

  const [username] = args;
  if (!username) return;
  
  const target = await User.findOne({ username });
  if (!target) {
    socket.emit('systemMessage', { content: `User ${username} not found.` });
    return;
  }

  if (!target.banned) {
    socket.emit('systemMessage', { content: `User ${username} is not currently banned.` });
    return;
  }

  // Enforce hierarchical unban logic
  const requesterRole = socket.user.role;
  const bannedByRole = target.bannedByRole;

  if (requesterRole === ROLES.MODERATOR && bannedByRole === ROLES.ADMIN) {
    socket.emit('permissionError', { 
      message: 'You do not have permission to unban a user who was banned by an Administrator.' 
    });
    return;
  }

  // Allow Unban
  target.banned = false;
  target.bannedBy = undefined;
  target.bannedByRole = undefined;
  target.bannedAt = undefined;
  await target.save();

  io.emit('userUnbanned', { username });

  io.emit('systemMessage', {
    content: `${username} was unbanned by ${socket.user.username}`
  });
};
