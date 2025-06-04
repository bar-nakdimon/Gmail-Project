const express = require('express');
const router = express.Router();
const blacklistController = require('../controllers/BlacklistController');
const authenticateUser = require('../middleware/authMiddleware');

// Add a domain to the TCP-based blacklist
router.post('/', authenticateUser, blacklistController.addToBlacklist);

// Remove a domain from the TCP-based blacklist
router.delete('/:id', authenticateUser, blacklistController.removeFromBlacklist);

module.exports = router;
