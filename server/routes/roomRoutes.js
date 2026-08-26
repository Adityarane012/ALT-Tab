const express = require('express');
const { getRooms, createRoom, deleteRoom, requestJoin, approveJoin } = require('../controllers/roomController');
const { authMiddleware, requireRole, ROLES } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRooms);
router.post('/', requireRole([ROLES.ADMIN, ROLES.MODERATOR]), createRoom);
router.delete('/:roomId', requireRole(ROLES.ADMIN), deleteRoom);

// Join requests handled via socket.io

module.exports = router;

