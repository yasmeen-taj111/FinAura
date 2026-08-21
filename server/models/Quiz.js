const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          validate: [arr => arr.length >= 2, 'Quiz options must have at least 2 choices'],
          required: true,
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          required: true,
        },
      }
    ],
    passingScore: {
      type: Number,
      default: 70, // Percentage based passing criteria (e.g. 70%)
    },
    xpReward: {
      type: Number,
      default: 150,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
