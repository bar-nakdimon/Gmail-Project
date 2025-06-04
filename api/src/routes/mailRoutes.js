const express = require('express');
const router = express.Router();
const mailController = require('../controllers/MailController');
const authenticateUser = require('../middleware/authMiddleware');

// User connection is required for mails routes
router.use(authenticateUser);

// GET /api/mails- get inbox
router.get('/', mailController.getInbox.bind(mailController));

// GET /api/mails/search/:query - Search Mails by Query 
router.get('/search/:query', mailController.searchMails.bind(mailController));

// POST /api/mails - creates a new mail, with blacklist URL check
router.post('/', mailController.createMail.bind(mailController));

// GET /api/mails/:id - fetches a single mail by its ID
router.get('/:id', mailController.getMailById.bind(mailController));

// PATCH /api/mails/:id - updates the subject/body of a mail with the given ID
router.patch('/:id', mailController.updateMail.bind(mailController));

// DELETE /api/mails/:id - deletes the mail with the given ID
router.delete('/:id', mailController.deleteMail.bind(mailController));


module.exports = router;
