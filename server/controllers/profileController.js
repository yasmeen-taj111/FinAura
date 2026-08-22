const FinancialProfile = require('../models/FinancialProfile');
const { questions, calculateConfidence } = require('../utils/calculateConfidence');
const Goal = require('../models/Goal');
const Portfolio = require('../models/Portfolio');
const ConsolidatedPortfolio = require('../models/ConsolidatedPortfolio');
const { buildRiskProfile } = require('../utils/riskProfile');

/**
 * @desc    Get user financial profile
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await FinancialProfile.findOne({ userId: req.user._id }).lean();
    
    if (!profile) {
      // Return a skeleton profile to indicate assessment is needed
      return res.status(200).json({ assessmentCompleted: false });
    }

    const [goals, portfolio, consolidated] = await Promise.all([
      Goal.find({ userId: req.user._id }).lean(),
      Portfolio.findOne({ userId: req.user._id }).populate('holdings.assetId').lean(),
      ConsolidatedPortfolio.find({ userId: req.user._id }).lean(),
    ]);
    res.status(200).json({ ...profile, riskProfile: buildRiskProfile({ profile, goals, portfolio, consolidated }) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get financial confidence assessment questions
 * @route   GET /api/profile/questions
 * @access  Private
 */
const getQuestions = async (req, res, next) => {
  try {
    // Strip score values from options to prevent client manipulation / cheating
    const safeQuestions = questions.map((q) => ({
      id: q.id,
      category: q.category,
      text: q.text,
      options: q.options.map((opt) => opt.text)
    }));

    res.status(200).json(safeQuestions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit financial assessment & calculate confidence score
 * @route   POST /api/profile/assessment
 * @access  Private
 */
const submitAssessment = async (req, res, next) => {
  try {
    const { monthlyIncome, monthlyExpenses, monthlySavings, answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400);
      throw new Error('Please provide assessment answers');
    }

    // Calculate confidence scores based on answers
    const scores = calculateConfidence(answers);

    // Save or update profile
    const profile = await FinancialProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        monthlyIncome: monthlyIncome || 0,
        monthlyExpenses: monthlyExpenses || 0,
        monthlySavings: monthlySavings || 0,
        answers,
        scores,
        assessmentCompleted: true
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getQuestions,
  submitAssessment
};
