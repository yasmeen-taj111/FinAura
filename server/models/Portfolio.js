const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
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
});

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 100000, // ₹100,000 virtual INR seed balance
      min: [0, 'Balance cannot be negative'],
    },
    holdings: [holdingSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
