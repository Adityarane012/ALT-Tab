const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER
  },
  joinedRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  banned: {
    type: Boolean,
    default: false
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bannedByRole: {
    type: String,
    enum: Object.values(ROLES)
  },
  bannedAt: {
    type: Date
  },
  muted: {
    type: Boolean,
    default: false
  },
  mutedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  mutedByRole: {
    type: String,
    enum: Object.values(ROLES)
  },
  mutedAt: {
    type: Date
  },
  warnings: [{
    message: String,
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    issuedByRole: {
      type: String,
      enum: Object.values(ROLES)
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  kickedFromRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }]
}, { timestamps: true });

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = {
  User: mongoose.model('User', userSchema),
  ROLES
};

