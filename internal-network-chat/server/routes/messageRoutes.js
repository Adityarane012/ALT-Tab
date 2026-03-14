const express = require('express');
const { getRoomMessages, getRecentMessages } = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/:roomId', getRoomMessages);
router.get('/', getRecentMessages);

module.exports = router;

