const Asset = require('../models/Asset');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const UserProgress = require('../models/UserProgress');
const Badge = require('../models/Badge');
const ConsolidatedPortfolio = require('../models/ConsolidatedPortfolio');
const Sip = require('../models/Sip');

// A new local database should still provide a usable sandbox without running the
// full seed script (which clears user data). These are simulated learning assets.
const DEFAULT_SANDBOX_ASSETS = [
  { name: 'Tata Consultancy Services', symbol: 'TCS', type: 'STOCK', currentPrice: 3800, previousPrice: 3820, riskLevel: 'Moderate', description: 'Simulated large-cap IT equity.', volatility: 8 },
  { name: 'Reliance Industries', symbol: 'RELIANCE', type: 'STOCK', currentPrice: 2900, previousPrice: 2850, riskLevel: 'Moderate', description: 'Simulated diversified large-cap equity.', volatility: 10 },
  { name: 'Nifty 50 Index Fund', symbol: 'NIFTY50', type: 'MUTUAL_FUND', currentPrice: 220, previousPrice: 221, riskLevel: 'Moderate', description: 'Simulated broad-market index fund.', volatility: 7 },
  { name: 'Small Cap Growth Fund', symbol: 'SMALLCAP', type: 'MUTUAL_FUND', currentPrice: 85, previousPrice: 88, riskLevel: 'Very High', description: 'Simulated high-volatility small-cap fund.', volatility: 18 },
  { name: 'Sovereign Gold Bond', symbol: 'GOLD', type: 'GOLD', currentPrice: 6500, previousPrice: 6470, riskLevel: 'Low', description: 'Simulated gold-linked government security.', volatility: 5 },
  { name: 'SBI Fixed Deposit (1 Year)', symbol: 'SBIFD', type: 'FD', currentPrice: 10000, previousPrice: 10000, riskLevel: 'Low', description: 'Simulated fixed-deposit product.', volatility: 0 },
  { name: 'Government Securities (10 Year)', symbol: 'GSEC10Y', type: 'BOND', currentPrice: 98, previousPrice: 97.8, riskLevel: 'Low', description: 'Simulated sovereign bond.', volatility: 3 },
  { name: 'Zomato Limited', symbol: 'ZOMATO', type: 'STOCK', currentPrice: 160, previousPrice: 152, riskLevel: 'High', description: 'Simulated high-growth equity.', volatility: 25 },
  { name: 'HDFC Liquid Fund', symbol: 'LIQUID', type: 'MUTUAL_FUND', currentPrice: 50, previousPrice: 50, riskLevel: 'Low', description: 'Simulated liquid mutual fund.', volatility: 1 },
  { name: 'Cash Account', symbol: 'CASH', type: 'CASH', currentPrice: 1, previousPrice: 1, riskLevel: 'Low', description: 'Simulated cash balance.', volatility: 0 },
];

const ensureSandboxAssets = async () => {
  const count = await Asset.countDocuments();
  if (count > 0) return;
  await Asset.bulkWrite(DEFAULT_SANDBOX_ASSETS.map((asset) => ({
    updateOne: { filter: { symbol: asset.symbol }, update: { $setOnInsert: asset }, upsert: true },
  })));
};

// Helper to check and award badge
const awardBadgeDirect = async (userId, badgeCode) => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) return null;

  const badge = await Badge.findOne({ code: badgeCode });
  if (!badge) return null;

  // Check if already earned
  const alreadyEarned = progress.earnedBadges.some(
    (b) => b.badgeId.toString() === badge._id.toString()
  );

  if (!alreadyEarned) {
    progress.earnedBadges.push({ badgeId: badge._id, earnedAt: new Date() });
    progress.xp += badge.xpReward;
    await progress.save();
    return badge;
  }
  return null;
};

/**
 * @desc    Get user virtual portfolio details with current valuations
 * @route   GET /api/portfolio
 * @access  Private
 */
