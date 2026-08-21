const mongoose = require('mongoose');

const financialProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    monthlyIncome: {
      type: Number,
      default: 0,
      min: [0, 'Income cannot be negative'],
    },
    monthlyExpenses: {
      type: Number,
      default: 0,
      min: [0, 'Expenses cannot be negative'],
    },
    monthlySavings: {
      type: Number,
      default: 0,
      min: [0, 'Savings cannot be negative'],
    },
    scores: {
      moneyManagement: { type: Number, default: 0, min: 0, max: 100 },
      investingKnowledge: { type: Number, default: 0, min: 0, max: 100 },
      riskUnderstanding: { type: Number, default: 0, min: 0, max: 100 },
      goalPlanning: { type: Number, default: 0, min: 0, max: 100 },
      financialBehavior: { type: Number, default: 0, min: 0, max: 100 },
      overall: { type: Number, default: 0, min: 0, max: 100 },
    },
    assessmentCompleted: {
      type: Boolean,
      default: false,
    },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedOption: { type: Number, required: true }, // Index of the chosen answer
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FinancialProfile', financialProfileSchema);
