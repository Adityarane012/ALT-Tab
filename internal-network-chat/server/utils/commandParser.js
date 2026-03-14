const { ROLES } = require('../middleware/authMiddleware');
const kick = require('../commands/kick');
const ban = require('../commands/ban');
const clear = require('../commands/clear');
const createRoom = require('../commands/createRoom');

const COMMANDS = {
  kick: {
    fn: kick,
    roles: [ROLES.ADMIN, ROLES.MODERATOR]
  },
  ban: {
    fn: ban,
    roles: [ROLES.ADMIN]
  },
  clear: {
    fn: clear,
    roles: [ROLES.ADMIN, ROLES.MODERATOR]
  },
  'create-room': {
    fn: createRoom,
    roles: [ROLES.ADMIN, ROLES.MODERATOR]
  }
};

async function handleCommand({ io, socket, roomId, content }) {
  if (!content.startsWith('/')) return false;
  const withoutSlash = content.slice(1).trim();
  const [commandNameRaw, ...args] = withoutSlash.split(/\s+/);
  const commandName = commandNameRaw.toLowerCase();

  const command = COMMANDS[commandName];
  if (!command) {
    socket.emit('systemMessage', { roomId, content: `Unknown command: /${commandName}` });
    return true;
  }

  if (!command.roles.includes(socket.user.role)) {
    socket.emit('systemMessage', { roomId, content: 'You do not have permission to use this command.' });
    return true;
  }

  await command.fn({ io, socket, roomId, args });

  // Save the command to the database so it shows up in Activity Monitor
  const Message = require('../models/Message');
  await Message.create({
    roomId,
    senderId: socket.user.id,
    content: `/${commandName} ${args.join(' ')}`.trim()
  });

  return true;
}

module.exports = {
  handleCommand
};

