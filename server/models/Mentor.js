const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: true,
    },
    expertise: {
      type: [String],
      required: true,
    },
    experience: {
      type: Number, // Years of experience
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    hourlyFee: {
      type: Number, // Mock fee for booked sessions
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    credentials: [
      {
        credentialType: {
          type: String,
          required: true,
        },
        documentUrl: {
          type: String,
          default: '',
        },
        verificationStatus: {
          type: String,
          enum: ['PENDING', 'VERIFIED', 'REJECTED'],
          default: 'PENDING',
        },
        verifiedAt: {
          type: Date,
        }
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Mentor', mentorSchema);
