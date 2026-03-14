const express = require('express');
const { authMiddleware, requireRole, ROLES } = require('../middleware/authMiddleware');
const { getUsers, updateUserRole, toggleUserBan } = require('../controllers/userController');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(ROLES.ADMIN));

router.get('/', getUsers);
router.patch('/:userId/role', updateUserRole);
router.patch('/:userId/ban', toggleUserBan);

module.exports = router;

