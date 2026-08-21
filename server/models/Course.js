const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Money Basics', 'Saving', 'Budgeting', 'Investing', 'Risk',
        'Compounding', 'Stocks', 'Mutual Funds', 'Gold', 'FD',
        'Inflation', 'Tax Basics', 'Financial Psychology'
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    xpReward: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);
