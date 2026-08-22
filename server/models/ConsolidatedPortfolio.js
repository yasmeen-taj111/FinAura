const mongoose = require('mongoose');

const consolidatedPortfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      required: true,
      trim: true,
      // e.g. 'Zerodha', 'Groww', 'INDmoney', 'Manual'
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    assetType: {
      type: String,
      required: true,
      enum: ['STOCK', 'MUTUAL_FUND', 'GOLD', 'FD', 'BOND'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    averageBuyPrice: {
      type: Number,
      required: true,
      min: [0, 'Average buy price cannot be negative'],
    },
    currentPrice: {
      type: Number,
      required: true,
      min: [0, 'Current price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConsolidatedPortfolio', consolidatedPortfolioSchema);
