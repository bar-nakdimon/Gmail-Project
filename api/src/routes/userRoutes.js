const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// POST /api/users- register new user
router.post('/', userController.register.bind(userController));

// Route for getting user by ID
router.get('/:id', userController.getUserById.bind(userController));

module.exports = router;