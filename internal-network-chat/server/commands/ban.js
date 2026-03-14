const { User } = require('../models/User');

module.exports = async function banCommand({ io, socket, args }) {
  const [username] = args;
  if (!username) return;
  const target = await User.findOne({ username });
  if (!target) return;

  target.banned = true;
  await target.save();

  // Disconnect all sockets of this user
  [...io.sockets.sockets.values()].forEach((s) => {
    if (s.user && String(s.user.id) === String(target._id)) {
      s.emit('systemMessage', {
        content: 'You have been banned by an administrator.'
      });
      s.disconnect(true);
    }
  });

  io.emit('systemMessage', {
    content: `${username} was banned by ${socket.user.username}`
  });
};

