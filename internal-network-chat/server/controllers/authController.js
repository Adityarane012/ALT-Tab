const { User, ROLES } = require('../models/User');
const { signToken } = require('../utils/jwt');

async function register(req, res) {
  try {
    const { username, password, role } = req.body;
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    const user = new User({
      username,
      password,
      role: role && Object.values(ROLES).includes(role) ? role : ROLES.USER
    });
    await user.save();
    const token = signToken({ id: user._id, username: user.username, role: user.role });
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        banned: user.banned
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (user.banned) {
      return res.status(403).json({ message: 'User is banned' });
    }
    const token = signToken({ id: user._id, username: user.username, role: user.role });
    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        banned: user.banned
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
}

module.exports = {
  register,
  login
};

