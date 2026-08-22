const Goal = require('../models/Goal');
const UserProgress = require('../models/UserProgress');
const Badge = require('../models/Badge');

// Helper to check and award badge
const awardBadgeDirect = async (userId, badgeCode) => {
  const progress = await UserProgress.findOne({ userId });
  if (!progress) return null;

  const badge = await Badge.findOne({ code: badgeCode });
  if (!badge) return null;

  const alreadyEarned = progress.earnedBadges.some(
    (b) => b.badgeId.toString() === badge._id.toString()
  );

  if (!alreadyEarned) {
    progress.earnedBadges.push({ badgeId: badge._id, earnedAt: new Date() });
    progress.xp += badge.xpReward;
    await progress.save();
    return badge;
  }
  return null;
};

/**
 * @desc    Get user financial goals
 * @route   GET /api/goals
 * @access  Private
 */
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new financial goal
 * @route   POST /api/goals
 * @access  Private
 */
const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, timeline, currentSavings, category } = req.body;

    if (!name || !targetAmount || !timeline) {
      res.status(400);
      throw new Error('Please provide name, targetAmount, and timeline in months');
    }

    const goal = await Goal.create({
      userId: req.user._id,
      name,
      targetAmount,
      timeline,
      currentSavings: currentSavings || 0,
      category: category || 'Short-Term',
    });

    let badgeUnlocked = null;
    const goalsCount = await Goal.countDocuments({ userId: req.user._id });
    if (goalsCount === 1) {
      // Award Goal Setter badge
      const badge = await awardBadgeDirect(req.user._id, 'GOAL_SETTER');
      if (badge) badgeUnlocked = badge;
    }

    res.status(201).json({
      goal,
      badgeUnlocked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update financial goal savings or details
 * @route   PUT /api/goals/:id
 * @access  Private
 */
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this goal');
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete financial goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this goal');
    }

    await goal.deleteOne();

    res.status(200).json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate SIP compounding projections for a goal
 * @route   POST /api/goals/:id/simulate
 * @access  Private
 */
const simulateGoalSavings = async (req, res, next) => {
  try {
    const { monthlyContribution, annualReturnRate } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const contribution = Number(monthlyContribution) || 0;
    const rate = Number(annualReturnRate) || 8; // Default 8% annual returns
    const months = goal.timeline;
    
    const monthlyRate = rate / 12 / 100;
    let projectedSavings = goal.currentSavings;
    const projections = [];

    // Calculate month-by-month projection
    for (let month = 0; month <= months; month++) {
      if (month > 0) {
        // Compound existing savings + add contribution and compound it
        projectedSavings = projectedSavings * (1 + monthlyRate) + contribution;
      }
      projections.push({
        month,
        savings: Math.round(projectedSavings),
        target: goal.targetAmount,
      });
    }

    const finalSavings = projections[months].savings;
    const diff = finalSavings - goal.targetAmount;
    const metTarget = diff >= 0;

    let recommendation = '';
    if (metTarget) {
      recommendation = `Awesome! Your savings plan of ₹${contribution.toLocaleString()}/month at ${rate}% annual returns will help you achieve your goal! You will have surplus savings of ₹${Math.abs(diff).toLocaleString()}.`;
    } else {
      // Calculate suggested monthly contribution to hit target exactly
      // Target = S*(1+r)^T + M*(((1+r)^T - 1)/r) => M = (Target - S*(1+r)^T) * r / ((1+r)^T - 1)
      const compoundFactor = Math.pow(1 + monthlyRate, months);
      const remainingTarget = goal.targetAmount - (goal.currentSavings * compoundFactor);
      
      let suggestedContribution = 0;
      if (remainingTarget > 0) {
        if (monthlyRate === 0) {
          suggestedContribution = remainingTarget / months;
        } else {
          suggestedContribution = remainingTarget * monthlyRate / (compoundFactor - 1);
        }
      }
      
      recommendation = `You are falling short by ₹${Math.abs(diff).toLocaleString()} to reach your goal. To hit the target on time, consider raising your monthly savings to ₹${Math.round(suggestedContribution).toLocaleString()} (currently ₹${contribution.toLocaleString()}) or extending your timeline.`;
    }

    res.status(200).json({
      goalName: goal.name,
      targetAmount: goal.targetAmount,
      timeline: goal.timeline,
      currentSavings: goal.currentSavings,
      monthlyContribution: contribution,
      annualReturnRate: rate,
      finalSavings,
      metTarget,
      difference: diff,
      recommendation,
      projections,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  simulateGoalSavings,
};
