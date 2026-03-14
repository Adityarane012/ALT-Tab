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

  return res.json(user);
}

async function toggleUserBan(req, res) {
  const { userId } = req.params;
  const { banned } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { banned: Boolean(banned) },
    { new: true, fields: 'username role banned createdAt updatedAt' }
  );

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(user);
}

module.exports = {
  getUsers,
  updateUserRole,
  toggleUserBan
};

