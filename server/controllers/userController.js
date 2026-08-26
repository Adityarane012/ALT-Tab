const { User, ROLES } = require('../models/User');

async function getUsers(req, res) {
  const users = await User.find({}, 'username role banned createdAt updatedAt');
  return res.json(users);
}

async function updateUserRole(req, res) {
  const { userId } = req.params;
  const { role } = req.body;

  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, fields: 'username role banned createdAt updatedAt' }
  );

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Real-time update to the specific user
  if (req.io) {
    const sockets = await req.io.fetchSockets();
    const targetSocket = sockets.find(s => s.user && String(s.user.id) === String(user._id));
    if (targetSocket) {
      targetSocket.user.role = user.role; // update in-memory socket user so commands work immediately
      targetSocket.emit('roleUpdate', { role: user.role });
    }
  }

  return res.json(user);
}

async function toggleUserBan(req, res) {
  const { userId } = req.params;
  const { banned } = req.body;
  const requesterRole = req.user.role;

  const target = await User.findById(userId);
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Enforce role hierarchy on ban attempts
  if (banned) {
    if (target.role === ROLES.ADMIN) {
      return res.status(403).json({ message: 'Cannot ban an Administrator.' });
    }
    if (requesterRole === ROLES.MODERATOR && target.role !== ROLES.USER) {
      return res.status(403).json({ message: 'Moderators can only ban standard users.' });
    }
  } else {
    // Enforce unban hierarchy
    if (requesterRole === ROLES.MODERATOR && target.bannedByRole === ROLES.ADMIN) {
      return res.status(403).json({ message: 'You do not have permission to unban a user banned by an Administrator.' });
    }
  }

  target.banned = Boolean(banned);
  target.bannedBy = banned ? req.user._id : undefined;
  target.bannedByRole = banned ? req.user.role : undefined;
  target.bannedAt = banned ? new Date() : undefined;
  
  await target.save();

  // If user is being banned, instantly sever their connections
  if (target.banned && req.io) {
    const sockets = await req.io.fetchSockets();
    const targetSockets = sockets.filter(s => s.user && String(s.user.id) === String(target._id));
    targetSockets.forEach(s => {
      s.emit('bannedUser', { message: 'You have been banned from the platform.' });
      s.disconnect(true);
    });
  }

  // Create a clean return object without password
  const updatedUser = {
    _id: target._id,
    username: target.username,
    role: target.role,
    banned: target.banned,
    bannedBy: target.bannedBy,
    bannedAt: target.bannedAt,
    createdAt: target.createdAt,
    updatedAt: target.updatedAt
  };

  return res.json(updatedUser);
}

module.exports = {
  getUsers,
  updateUserRole,
  toggleUserBan
};

