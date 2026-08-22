const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String, // MarkDown or Text rich HTML content
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    xpReward: {
      type: Number,
      default: 50,
    },
    videoUrl: {
      type: String,
      default: '',
    },
    videoTitle: {
      type: String,
      default: '',
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lesson', lessonSchema);
