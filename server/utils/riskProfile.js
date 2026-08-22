const RISK_VALUE = { Low: 20, Moderate: 50, High: 75, 'Very High': 95 };

const answerIndex = (answers, questionId) => {
  const answer = (answers || []).find((item) => item.questionId === questionId);
  return Number.isInteger(answer?.selectedOption) ? answer.selectedOption : null;
};

const horizonScore = (months) => {
  if (months >= 84) return 100;
  if (months >= 60) return 85;
  if (months >= 36) return 70;
  if (months >= 12) return 45;
  return 20;
};

const buildRiskProfile = ({ profile, goals = [], portfolio, consolidated = [] }) => {
  if (!profile?.assessmentCompleted) return null;

  const toleranceOptions = [20, 45, 70, 90];
  const toleranceAnswer = answerIndex(profile.answers, 'Q11');
  const tolerance = toleranceAnswer === null ? Math.round((profile.scores?.riskUnderstanding || 50) * 0.7) : toleranceOptions[toleranceAnswer];
  const income = Number(profile.monthlyIncome) || 0;
  const expenses = Number(profile.monthlyExpenses) || 0;
  const savingsRate = income > 0 ? Math.max(0, (Number(profile.monthlySavings) || 0) / income) : 0;
  const emergencyAnswer = answerIndex(profile.answers, 'Q2');
  const emergencyScore = [10, 25, 60, 100][emergencyAnswer] ?? 40;
  const savingsScore = savingsRate >= 0.25 ? 100 : savingsRate >= 0.15 ? 75 : savingsRate >= 0.05 ? 45 : 20;
  const capacity = Math.round((savingsScore * 0.6) + (emergencyScore * 0.4));

  const activeGoals = goals.filter((goal) => Number(goal.targetAmount) > Number(goal.currentSavings || 0));
  const weightedHorizon = activeGoals.length
    ? activeGoals.reduce((sum, goal) => sum + horizonScore(Number(goal.timeline) || 0) * Number(goal.targetAmount || 1), 0) /
      activeGoals.reduce((sum, goal) => sum + Number(goal.targetAmount || 1), 0)
    : 60;
  const shortestGoalMonths = activeGoals.length ? Math.min(...activeGoals.map((goal) => Number(goal.timeline) || 0)) : null;

  const sandboxPositions = (portfolio?.holdings || []).map((holding) => ({
    value: Number(holding.quantity || 0) * Number(holding.assetId?.currentPrice || 0),
    risk: RISK_VALUE[holding.assetId?.riskLevel] ?? 50,
  }));
  const externalPositions = consolidated.map((holding) => ({
    value: Number(holding.quantity || 0) * Number(holding.currentPrice || 0),
    risk: holding.assetType === 'STOCK' ? 75 : holding.assetType === 'MUTUAL_FUND' ? 60 : holding.assetType === 'GOLD' ? 40 : 20,
  }));
  const positions = [...sandboxPositions, ...externalPositions];
  const investedValue = positions.reduce((sum, position) => sum + position.value, 0);
  const portfolioRisk = investedValue ? Math.round(positions.reduce((sum, position) => sum + position.value * position.risk, 0) / investedValue) : null;

  let score = Math.round((tolerance * 0.45) + (capacity * 0.3) + (weightedHorizon * 0.25));
  const constraints = [];
  if (shortestGoalMonths !== null && shortestGoalMonths < 12) {
    score = Math.min(score, 45);
    constraints.push('At least one active goal is due within 12 months, so capital for that goal should avoid large market swings.');
  } else if (shortestGoalMonths !== null && shortestGoalMonths < 36) {
    score = Math.min(score, 65);
    constraints.push('Your nearer-term goals reduce the amount of volatility that is practical for goal money.');
  }
  if (emergencyScore < 60) {
    score = Math.min(score, 60);
    constraints.push('Your emergency reserve is still developing; strengthen it before taking more market risk.');
  }

  const band = score < 35 ? 'Conservative' : score < 60 ? 'Moderate' : score < 80 ? 'Growth' : 'Aggressive';
  const allocationGuide = {
    Conservative: 'Educational mix: emphasize cash and high-quality debt; keep equity exposure limited.',
    Moderate: 'Educational mix: balance diversified equity with debt and near-term cash reserves.',
    Growth: 'Educational mix: diversified equity can be the larger allocation when goal money has a longer horizon.',
    Aggressive: 'Educational mix: higher equity volatility may be tolerable for long-term money, while short-term goals stay protected.',
  }[band];

  return {
    score,
    band,
    tolerance,
    capacity,
    horizon: Math.round(weightedHorizon),
    portfolioRisk,
    savingsRate: Math.round(savingsRate * 100),
    goalCount: activeGoals.length,
    constraints,
    allocationGuide,
    disclaimer: 'This is an educational risk assessment, not personalised investment advice or a recommendation to buy or sell any product.',
  };
};

module.exports = { buildRiskProfile };
