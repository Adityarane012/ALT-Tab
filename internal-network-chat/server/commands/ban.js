const { User } = require('../models/User');

module.exports = async function banCommand({ io, socket, args }) {
  const { ROLES } = require('../models/User');

  const [username] = args;
  if (!username) return;
  const target = await User.findOne({ username });
  if (!target) {
    socket.emit('systemMessage', { content: `User ${username} not found.` });
    return;
  }

  // Enforce role hierarchy
  const requesterRole = socket.user.role;
  const targetRole = target.role;

  if (targetRole === ROLES.ADMIN) {
    socket.emit('permissionError', { message: 'You cannot ban another admin.' });
    return;
  }
  
  if (requesterRole === ROLES.MODERATOR && targetRole !== ROLES.USER) {
    socket.emit('permissionError', { message: 'Permission denied: Moderators can only ban standard users.' });
    return;
  }

  target.banned = true;
  target.bannedBy = socket.user.id;
  target.bannedByRole = socket.user.role;
  target.bannedAt = new Date();
  await target.save();

  // Disconnect all sockets of this user
  [...io.sockets.sockets.values()].forEach((s) => {
    if (s.user && String(s.user.id) === String(target._id)) {
      s.emit('bannedUser', { message: 'You have been banned from the platform.' });
      s.disconnect(true);
    }
  });

  io.emit('systemMessage', {
    content: `${username} was banned by ${socket.user.username}`
  });
};

