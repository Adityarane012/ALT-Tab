const Message = require('../models/Message');

async function getRoomMessages(req, res) {
  const { roomId } = req.params;
  const messages = await Message.find({ roomId })
    .populate('senderId', 'username role')
    .sort({ timestamp: 1 });
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

