// Master list of financial confidence assessment questions
const questions = [
  {
    id: 'Q1',
    category: 'moneyManagement',
    text: 'How do you track your monthly expenses?',
    options: [
      { text: 'I do not track them at all.', score: 20 },
      { text: 'I track them mentally.', score: 50 },
      { text: 'I write them down in a notebook or spreadsheet.', score: 80 },
      { text: 'I use automated budgeting tools and track strictly.', score: 100 }
    ]
  },
  {
    id: 'Q2',
    category: 'moneyManagement',
    text: 'Do you maintain an emergency savings fund?',
    options: [
      { text: 'No, what is an emergency fund?', score: 10 },
      { text: 'No, I spend everything I receive.', score: 30 },
      { text: 'Yes, but it would only cover 1 month of expenses.', score: 70 },
      { text: 'Yes, I have 3 to 6 months of expenses saved.', score: 100 }
    ]
  },
  {
    id: 'Q3',
    category: 'investingKnowledge',
    text: 'How well do you understand the concept of compound interest?',
    options: [
      { text: 'I have no idea how it works.', score: 20 },
      { text: 'I know it helps money grow, but not how it works mathematically.', score: 60 },
      { text: 'I understand it fully and can explain how it creates exponential growth.', score: 100 }
    ]
  },
  {
    id: 'Q4',
    category: 'investingKnowledge',
    text: 'If you want to secure guaranteed, risk-free returns on savings, which asset would you choose?',
    options: [
      { text: 'Stocks / Equities', score: 20 },
      { text: 'Mutual Funds', score: 50 },
      { text: 'Fixed Deposits (FD) or Sovereign Bonds', score: 100 }
    ]
  },
  {
    id: 'Q5',
    category: 'riskUnderstanding',
    text: 'Suppose your virtual stock portfolio falls by 15% in a single week. What is your reaction?',
    options: [
      { text: 'Panic and sell all assets immediately to stop further losses.', score: 20 },
      { text: 'Feel very anxious, check stock prices constantly, but hold.', score: 60 },
      { text: 'Hold long-term and look at buying more shares at a discount.', score: 100 }
    ]
  },
  {
    id: 'Q6',
    category: 'riskUnderstanding',
    text: 'Which of the following assets generally carries the highest volatility and risk?',
    options: [
      { text: 'Bank Fixed Deposits', score: 10 },
      { text: 'Gold ETF or physical gold', score: 45 },
      { text: 'Individual Company Stocks', score: 100 }
    ]
  },
  {
    id: 'Q7',
    category: 'goalPlanning',
    text: 'Do you set specific timelines for your financial goals (e.g. buying a phone in 12 months)?',
    options: [
      { text: 'No, I just buy things when I feel like it.', score: 20 },
      { text: 'Yes, but I don\'t structure my savings to meet them.', score: 60 },
      { text: 'Yes, I compute exactly how much to save monthly to achieve them.', score: 100 }
    ]
  },
  {
    id: 'Q8',
    category: 'goalPlanning',
    text: 'How do you save money for future goals?',
    options: [
      { text: 'I save whatever is leftover at the end of the month.', score: 30 },
      { text: 'I save a fixed monthly sum before spending on lifestyle.', score: 85 },
      { text: 'I segregate specific savings buckets mapped to individual goals.', score: 100 }
    ]
  },
  {
    id: 'Q9',
    category: 'financialBehavior',
    text: 'How do you make decisions about buying an investment asset?',
    options: [
      { text: 'I follow social media trends or friends tips.', score: 20 },
      { text: 'I read financial blogs and basic online articles.', score: 60 },
      { text: 'I analyze risk levels, historical charts, and goal timelines.', score: 100 }
    ]
  },
  {
    id: 'Q10',
    category: 'financialBehavior',
    text: 'When you receive pocket money, a gift, or salary, what is your initial action?',
    options: [
      { text: 'Spend it on shopping/entertainment first, figure out savings later.', score: 20 },
      { text: 'Pay essential bills/obligations, spend rest, save remainder.', score: 60 },
      { text: 'Instantly allocate 20%+ to savings and investments first, then budget the rest.', score: 100 }
    ]
  },
  {
    id: 'Q11',
    category: 'riskTolerance',
    text: 'If a long-term investment temporarily fell 20%, what would you be most comfortable doing?',
    options: [
      { text: 'Move to safer options immediately, even if that locks in a loss.', score: 20 },
      { text: 'Reduce some exposure because the drop would feel uncomfortable.', score: 45 },
      { text: 'Stay invested if my plan and timeline have not changed.', score: 70 },
      { text: 'Stay invested and consider adding gradually, knowing losses are possible.', score: 90 }
    ]
  }
];

/**
 * Calculates domain-specific and overall financial confidence scores
 * @param {Array} userAnswers Array of { questionId, selectedOption }
 * @returns {Object} scores object containing categorised and overall score
 */
const calculateConfidence = (userAnswers = []) => {
  const categoryScores = {
    moneyManagement: [],
    investingKnowledge: [],
    riskUnderstanding: [],
    goalPlanning: [],
    financialBehavior: []
  };

  // Populate actual answers
  userAnswers.forEach((ans) => {
    const questionObj = questions.find((q) => q.id === ans.questionId);
    if (questionObj && questionObj.options[ans.selectedOption]) {
    const optionVal = questionObj.options[ans.selectedOption];
    if (categoryScores[questionObj.category]) categoryScores[questionObj.category].push(optionVal.score);
    }
  });

  const scores = {};
  let totalScoreSum = 0;
  let categoriesCount = 0;

  // Compute average for each category
  Object.keys(categoryScores).forEach((cat) => {
    const catArray = categoryScores[cat];
    const avg = catArray.length > 0 
      ? Math.round(catArray.reduce((a, b) => a + b, 0) / catArray.length) 
      : 50; // Default baseline score if not answered
    
    scores[cat] = avg;
    totalScoreSum += avg;
    categoriesCount++;
  });

  // Calculate overall confidence score
  scores.overall = Math.round(totalScoreSum / categoriesCount);

  return scores;
};

module.exports = {
  questions,
  calculateConfidence
};
