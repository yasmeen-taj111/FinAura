const express = require('express');
const router = express.Router();
const {
  getPortfolio,
  getAssets,
  executeTrade,
  getTransactions,
  simulateMarket,
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPortfolio);
router.get('/assets', protect, getAssets);
router.post('/trade', protect, executeTrade);
router.get('/transactions', protect, getTransactions);
router.post('/simulate-market', protect, simulateMarket);

module.exports = router;