const getPortfolio = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId, balance: 100000, holdings: [] });
    }

    const enrichedHoldings = [];
    let totalHoldingsValue = 0;
    let totalCostValue = 0;

    for (const holding of portfolio.holdings) {
      const asset = await Asset.findById(holding.assetId).lean();
      if (asset) {
        const currentValue = holding.quantity * asset.currentPrice;
        const totalCost = holding.quantity * holding.averageBuyPrice;
        const gainLoss = currentValue - totalCost;
        const roi = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        totalHoldingsValue += currentValue;
        totalCostValue += totalCost;

        enrichedHoldings.push({
          _id: holding._id,
          assetId: holding.assetId,
          quantity: holding.quantity,
          averageBuyPrice: holding.averageBuyPrice,
          currentValue,
          totalCost,
          gainLoss,
          roi,
          asset,
        });
      }
    }

    const totalPortfolioValue = portfolio.balance + totalHoldingsValue;
    const overallGainLoss = totalHoldingsValue - totalCostValue;
    const overallGainLossPercent = totalCostValue > 0 ? (overallGainLoss / totalCostValue) * 100 : 0;

    res.status(200).json({
      balance: portfolio.balance,
      holdings: enrichedHoldings,
      totalHoldingsValue,
      totalPortfolioValue,
      overallGainLoss,
      overallGainLossPercent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of virtual assets
 * @route   GET /api/portfolio/assets
 * @access  Private
 */
const getAssets = async (req, res, next) => {
  try {
    await ensureSandboxAssets();
    const assets = await Asset.find().sort({ type: 1, name: 1 });
    res.status(200).json(assets);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Execute BUY or SELL virtual trade
 * @route   POST /api/portfolio/trade
 * @access  Private
 */
const executeTrade = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { assetId, type, quantity } = req.body;

    if (!assetId || !type || !quantity || quantity <= 0) {
      res.status(400);
      throw new Error('Please provide assetId, trade type (BUY/SELL), and a positive quantity');
    }

    if (type !== 'BUY' && type !== 'SELL') {
      res.status(400);
      throw new Error('Invalid trade type, must be BUY or SELL');
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      res.status(404);
      throw new Error('Asset not found');
    }

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId, balance: 100000, holdings: [] });
    }

    const tradePrice = asset.currentPrice;
    let badgeUnlocked = null;

    if (type === 'BUY') {
      const totalCost = tradePrice * quantity;
      if (portfolio.balance < totalCost) {
        res.status(400);
        throw new Error(`Insufficient virtual funds. Required: ₹${totalCost.toLocaleString()}, Available: ₹${portfolio.balance.toLocaleString()}`);
      }

      // Deduct balance
      portfolio.balance -= totalCost;

      // Update holdings
      const holdingIndex = portfolio.holdings.findIndex(
        (h) => h.assetId.toString() === assetId.toString()
      );

      if (holdingIndex >= 0) {
        const holding = portfolio.holdings[holdingIndex];
        const newQty = holding.quantity + quantity;
        const newAvg = ((holding.quantity * holding.averageBuyPrice) + totalCost) / newQty;
        
        holding.quantity = newQty;
        holding.averageBuyPrice = newAvg;
      } else {
        portfolio.holdings.push({
          assetId,
          quantity,
          averageBuyPrice: tradePrice,
        });
      }
    } else {
      // SELL trade
      const holdingIndex = portfolio.holdings.findIndex(
        (h) => h.assetId.toString() === assetId.toString()
      );

      if (holdingIndex < 0 || portfolio.holdings[holdingIndex].quantity < quantity) {
        res.status(400);
        throw new Error('Insufficient holdings to execute this sell order');
      }

      const holding = portfolio.holdings[holdingIndex];
      const proceeds = tradePrice * quantity;

      // Add to balance
      portfolio.balance += proceeds;
      holding.quantity -= quantity;

      // Remove holding if empty
      if (holding.quantity <= 0.0001) {
        portfolio.holdings.splice(holdingIndex, 1);
      }
    }

    await portfolio.save();

    // Create transaction log
    const transaction = await Transaction.create({
      userId,
      assetId,
      type,
      quantity,
      price: tradePrice,
      timestamp: new Date(),
    });

    // 1. Check for DIVERSIFIED badge (Hold at least 3 distinct asset types)
    if (portfolio.holdings.length >= 3) {
      const uniqueTypes = new Set();
      for (const h of portfolio.holdings) {
        const heldAsset = await Asset.findById(h.assetId);
        if (heldAsset) {
          uniqueTypes.add(heldAsset.type);
        }
      }
      if (uniqueTypes.size >= 3) {
        const badge = await awardBadgeDirect(userId, 'DIVERSIFIED');
        if (badge) badgeUnlocked = badge;
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully executed ${type} order for ${quantity} unit(s) of ${asset.symbol}`,
      transaction,
      badgeUnlocked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction history
 * @route   GET /api/portfolio/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .populate('assetId')
      .lean();
    
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate artificial market price adjustments
 * @route   POST /api/portfolio/simulate-market
 * @access  Private
 */
const simulateMarket = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { eventType } = req.body; // 'NEUTRAL', 'BULL_RUN', 'BEAR_MARKET', 'FLASH_CRASH'

    if (!eventType) {
      res.status(400);
      throw new Error('Please specify a market event type');
    }

    const assets = await Asset.find();
    let badgeUnlocked = null;

    for (const asset of assets) {
      if (asset.symbol === 'CASH') continue; // Cash doesn't change value

      const v = (asset.volatility || 10) / 100; // Volatility factor
      let changePercent = 0;

      // Calculate shift based on event
      switch (eventType) {
        case 'BULL_RUN':
          // Mostly positive: +1% to +v%
          changePercent = (Math.random() * (v - 0.01) + 0.01);
          break;
        case 'BEAR_MARKET':
          // Mostly negative: -1% to -v%
          changePercent = -(Math.random() * (v - 0.01) + 0.01);
          break;
        case 'FLASH_CRASH':
          // Heavy drop: -15% to -35%
          changePercent = -(Math.random() * 0.20 + 0.15);
          break;
        case 'NEUTRAL':
        default:
          // Random up or down: -v/2 to +v/2
          changePercent = (Math.random() * v - (v / 2));
          break;
      }

      // Fixed Deposits have flat yields, bonds are very stable
      if (asset.type === 'FD') {
        changePercent = eventType === 'NEUTRAL' ? 0.005 : 0.002; // Slow linear coupon growth
      } else if (asset.type === 'BOND') {
        changePercent = changePercent * 0.1; // 10% volatility relative to other stocks
      }

      const previousPrice = asset.currentPrice;
      const rawPrice = previousPrice * (1 + changePercent);
      // Ensure prices don't drop to 0
      const currentPrice = Math.round(Math.max(0.5, rawPrice) * 100) / 100;

      asset.previousPrice = previousPrice;
      asset.currentPrice = currentPrice;
      await asset.save();
    }

    // Award MARKET_SURVIVOR badge if they survived a BEAR_MARKET or FLASH_CRASH with active asset holdings
    if (eventType === 'BEAR_MARKET' || eventType === 'FLASH_CRASH') {
      const portfolio = await Portfolio.findOne({ userId });
      if (portfolio && portfolio.holdings.length > 0) {
        const badge = await awardBadgeDirect(userId, 'MARKET_SURVIVOR');
        if (badge) badgeUnlocked = badge;
      }
    }

    res.status(200).json({
      success: true,
      message: `Market updated with ${eventType} event successfully.`,
      badgeUnlocked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user consolidated external investments
 * @route   GET /api/portfolio/consolidated
 * @access  Private
 */
const getConsolidatedPortfolio = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const holdings = await ConsolidatedPortfolio.find({ userId }).lean();

    let totalCurrentValue = 0;
    let totalInvestedValue = 0;
    
    const platformBreakdown = {};
    const assetTypeBreakdown = {};

    const enrichedHoldings = holdings.map(h => {
      const currentValue = h.quantity * h.currentPrice;
      const investedValue = h.quantity * h.averageBuyPrice;
      const gainLoss = currentValue - investedValue;
      const roi = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;

      totalCurrentValue += currentValue;
      totalInvestedValue += investedValue;

      // Platform distribution
      platformBreakdown[h.platform] = (platformBreakdown[h.platform] || 0) + currentValue;

      // Asset Type distribution
      assetTypeBreakdown[h.assetType] = (assetTypeBreakdown[h.assetType] || 0) + currentValue;

      return {
        ...h,
        currentValue,
        investedValue,
        gainLoss,
        roi
      };
    });

    const overallGainLoss = totalCurrentValue - totalInvestedValue;
    const overallGainLossPercent = totalInvestedValue > 0 ? (overallGainLoss / totalInvestedValue) * 100 : 0;

    res.status(200).json({
      holdings: enrichedHoldings,
      totalCurrentValue,
      totalInvestedValue,
      overallGainLoss,
      overallGainLossPercent,
      platformBreakdown,
      assetTypeBreakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add consolidated external holding manually
 * @route   POST /api/portfolio/consolidated
 * @access  Private
 */
const addConsolidatedHolding = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { platform, symbol, name, assetType, quantity, averageBuyPrice, currentPrice } = req.body;

    if (!platform || !symbol || !name || !assetType || quantity === undefined || averageBuyPrice === undefined) {
      res.status(400);
      throw new Error('Please provide platform, symbol, name, assetType, quantity, and averageBuyPrice');
    }

    const holding = await ConsolidatedPortfolio.findOneAndUpdate(
      { userId, platform: platform.trim(), symbol: symbol.toUpperCase().trim() },
      {
        userId,
        platform: platform.trim(),
        symbol: symbol.toUpperCase().trim(),
        name: name.trim(),
        assetType,
        quantity: Number(quantity),
        averageBuyPrice: Number(averageBuyPrice),
        currentPrice: Number(currentPrice || averageBuyPrice),
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      holding
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk consolidate uploader statement (Zerodha/Groww CSV)
 * @route   POST /api/portfolio/consolidated/bulk
 * @access  Private
 */
const bulkConsolidateHoldings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { holdings } = req.body;

    if (!holdings || !Array.isArray(holdings)) {
      res.status(400);
      throw new Error('Please provide an array of holdings');
    }

    // Clear existing data for platforms in upload to simulate overwriting previous broker CSV
    const platformsToClear = [...new Set(holdings.map(h => h.platform))];
    if (platformsToClear.length > 0) {
      await ConsolidatedPortfolio.deleteMany({ userId, platform: { $in: platformsToClear } });
    }

    const insertedHoldings = [];
    for (const h of holdings) {
      const created = await ConsolidatedPortfolio.create({
        userId,
        platform: h.platform.trim(),
        symbol: h.symbol.toUpperCase().trim(),
        name: h.name.trim(),
        assetType: h.assetType,
        quantity: Number(h.quantity),
        averageBuyPrice: Number(h.averageBuyPrice),
        currentPrice: Number(h.currentPrice || h.averageBuyPrice),
      });
      insertedHoldings.push(created);
    }

    res.status(200).json({
      success: true,
      count: insertedHoldings.length,
      holdings: insertedHoldings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete single consolidated holding
 * @route   DELETE /api/portfolio/consolidated/:id
 * @access  Private
 */
const deleteConsolidatedHolding = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const holding = await ConsolidatedPortfolio.findOneAndDelete({ _id: id, userId });
    if (!holding) {
      res.status(404);
      throw new Error('Holding not found or unauthorized');
    }

    res.status(200).json({
      success: true,
      message: 'Consolidated holding successfully removed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all consolidated holdings
 * @route   DELETE /api/portfolio/consolidated
 * @access  Private
 */
const clearConsolidatedHoldings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await ConsolidatedPortfolio.deleteMany({ userId });
    res.status(200).json({
      success: true,
      message: 'All consolidated holdings successfully cleared'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user active virtual SIPs
 * @route   GET /api/portfolio/sips
 * @access  Private
 */
const getSips = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sips = await Sip.find({ userId, isActive: true }).populate('assetId').lean();
    res.status(200).json(sips);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create/start a virtual SIP
 * @route   POST /api/portfolio/sips
 * @access  Private
 */
const createSip = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { assetId, amount, frequency } = req.body;

    if (!assetId || !amount || amount < 500) {
      res.status(400);
      throw new Error('Please provide a valid asset and a SIP amount of at least ₹500');
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      res.status(404);
      throw new Error('Asset not found');
    }

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId, balance: 100000, holdings: [] });
    }

    // Execute first installment immediately
    if (portfolio.balance < amount) {
      res.status(400);
      throw new Error(`Insufficient virtual funds for the first SIP installment. Required: ₹${amount}, Available: ₹${portfolio.balance}`);
    }

    const unitsPurchased = amount / asset.currentPrice;
    portfolio.balance -= amount;

    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.assetId.toString() === assetId.toString()
    );

    if (holdingIndex >= 0) {
      const holding = portfolio.holdings[holdingIndex];
      const newQty = holding.quantity + unitsPurchased;
      const newAvg = ((holding.quantity * holding.averageBuyPrice) + amount) / newQty;
      holding.quantity = newQty;
      holding.averageBuyPrice = newAvg;
    } else {
      portfolio.holdings.push({
        assetId,
        quantity: unitsPurchased,
        averageBuyPrice: asset.currentPrice,
      });
    }

    await portfolio.save();

    // Create transaction log
    await Transaction.create({
      userId,
      assetId,
      type: 'BUY',
      quantity: unitsPurchased,
      price: asset.currentPrice,
      timestamp: new Date(),
    });

    // Schedule next execution date (1 month or 1 week)
    const nextExecutionDate = new Date();
    if (frequency === 'WEEKLY') {
      nextExecutionDate.setDate(nextExecutionDate.getDate() + 7);
    } else {
      nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 1);
    }

    const newSip = await Sip.create({
      userId,
      assetId,
      amount,
      frequency: frequency || 'MONTHLY',
      nextExecutionDate,
      totalInvested: amount,
      totalUnits: unitsPurchased,
    });

    // Award DIVERSIFIED badge if applicable
    let badgeUnlocked = null;
    if (portfolio.holdings.length >= 3) {
      const uniqueTypes = new Set();
      for (const h of portfolio.holdings) {
        const heldAsset = await Asset.findById(h.assetId);
        if (heldAsset) uniqueTypes.add(heldAsset.type);
      }
      if (uniqueTypes.size >= 3) {
        const badge = await awardBadgeDirect(userId, 'DIVERSIFIED');
        if (badge) badgeUnlocked = badge;
      }
    }

    res.status(201).json({
      success: true,
      message: `SIP initiated! First installment of ₹${amount} executed successfully.`,
      sip: newSip,
      badgeUnlocked
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an active virtual SIP
 * @route   DELETE /api/portfolio/sips/:id
 * @access  Private
 */
const cancelSip = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const sip = await Sip.findOneAndDelete({ _id: id, userId });
    if (!sip) {
      res.status(404);
      throw new Error('SIP subscription not found or unauthorized');
    }

    res.status(200).json({
      success: true,
      message: `SIP subscription has been cancelled successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate 1 Month Time Travel (advances time, fluctuates prices, executes active SIPs)
 * @route   POST /api/portfolio/sips/process-month
 * @access  Private
 */
const processMonthlySips = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // 1. Fetch user's active SIPs and virtual portfolio
    const sips = await Sip.find({ userId, isActive: true }).populate('assetId');
    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId, balance: 100000, holdings: [] });
    }

    // 2. Perform price fluctuation (simulate 1 month market changes)
    const assets = await Asset.find();
    for (const asset of assets) {
      if (asset.symbol === 'CASH') continue;
      const v = (asset.volatility || 10) / 100;
      // We simulate a neutral random swing between -v/2 and +v/2
      const changePercent = (Math.random() * v - (v / 2));
      const previousPrice = asset.currentPrice;
      const rawPrice = previousPrice * (1 + changePercent);
      const currentPrice = Math.round(Math.max(0.5, rawPrice) * 100) / 100;
      asset.previousPrice = previousPrice;
      asset.currentPrice = currentPrice;
      await asset.save();
    }

    // Refresh active assets map for price reference
    const updatedAssets = await Asset.find().lean();
    const assetPriceMap = {};
    updatedAssets.forEach(a => {
      assetPriceMap[a._id.toString()] = a;
    });

    const executionResults = [];

    // 3. Process each SIP execution
    for (const sip of sips) {
      const asset = assetPriceMap[sip.assetId._id.toString()];
      if (!asset) continue;

      if (portfolio.balance < sip.amount) {
        // Insufficient funds: record failure log
        executionResults.push({
          sipId: sip._id,
          assetSymbol: asset.symbol,
          amount: sip.amount,
          status: 'FAILED',
          reason: 'Insufficient virtual cash balance'
        });
        continue;
      }

      // Execute BUY
      const unitsPurchased = sip.amount / asset.currentPrice;
      portfolio.balance -= sip.amount;

      const holdingIndex = portfolio.holdings.findIndex(
        (h) => h.assetId.toString() === asset._id.toString()
      );

      if (holdingIndex >= 0) {
        const holding = portfolio.holdings[holdingIndex];
        const newQty = holding.quantity + unitsPurchased;
        const newAvg = ((holding.quantity * holding.averageBuyPrice) + sip.amount) / newQty;
        holding.quantity = newQty;
        holding.averageBuyPrice = newAvg;
      } else {
        portfolio.holdings.push({
          assetId: asset._id,
          quantity: unitsPurchased,
          averageBuyPrice: asset.currentPrice,
        });
      }

      // Create transaction log
      await Transaction.create({
        userId,
        assetId: asset._id,
        type: 'BUY',
        quantity: unitsPurchased,
        price: asset.currentPrice,
        timestamp: new Date(),
      });

      // Update SIP record
      sip.totalInvested += sip.amount;
      sip.totalUnits += unitsPurchased;
      
      // Update next execution date
      const nextDate = new Date(sip.nextExecutionDate);
      if (sip.frequency === 'WEEKLY') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      sip.nextExecutionDate = nextDate;
      await sip.save();

      executionResults.push({
        sipId: sip._id,
        assetSymbol: asset.symbol,
        amount: sip.amount,
        unitsPurchased,
        executionPrice: asset.currentPrice,
        status: 'SUCCESS'
      });
    }

    await portfolio.save();

    res.status(200).json({
      success: true,
      message: 'Time advanced 1 Month! Market prices fluctuated and active virtual SIPs processed.',
      executions: executionResults,
      portfolio
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
