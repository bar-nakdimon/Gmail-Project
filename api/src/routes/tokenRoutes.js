const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/TokenController');

// Route for user login
router.post('/', tokenController.login.bind(tokenController));

module.exports = router;