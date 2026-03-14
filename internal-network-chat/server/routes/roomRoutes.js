const express = require('express');
const { getRooms, createRoom, deleteRoom } = require('../controllers/roomController');
const { authMiddleware, requireRole, ROLES } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRooms);
router.post('/', requireRole([ROLES.ADMIN, ROLES.MODERATOR]), createRoom);
router.delete('/:roomId', requireRole(ROLES.ADMIN), deleteRoom);

module.exports = router;

