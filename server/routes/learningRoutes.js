const express = require('express');
const router = express.Router();
const {
  getCourses,
  getLesson,
  submitQuiz,
  getProgress,
  getBadges,
} = require('../controllers/learningController');
const { protect } = require('../middleware/authMiddleware');

router.get('/courses', protect, getCourses);
router.get('/lessons/:id', protect, getLesson);
router.post('/lessons/:id/quiz', protect, submitQuiz);
router.get('/progress', protect, getProgress);
router.get('/badges', protect, getBadges);

module.exports = router;
