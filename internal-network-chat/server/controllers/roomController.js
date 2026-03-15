const Room = require('../models/Room');

async function getRooms(req, res) {
  const rooms = await Room.find({})
    .populate('pendingRequests', 'username')
    .sort({ createdAt: 1 });
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

module.exports = {
  getRooms,
  createRoom,
  deleteRoom
};

