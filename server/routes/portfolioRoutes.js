const express = require('express');
const router = express.Router();
const {
  getPortfolio,
  getAssets,
  executeTrade,
  getTransactions,
  simulateMarket,
  getConsolidatedPortfolio,
  addConsolidatedHolding,
  bulkConsolidateHoldings,
  deleteConsolidatedHolding,
  clearConsolidatedHoldings,
  getSips,
  createSip,
  cancelSip,
  processMonthlySips
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

// Existing virtual portfolio routes
router.get('/', protect, getPortfolio);
router.get('/assets', protect, getAssets);
router.post('/trade', protect, executeTrade);
router.get('/transactions', protect, getTransactions);
router.post('/simulate-market', protect, simulateMarket);

// New virtual SIP routes
router.get('/sips', protect, getSips);
router.post('/sips', protect, createSip);
router.post('/sips/process-month', protect, processMonthlySips);
router.delete('/sips/:id', protect, cancelSip);

// New consolidated portfolio routes
router.get('/consolidated', protect, getConsolidatedPortfolio);
router.post('/consolidated', protect, addConsolidatedHolding);
router.post('/consolidated/bulk', protect, bulkConsolidateHoldings);
router.delete('/consolidated/clear', protect, clearConsolidatedHoldings);
router.delete('/consolidated/:id', protect, deleteConsolidatedHolding);

module.exports = router;
