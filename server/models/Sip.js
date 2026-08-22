const mongoose = require('mongoose');

const sipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [500, 'Minimum virtual SIP amount is ₹500'],
    },
    frequency: {
      type: String,
      enum: ['WEEKLY', 'MONTHLY'],
      default: 'MONTHLY',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    nextExecutionDate: {
      type: Date,
      required: true,
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Sip', sipSchema);
