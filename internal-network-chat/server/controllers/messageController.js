const Message = require('../models/Message');

async function getRoomMessages(req, res) {
  const { roomId } = req.params;
  let messages = await Message.find({ roomId })
    .populate('senderId', 'username role')
    .sort({ timestamp: 1 });

  // If the requester has been kicked from this room, hide their own historical messages
  if (req.user.kickedFromRooms && req.user.kickedFromRooms.map(id => String(id)).includes(String(roomId))) {
    messages = messages.filter(m => String(m.senderId._id) !== String(req.user._id));
  }

  return res.json(messages);
}

async function getRecentMessages(req, res) {
  const limit = Number(req.query.limit) || 50;
  const messages = await Message.find({})
    .populate('senderId', 'username role')
    .sort({ timestamp: -1 })
    .limit(limit);
  return res.json(messages);
}

module.exports = {
  getRoomMessages,
  getRecentMessages
};

