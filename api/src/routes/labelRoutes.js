const express = require('express');
const router = express.Router();
const labelController = require('../controllers/LabelController');
const authenticateUser = require('../middleware/authMiddleware');

// User connection is required for labels routes
router.use(authenticateUser);

// GET /api/labels - Retrieve all labels
router.get('/', labelController.getAllLabels.bind(labelController));

// POST /api/labels - Create a new label
router.post('/', labelController.createLabel.bind(labelController));

// GET /api/labels/:id - get label by id
router.get('/:id', labelController.getLabelById.bind(labelController));

// PATCH /api/labels/:id - update label by id
router.patch('/:id', labelController.updateLabel.bind(labelController));

// DELTETE /api/labels/:id - delete label by id
router.delete('/:id', labelController.deleteLabel.bind(labelController));

module.exports = router;
