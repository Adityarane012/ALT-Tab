const Room = require('../models/Room');

async function getRooms(req, res) {
  const rooms = await Room.find({}).sort({ createdAt: 1 });
  return res.json(rooms);
}

async function createRoom(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Room name required' });
  }
  const existing = await Room.findOne({ name });
  if (existing) {
    return res.status(400).json({ message: 'Room already exists' });
  }
  const room = await Room.create({
    name,
    createdBy: req.user._id,
    members: [req.user._id],
    isPrivate: true
  });
  return res.status(201).json(room);
}

async function deleteRoom(req, res) {
  const { roomId } = req.params;
  await Room.findByIdAndDelete(roomId);
  return res.json({ message: 'Room deleted' });
}

async function requestJoin(req, res) {
  const { roomId } = req.params;
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  
  if (room.members.includes(req.user._id)) {
    return res.status(400).json({ message: 'You are already a member' });
  }

  // Add to pending members if not already there
  if (!room.pendingMembers.includes(req.user._id)) {
    room.pendingMembers.push(req.user._id);
    await room.save();
  }
  
  return res.json({ message: 'Join request sent', room });
}

async function approveJoin(req, res) {
  const { roomId } = req.params;
  const { targetUserId } = req.body; // Explicit target user payload for mods approving specific requests
  
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });

  if (room.pendingMembers.includes(targetUserId)) {
    // Migrate from pending to approved
    room.pendingMembers.pull(targetUserId);
    room.members.push(targetUserId);
    await room.save();

    // Trigger an immediate live-reload request socket event directly to that user if they are online to unlock their UI
    req.io.sockets.sockets.forEach((s) => {
      if (s.user && String(s.user.id) === String(targetUserId)) {
         s.emit('systemMessage', { roomId, content: 'Your join request was approved!' });
         s.emit('joinApproved', { roomId }); // Explicit trigger loop to force UI state reset
      }
    });

    return res.json({ message: 'User approved', room });
  }
  
  return res.status(400).json({ message: 'User is not in the pending list' });
}

module.exports = {
  getRooms,
  createRoom,
  deleteRoom,
  requestJoin,
  approveJoin
};

