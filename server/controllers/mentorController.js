const Mentor = require('../models/Mentor');
const User = require('../models/User');

/**
 * @desc    Get all listed mentors with user account details
 * @route   GET /api/mentors
 * @access  Private
 */
const getMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find()
      .populate({
        path: 'userId',
        select: 'name email avatar role',
      })
      .lean();

    res.status(200).json(mentors);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Book a mock mentorship session
 * @route   POST /api/mentors/:id/book
 * @access  Private
 */
const bookMentorSession = async (req, res, next) => {
  try {
    const mentorId = req.params.id;
    const { date, timeSlot } = req.body;

    if (!date || !timeSlot) {
      res.status(400);
      throw new Error('Please select a date and time slot for your appointment');
    }

    const mentor = await Mentor.findById(mentorId).populate({
      path: 'userId',
      select: 'name',
    });

    if (!mentor) {
      res.status(404);
      throw new Error('Mentor not found');
    }

    res.status(200).json({
      success: true,
      message: `Booking Confirmed! You have scheduled a video session with ${mentor.userId.name} on ${date} at ${timeSlot}. A calendar invite has been sent to your registered email.`,
      details: {
        mentorName: mentor.userId.name,
        date,
        timeSlot,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMentors,
  bookMentorSession,
};
