const Room = require('../models/Room');

module.exports = async function createRoomCommand({ io, socket, args }) {
  const [roomName] = args;
  if (!roomName) return;

  const existing = await Room.findOne({ name: roomName });
  if (existing) {
    socket.emit('systemMessage', {
      content: `Room ${roomName} already exists.`
    });
    return;
  }

  const room = await Room.create({
    name: roomName,
    createdBy: socket.user.id,
    members: [socket.user.id]
  });

  io.emit('roomCreated', room);
  socket.emit('systemMessage', {
    content: `Room ${roomName} created.`
  });
};

