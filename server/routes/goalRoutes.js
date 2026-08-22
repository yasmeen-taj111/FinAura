const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  simulateGoalSavings,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getGoals);
router.post('/', protect, createGoal);
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);
router.post('/:id/simulate', protect, simulateGoalSavings);

module.exports = router;
