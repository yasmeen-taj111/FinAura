const express = require('express');
const router = express.Router();
const {
  getProfile,
  getQuestions,
  submitAssessment
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProfile);
router.get('/questions', protect, getQuestions);
router.post('/assessment', protect, submitAssessment);

module.exports = router;
