const express = require('express');
const { getRooms, createRoom, deleteRoom, requestJoin, approveJoin } = require('../controllers/roomController');
const { authMiddleware, requireRole, ROLES } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRooms);
router.post('/', requireRole([ROLES.ADMIN, ROLES.MODERATOR]), createRoom);
router.delete('/:roomId', requireRole(ROLES.ADMIN), deleteRoom);

// Join requests
router.post('/:roomId/request', requestJoin);
router.post('/:roomId/approve', requireRole([ROLES.ADMIN, ROLES.MODERATOR]), approveJoin);

module.exports = router;

