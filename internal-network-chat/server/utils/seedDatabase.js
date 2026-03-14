/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { User, ROLES } = require('../models/User');
const Room = require('../models/Room');

async function seed() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('Missing MONGO_URI for seeding');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding');

  try {
    // Create admin user
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = new User({
        username: 'admin',
        password: 'admin123',
        role: ROLES.ADMIN
      });
      await admin.save();
      console.log('Created admin user: admin / admin123');
    } else {
      console.log('Admin user already exists');
    }

    const roomNames = [
      'general',
      'announcements',
      'computer-engineering',
      'ai-ds',
      'it-engineering',
      'extc-engineering',
      'mechanical-engineering',
      'civil-engineering'
    ];

    for (const name of roomNames) {
      const existing = await Room.findOne({ name });
      if (!existing) {
        await Room.create({
          name,
          createdBy: admin._id,
          members: [admin._id]
        });
        console.log(`Created room: #${name}`);
      } else {
        console.log(`Room already exists: #${name}`);
      }
    }
  } catch (err) {
    console.error('Seeding failed', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();

