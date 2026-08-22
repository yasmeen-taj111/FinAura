const express = require('express');
const router = express.Router();
const {
  getMentors,
  bookMentorSession,
} = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMentors);
router.post('/:id/book', protect, bookMentorSession);

module.exports = router;
