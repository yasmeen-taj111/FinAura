const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: [1, 'Target amount must be positive'],
    },
    timeline: {
      type: Number, // Timeline in months
      required: true,
      min: [1, 'Timeline must be at least 1 month'],
    },
    currentSavings: {
      type: Number,
      default: 0,
      min: [0, 'Savings cannot be negative'],
    },
    category: {
      type: String,
      enum: ['Short-Term', 'Medium-Term', 'Long-Term'],
      default: 'Short-Term',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);
