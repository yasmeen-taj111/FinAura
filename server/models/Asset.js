const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['STOCK', 'MUTUAL_FUND', 'GOLD', 'FD', 'BOND', 'CASH'],
    },
    currentPrice: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    previousPrice: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['Low', 'Moderate', 'High', 'Very High'],
    },
    description: {
      type: String,
      required: true,
    },
    volatility: {
      type: Number, // Percentage value (0 to 100) representing movement speed
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Asset', assetSchema);
