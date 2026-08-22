const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load server env
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Asset = require('../models/Asset');
const Badge = require('../models/Badge');
const Resource = require('../models/Resource');
const Mentor = require('../models/Mentor');
const Goal = require('../models/Goal');
const detailedContent = require('./detailedContent');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/finaura';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully. Purging existing collections...');

    // Purge existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Asset.deleteMany({});
    await Badge.deleteMany({});
    await Resource.deleteMany({});
    await Mentor.deleteMany({});
    await Goal.deleteMany({});

    console.log('Database purged. Starting seeding...');

    // 1. Seed default user for testing
    const testUser = await User.create({
      name: 'FinAura Learner',
      email: 'user@finaura.com',
      password: 'FinAuraPass123!',
      dateOfBirth: new Date('2005-01-01'),
      role: 'USER',
      language: 'en',
    });
    console.log(`Test user seeded: ${testUser.email} (password: FinAuraPass123!)`);

    // 2. Seed 10 badges
    const badgesData = [
      { title: 'First Steps', description: 'Complete your first financial lesson', code: 'FIRST_LESSON', xpReward: 100 },
      { title: 'Quiz Whiz', description: 'Score 100% on any quiz', code: 'QUIZ_MASTER', xpReward: 150 },
      { title: 'Safe Saver', description: 'Complete the Saving basics module', code: 'SAVING_BASICS', xpReward: 200 },
      { title: 'Risk Navigator', description: 'Complete the Risk Education assessment', code: 'RISK_EXPLORER', xpReward: 200 },
      { title: 'Compound King', description: 'Complete the compounding module', code: 'COMPOUNDING_EXPERT', xpReward: 250 },
      { title: 'Market Survivor', description: 'Complete a virtual Bear Market simulation', code: 'MARKET_SURVIVOR', xpReward: 300 },
      { title: 'Goal Setter', description: 'Create your first simulated financial goal', code: 'GOAL_SETTER', xpReward: 100 },
      { title: 'Diversified', description: 'Hold at least 3 asset types in your portfolio', code: 'DIVERSIFIED', xpReward: 250 },
      { title: '30-Day Streak', description: 'Maintain a 30-day learning streak', code: 'STREAK_30', xpReward: 500 },
      { title: 'Confidence Master', description: 'Achieve a Financial Confidence Score of 85+', code: 'CONFIDENCE_MASTER', xpReward: 500 },
    ];
    const badges = await Badge.insertMany(badgesData);
    console.log(`Seeded ${badges.length} learning badges.`);

    // 3. Seed 10 educational resources
    const resourcesData = [
      { title: 'Rich Dad Poor Dad', description: 'Robert Kiyosaki explains the difference between assets and liabilities.', category: 'BOOK', difficulty: 'Beginner', url: 'https://example.com/rich-dad' },
      { title: 'Let\'s Talk Money', description: 'Monika Halan provides a practical financial structure for Indians.', category: 'BOOK', difficulty: 'Beginner', url: 'https://example.com/talk-money' },
      { title: 'The Psychology of Money', description: 'Morgan Housel explores the behavioral aspects of investing.', category: 'BOOK', difficulty: 'Intermediate', url: 'https://example.com/psych-money' },
      { title: 'Understanding SIP', description: 'A short visual guide to Systematic Investment Plans.', category: 'VIDEO', difficulty: 'Beginner', url: 'https://example.com/sip-video' },
      { title: 'Basics of Stock Markets', description: 'Introduction to equity trading and shares by Varsity.', category: 'COURSE', difficulty: 'Beginner', url: 'https://example.com/varsity' },
      { title: 'What is Inflation?', description: 'How rising prices erode your purchasing power over time.', category: 'ARTICLE', difficulty: 'Beginner', url: 'https://example.com/inflation-article' },
      { title: 'Debt vs Equity', description: 'A breakdown of risks and rewards in bonds vs shares.', category: 'ARTICLE', difficulty: 'Intermediate', url: 'https://example.com/debt-equity' },
      { title: 'How Mutual Funds Work', description: 'An interactive video showing pool-based asset management.', category: 'VIDEO', difficulty: 'Beginner', url: 'https://example.com/mf-video' },
      { title: 'Power of Compound Interest', description: 'Mathematical breakdown of long-term wealth compounding.', category: 'ARTICLE', difficulty: 'Intermediate', url: 'https://example.com/compound-article' },
      { title: 'Guide to Emergency Funds', description: 'How to structure and save 6 months of expenses.', category: 'ARTICLE', difficulty: 'Beginner', url: 'https://example.com/emergency-guide' },
    ];
    const resources = await Resource.insertMany(resourcesData);
    console.log(`Seeded ${resources.length} resources.`);

    // 4. Seed 5 demo mentors (creates user profiles + mentor profiles)
    const mentorsData = [
      { name: 'Dr. Amit Sharma', email: 'amit.mentor@finaura.com', bio: 'Former SEBI advisor with 15+ years teaching financial literacy.', expertise: ['Investing', 'Stocks', 'Risk'], experience: 15, hourlyFee: 500, rating: 4.9 },
      { name: 'Priya Iyer', email: 'priya.mentor@finaura.com', bio: 'Certified Financial Planner specializing in budgeting for young professionals.', expertise: ['Saving', 'Budgeting', 'FD'], experience: 8, hourlyFee: 300, rating: 4.8 },
      { name: 'Rajesh Mehta', email: 'rajesh.mentor@finaura.com', bio: 'Chartered Accountant focused on tax planning and debt management.', expertise: ['Tax Basics', 'Budgeting', 'Compounding'], experience: 12, hourlyFee: 450, rating: 4.7 },
      { name: 'Siddharth Roy', email: 'sid.mentor@finaura.com', bio: 'Ex-portfolio manager passionate about teaching compounding & equity basics.', expertise: ['Stocks', 'Mutual Funds', 'Investing'], experience: 10, hourlyFee: 600, rating: 4.9 },
      { name: 'Meera Deshmukh', email: 'meera.mentor@finaura.com', bio: 'Behavioral economist explaining investor psychology and risk tolerance.', expertise: ['Financial Psychology', 'Risk', 'Inflation'], experience: 6, hourlyFee: 350, rating: 4.6 },
    ];

    for (const m of mentorsData) {
      const user = await User.create({
        name: m.name,
        email: m.email,
        password: 'FinAuraMentor123!',
        dateOfBirth: new Date('1985-05-05'),
        role: 'MENTOR',
      });
      await Mentor.create({
        userId: user._id,
        bio: m.bio,
        expertise: m.expertise,
        experience: m.experience,
        verificationStatus: 'VERIFIED',
        hourlyFee: m.hourlyFee,
        rating: m.rating,
      });
    }
    console.log(`Seeded 5 Mentors with matching User accounts.`);

    // 5. Seed 10 virtual assets
    const assetsData = [
      { name: 'Tata Consultancy Services', symbol: 'TCS', type: 'STOCK', currentPrice: 3800, previousPrice: 3820, riskLevel: 'Moderate', description: 'Indias leading IT services exporter. Solid blue-chip.', volatility: 8 },
      { name: 'Reliance Industries', symbol: 'RELIANCE', type: 'STOCK', currentPrice: 2900, previousPrice: 2850, riskLevel: 'Moderate', description: 'Diversified conglomerate spanning refining, retail, and telecom.', volatility: 10 },
      { name: 'Nifty 50 Index Fund', symbol: 'NIFTY50', type: 'MUTUAL_FUND', currentPrice: 220, previousPrice: 221, riskLevel: 'Moderate', description: 'Invests in Indias top 50 listed companies by market capitalization.', volatility: 7 },
      { name: 'Small Cap Growth Fund', symbol: 'SMALLCAP', type: 'MUTUAL_FUND', currentPrice: 85, previousPrice: 88, riskLevel: 'Very High', description: 'Aggressive equity fund focusing on high-growth startup enterprises.', volatility: 18 },
      { name: 'Sovereign Gold Bond', symbol: 'GOLD', type: 'GOLD', currentPrice: 6500, previousPrice: 6470, riskLevel: 'Low', description: 'RBI issued bond tracked to the physical market price of gold.', volatility: 5 },
      { name: 'SBI Fixed Deposit (1 Year)', symbol: 'SBIFD', type: 'FD', currentPrice: 10000, previousPrice: 10000, riskLevel: 'Low', description: 'Guaranteed returns at 7% per annum. Virtually risk-free.', volatility: 0 },
      { name: 'Government Securities (10 Year)', symbol: 'GSEC10Y', type: 'BOND', currentPrice: 98, previousPrice: 97.8, riskLevel: 'Low', description: 'Central government sovereign bonds yielding periodic interest.', volatility: 3 },
      { name: 'Zomato Limited', symbol: 'ZOMATO', type: 'STOCK', currentPrice: 160, previousPrice: 152, riskLevel: 'High', description: 'Food delivery and restaurant discovery tech platform. High-growth.', volatility: 25 },
      { name: 'HDFC Liquid Fund', symbol: 'LIQUID', type: 'MUTUAL_FUND', currentPrice: 50, previousPrice: 50, riskLevel: 'Low', description: 'Low risk mutual fund investing in short-term debt instruments.', volatility: 1 },
      { name: 'Cash Account', symbol: 'CASH', type: 'CASH', currentPrice: 1, previousPrice: 1, riskLevel: 'Low', description: 'Simulated cash balance.', volatility: 0 },
    ];
    const assets = await Asset.insertMany(assetsData);
    console.log(`Seeded ${assets.length} virtual assets.`);

    // 6. Seed 5 mock Goals for testUser
    const goalsData = [
      { userId: testUser._id, name: 'College Semester Laptop', targetAmount: 60000, timeline: 12, currentSavings: 15000, category: 'Short-Term' },
      { userId: testUser._id, name: 'Emergency Safety Fund', targetAmount: 50000, timeline: 8, currentSavings: 20000, category: 'Short-Term' },
      { userId: testUser._id, name: 'First Mutual Fund Goal', targetAmount: 200000, timeline: 36, currentSavings: 40000, category: 'Medium-Term' },
      { userId: testUser._id, name: 'Higher Studies Savings', targetAmount: 500000, timeline: 60, currentSavings: 100000, category: 'Long-Term' },
      { userId: testUser._id, name: 'Simulated Bike Purchase', targetAmount: 120000, timeline: 24, currentSavings: 30000, category: 'Medium-Term' },
    ];
    const goals = await Goal.insertMany(goalsData);
    console.log(`Seeded ${goals.length} initial Goals for test user.`);

    // 7. Seed 5 Courses + 15 Modules + 30 Lessons + 50 Quiz Questions
    const coursesData = [
      { title: 'Money Basics & Budgeting', description: 'Learn how to manage, allocate, and budget your first earnings.', category: 'Money Basics', difficulty: 'Beginner', xpReward: 300 },
      { title: 'The Power of Compounding & Saving', description: 'Understand how compound interest grows money exponentially over time.', category: 'Compounding', difficulty: 'Beginner', xpReward: 300 },
      { title: 'Introduction to Investing & Assets', description: 'Explore stocks, mutual funds, gold, and fixed deposits.', category: 'Investing', difficulty: 'Intermediate', xpReward: 400 },
      { title: 'Risk & Portfolio Diversification', description: 'How to protect your assets and understand market volatility.', category: 'Risk', difficulty: 'Intermediate', xpReward: 400 },
      { title: 'Investor Psychology & Behavior', description: 'Train your brain to avoid emotional selling and market panic.', category: 'Financial Psychology', difficulty: 'Advanced', xpReward: 500 },
    ];

    const courses = await Course.insertMany(coursesData);
    console.log(`Seeded ${courses.length} courses. Seeding Modules, Lessons and Quizzes...`);

    let quizCount = 0;
    let lessonCount = 0;
    let moduleCount = 0;

    // Course 1: Money Basics & Budgeting (3 Modules, 6 Lessons, 10 Questions)
    const c1Modules = [
      { title: 'Needs vs Wants', description: 'Factual assessment of where your money goes.', order: 1 },
      { title: 'The 50/30/20 Rule', description: 'Standard allocations for expenses, lifestyle, and saving.', order: 2 },
      { title: 'Setting Up Emergency Funds', description: 'Why a rainy day fund comes before investing.', order: 3 },
    ];

    for (let i = 0; i < c1Modules.length; i++) {
      const mod = await Module.create({ courseId: courses[0]._id, ...c1Modules[i] });
      moduleCount++;

      // Create 2 lessons per module
      for (let j = 1; j <= 2; j++) {
        const order = (i * 2) + j;
        const lesson = await Lesson.create({
          moduleId: mod._id,
          title: `Lesson ${order}: Core Concepts of ${mod.title}`,
          content: detailedContent[mod.title] || `This is the deep-dive lesson material for ${mod.title}. In this segment, we focus on understanding basic transaction mechanics, tracking income, categorizing cash flows, and avoiding common youth debt traps in India.`,
          order: j,
          xpReward: 50,
        });
        lessonCount++;

        // Add a quiz with 2 questions for each lesson
        const questions = [
          {
            question: `What is the primary indicator of a 'want' as opposed to a 'need'?`,
            options: ['It is essential for survival', 'It can be postponed without immediate threat to health or shelter', 'It has a higher tax bracket', 'It is always cheaper than a need'],
            correctAnswer: 'It can be postponed without immediate threat to health or shelter',
            explanation: 'Needs are absolute essentials like food, basic shelter, and healthcare. Wants represent lifestyle enhancements that you can defer.'
          },
          {
            question: `Under the 50/30/20 rule, where does saving/investing belong?`,
            options: ['The 50% category', 'The 30% category', 'The 20% category', 'It is split evenly across all three'],
            correctAnswer: 'The 20% category',
            explanation: 'The rule advises dedicating 50% to needs, 30% to wants, and 20% to savings and investment goals.'
          }
        ];

        await Quiz.create({
          lessonId: lesson._id,
          questions,
          passingScore: 70,
          xpReward: 100,
        });
        quizCount += 2;
      }
    }

    // Course 2: Power of Compounding & Saving (3 Modules, 6 Lessons, 10 Questions)
    const c2Modules = [
      { title: 'Simple vs Compound Interest', description: 'The math behind growing money.', order: 1 },
      { title: 'The Cost of Delay', description: 'How starting early gives a massive compounding advantage.', order: 2 },
      { title: 'Inflation: The Silent Money Eater', description: 'Why leaving cash in a locker decreases its value.', order: 3 },
    ];

    for (let i = 0; i < c2Modules.length; i++) {
      const mod = await Module.create({ courseId: courses[1]._id, ...c2Modules[i] });
      moduleCount++;

      for (let j = 1; j <= 2; j++) {
        const order = (i * 2) + j;
        const lesson = await Lesson.create({
          moduleId: mod._id,
          title: `Lesson ${order}: Master ${mod.title}`,
          content: `Welcome to the study of compounding. Here, we analyze the compounding frequency, look at how small daily savings grow over a decade, and model inflation rates in India eroding interest gains.`,
          order: j,
          xpReward: 50,
        });
        lessonCount++;

        const questions = [
          {
            question: `If you earn 10% compound interest on ₹10,000, what is your balance after 2 years?`,
            options: ['₹12,000', '₹12,100', '₹11,000', '₹13,000'],
            correctAnswer: '₹12,100',
            explanation: 'Year 1: ₹10,000 + 10% = ₹11,000. Year 2: ₹11,000 + 10% = ₹12,100. This is the compounding effect!'
          },
          {
            question: `What is the effect of inflation on your cash savings?`,
            options: ['It increases the value of cash', 'It has no effect', 'It erodes the purchasing power of your money', 'It doubles your interest rate'],
            correctAnswer: 'It erodes the purchasing power of your money',
            explanation: 'Inflation means rising prices, meaning a fixed amount of cash will buy fewer goods and services in the future.'
          }
        ];

        await Quiz.create({
          lessonId: lesson._id,
          questions,
          passingScore: 70,
          xpReward: 100,
        });
        quizCount += 2;
      }
    }

    // Course 3: Introduction to Investing (3 Modules, 6 Lessons, 10 Questions)
    const c3Modules = [
      { title: 'Equity: Owning a Slice of Business', description: 'Introduction to stocks and share markets.', order: 1 },
      { title: 'Mutual Funds & SIPs', description: 'Pool investing and building regular habits.', order: 2 },
      { title: 'Traditional vs Modern Assets', description: 'Fixed Deposits, Gold, and Bonds compared.', order: 3 },
    ];

    for (let i = 0; i < c3Modules.length; i++) {
      const mod = await Module.create({ courseId: courses[2]._id, ...c3Modules[i] });
      moduleCount++;

      for (let j = 1; j <= 2; j++) {
        const order = (i * 2) + j;
        const lesson = await Lesson.create({
          moduleId: mod._id,
          title: `Lesson ${order}: Understand ${mod.title}`,
          content: `In this segment, we unpack different asset classes. We study what shares represent, how professional fund managers run mutual funds, and why historical gold returns differ from bank FDs.`,
          order: j,
          xpReward: 50,
        });
        lessonCount++;

        const questions = [
          {
            question: `What does owning a stock mean?`,
            options: ['You loaned money to the company', 'You own a small percentage/share of the company', 'The company owes you interest payments', 'You are legally responsible for all company debts'],
            correctAnswer: 'You own a small percentage/share of the company',
            explanation: 'Buying a stock grants you partial equity ownership in that corporation.'
          },
          {
            question: `What does SIP stand for in mutual fund investing?`,
            options: ['Simple Investment Plan', 'Systematic Investment Plan', 'Stock Investment Portfolio', 'Secure Income Program'],
            correctAnswer: 'Systematic Investment Plan',
            explanation: 'SIP is an investment route where you regularly invest a fixed sum into a mutual fund scheme.'
          }
        ];

        await Quiz.create({
          lessonId: lesson._id,
          questions,
          passingScore: 70,
          xpReward: 100,
        });
        quizCount += 2;
      }
    }

    // Course 4: Risk & Portfolio Diversification (3 Modules, 6 Lessons, 10 Questions)
    const c4Modules = [
      { title: 'What is Investment Risk?', description: 'Understanding market volatility and loss.', order: 1 },
      { title: 'The Diversification shield', description: 'Why you should never put all your eggs in one basket.', order: 2 },
      { title: 'Risk Profiles Explained', description: 'Determining if you are conservative, moderate, or growth-oriented.', order: 3 },
    ];

    for (let i = 0; i < c4Modules.length; i++) {
      const mod = await Module.create({ courseId: courses[3]._id, ...c4Modules[i] });
      moduleCount++;

      for (let j = 1; j <= 2; j++) {
        const order = (i * 2) + j;
        const lesson = await Lesson.create({
          moduleId: mod._id,
          title: `Lesson ${order}: Mastering ${mod.title}`,
          content: `Risk management is the key to long term survival in investing. We look at standard deviations (volatility), asset correlation (why gold often goes up when stocks fall), and setting allocation limits.`,
          order: j,
          xpReward: 50,
        });
        lessonCount++;

        const questions = [
          {
            question: `Which of the following is the best example of diversification?`,
            options: ['Buying 5 different tech stocks', 'Putting all savings into a single blue-chip stock', 'Allocating across stocks, bonds, gold, and cash', 'Investing only in real estate'],
            correctAnswer: 'Allocating across stocks, bonds, gold, and cash',
            explanation: 'Diversifying means spreading capital across different uncorrelated asset classes to minimize total portfolio risk.'
          },
          {
            question: `If an asset has high volatility, what does that imply?`,
            options: ['Its price is fixed', 'Its price fluctuates widely and rapidly', 'It is guaranteed to make money', 'It cannot be sold'],
            correctAnswer: 'Its price fluctuates widely and rapidly',
            explanation: 'Volatility refers to the size and speed of price changes. High volatility means higher short-term risk.'
          }
        ];

        await Quiz.create({
          lessonId: lesson._id,
          questions,
          passingScore: 70,
          xpReward: 100,
        });
        quizCount += 2;
      }
    }

    // Course 5: Investor Psychology (3 Modules, 6 Lessons, 10 Questions)
    const c5Modules = [
      { title: 'Fear and Greed in Markets', description: 'Emotions driving market cycles.', order: 1 },
      { title: 'FOMO: Fear Of Missing Out', description: 'Why investing in social media hype leads to losses.', order: 2 },
      { title: 'Patience and Discipline', description: 'Avoiding panic-selling during simulated market crashes.', order: 3 },
    ];

    for (let i = 0; i < c5Modules.length; i++) {
      const mod = await Module.create({ courseId: courses[4]._id, ...c5Modules[i] });
      moduleCount++;

      for (let j = 1; j <= 2; j++) {
        const order = (i * 2) + j;
        const lesson = await Lesson.create({
          moduleId: mod._id,
          title: `Lesson ${order}: Navigate ${mod.title}`,
          content: `Your biggest asset—or liability—is your brain. We cover cognitive biases, herd behavior, loss aversion (why losing ₹1000 hurts twice as much as earning ₹1000 feels good), and staying rational.`,
          order: j,
          xpReward: 50,
        });
        lessonCount++;

        const questions = [
          {
            question: `What is FOMO in investing?`,
            options: ['Frequent Optimal Market Order', 'Fear of Missing Out (buying into hype due to herd behavior)', 'Fixed Option Mutual Ownership', 'Fund Operations Management Officer'],
            correctAnswer: 'Fear of Missing Out (buying into hype due to herd behavior)',
            explanation: 'FOMO drives investors to purchase assets at peaks simply because everyone else is talking about it, often preceding market correction.'
          },
          {
            question: `What is loss aversion?`,
            options: ['Loving to take losses', 'A behavioral bias where the pain of losing is psychologically twice as powerful as the pleasure of gaining', 'A strategy that guarantees zero losses', 'Selling winning stocks too late'],
            correctAnswer: 'A behavioral bias where the pain of losing is psychologically twice as powerful as the pleasure of gaining',
            explanation: 'Loss aversion causes investors to hold onto losing assets for too long (hoping to break even) or panic-sell during minor dips.'
          }
        ];

        await Quiz.create({
          lessonId: lesson._id,
          questions,
          passingScore: 70,
          xpReward: 100,
        });
        quizCount += 2;
      }
    }

    // 8. Extended A-to-Z curriculum: deliberately structured from foundational concepts
    // to markets, analysis, protection, tax, and long-term planning.
    const extendedCurriculum = [
      { title: 'Saving, Banking & Debt Foundations', category: 'Saving', difficulty: 'Beginner', video: 'https://investor.sebi.gov.in/inv_aware_edu_videos.html', modules: [
        ['Bank accounts, UPI & cash flow', 'Learn how savings, current, recurring-deposit and fixed-deposit accounts differ; track inflows and outflows; and treat UPI convenience with the same care as cash.'],
        ['Credit cards, loans & EMIs', 'Understand principal, interest, tenure, credit utilisation, EMI amortisation, secured versus unsecured debt, and why missed payments can compound quickly.'],
        ['Emergency funds & insurance', 'Separate an emergency reserve from investment money. Learn the role of health, term life and asset insurance, exclusions, waiting periods and adequate cover.'],
      ]},
      { title: 'Stocks, Equity & How Markets Work', category: 'Stocks', difficulty: 'Beginner', video: 'https://zerodha.com/varsity/module/stock-market-basics/', modules: [
        ['Equity, shares & ownership', 'A share represents fractional ownership in a company. Learn equity versus debt, dividends, voting rights, corporate actions, and why share prices do not equal business quality.'],
        ['Exchanges, demat & orders', 'Follow the path from a demat account to NSE/BSE, brokers, order books, market and limit orders, settlement, brokerage charges and the risks of acting on tips.'],
        ['Market cap: large, mid & small cap', 'Market capitalisation equals price multiplied by shares outstanding. Compare large-cap, mid-cap and small-cap companies by size, liquidity and typical volatility—not by guaranteed return.'],
      ]},
      { title: 'Mutual Funds, ETFs & SIPs', category: 'Mutual Funds', difficulty: 'Beginner', video: 'https://investor.sebi.gov.in/inv_aware_edu_videos.html', modules: [
        ['How mutual funds work', 'Learn NAV, units, AUM, expense ratio, fund manager, benchmark, direct versus regular plans and why a fund invests according to its mandate.'],
        ['Equity, debt, hybrid & index funds', 'Compare broad-market index funds, active funds, debt funds, hybrid funds and ETFs by underlying assets, risk, liquidity, costs and goal suitability.'],
        ['SIPs, lumpsums & review discipline', 'A SIP is a contribution method, not a product or return guarantee. Learn rupee-cost averaging, mandate dates, step-ups, redemption planning and when to review without chasing returns.'],
      ]},
      { title: 'Portfolio Construction & Asset Allocation', category: 'Financial Planning', difficulty: 'Intermediate', video: 'https://zerodha.com/varsity/chapter/personal-finance-review-part-2/', modules: [
        ['Assets, liabilities & net worth', 'Build a personal balance sheet: list assets you own, liabilities you owe, liquidity, net worth and the difference between income, wealth and cash flow.'],
        ['Diversification & correlation', 'Diversification means exposure across assets and risk drivers. Learn correlation, concentration risk, rebalancing and why owning many similar stocks is not true diversification.'],
        ['Goal-based allocation', 'Match money to time horizon, required return, liquidity and ability to absorb loss. Short-term goals generally need stability; long-term goals can tolerate more fluctuation.'],
      ]},
      { title: 'Reading Markets: Charts & Candlesticks', category: 'Technical Analysis', difficulty: 'Intermediate', video: 'https://zerodha.com/varsity/module/technical-analysis/', modules: [
        ['OHLC, line charts & candlesticks', 'Read open, high, low and close. A candlestick summarises price movement for a chosen timeframe; its body and wicks describe the session, not a promise about the next one.'],
        ['Trends, support, resistance & volume', 'Explore uptrends, downtrends, ranges, support, resistance and volume. Treat these as context for risk planning, not standalone buy or sell signals.'],
        ['Moving averages & indicators', 'Learn SMA and EMA, moving-average lag, crossovers, RSI and MACD. Indicators simplify historical data but can fail, especially in volatile or sideways markets.'],
      ]},
      { title: 'Fundamental Analysis & Company Research', category: 'Markets', difficulty: 'Intermediate', video: 'https://zerodha.com/varsity/module/fundamental-analysis/', modules: [
        ['Business model & competitive position', 'Start with what the company sells, customers, industry structure, management quality, competition and the risks that could weaken future cash flows.'],
        ['Financial statements', 'Read the income statement, balance sheet and cash-flow statement together. Revenue growth alone is incomplete without margins, debt, cash generation and capital needs.'],
        ['Valuation metrics & limits', 'Understand EPS, P/E, P/B, ROE, debt-to-equity and free cash flow. Ratios are context tools: compare a company with its history, peers and business economics.'],
      ]},
      { title: 'Taxes, Compliance & Investor Protection', category: 'Tax Basics', difficulty: 'Intermediate', video: 'https://investor.sebi.gov.in/inv_aware_edu_videos.html', modules: [
        ['Tax documents & basic terms', 'Learn PAN, Form 16, AIS, TDS, tax-saving evidence, financial-year versus assessment-year terms and why records matter. Use a qualified tax professional for personal filing advice.'],
        ['Investment taxes & records', 'Understand that capital-gains treatment depends on asset type and holding period. Learn to keep contract notes, statements and dates; tax rules can change and should be verified.'],
        ['KYC, nominations & fraud prevention', 'Learn KYC, nominee updates, two-factor authentication, phishing red flags, unregistered-adviser warnings and how to verify regulated entities before acting.'],
      ]},
      { title: 'Long-Term Financial Independence', category: 'Retirement', difficulty: 'Advanced', video: 'https://zerodha.com/varsity/chapter/personal-finance-review-part-2/', modules: [
        ['Retirement math & inflation', 'Estimate future expenses using inflation assumptions, distinguish nominal from real return, and recognise longevity risk: retirement planning is an ongoing estimate, not a single magic number.'],
        ['NPS, EPF & retirement buckets', 'Compare the roles of employer retirement benefits, voluntary contributions and diversified personal investments. Check current rules and lock-ins before committing.'],
        ['Behaviour, reviews & a written plan', 'Create a yearly review: update goals, insurance, nominations, taxes, asset allocation and contribution levels. Avoid reacting to noise or treating historical returns as forecasts.'],
      ]},
    ];

    for (const courseData of extendedCurriculum) {
      const course = await Course.create({
        title: courseData.title,
        description: `A practical, structured guide to ${courseData.title.toLowerCase()} for informed decisions—not recommendations.`,
        category: courseData.category,
        difficulty: courseData.difficulty,
        xpReward: 450,
      });
      for (let index = 0; index < courseData.modules.length; index++) {
        const [title, content] = courseData.modules[index];
        const module = await Module.create({ courseId: course._id, title, description: content.slice(0, 120), order: index + 1 });
        const lesson = await Lesson.create({
          moduleId: module._id,
          title,
          content: detailedContent[title] || `${content}\n\nLearn: define the key terms in your own words. See: use a real but non-actionable example such as a household budget, a published company annual report, or an index factsheet. Try: use FinAura's virtual lab or calculator before making any real-world decision. Remember: every investment carries risk and historical outcomes do not guarantee future returns.`,
          order: 1,
          xpReward: 75,
          videoUrl: courseData.video,
          videoTitle: `Watch the ${courseData.title} companion video series`,
          durationMinutes: 12,
        });
        await Quiz.create({
          lessonId: lesson._id,
          questions: [
            { question: `Which approach best matches the lesson “${title}”?`, options: ['Use one fact as a guaranteed investment signal', 'Understand the concept, its limits, and its role in your personal plan', 'Copy a social-media trade immediately', 'Ignore costs and risks'], correctAnswer: 'Understand the concept, its limits, and its role in your personal plan', explanation: 'Strong financial decisions start with context, risk, costs, and personal goals rather than a single signal or tip.' },
            { question: 'What is the most responsible next step after learning a new financial concept?', options: ['Treat it as personal investment advice', 'Test it against your time horizon, risk capacity and verified information', 'Assume historical returns will repeat', 'Invest money you may need for emergencies'], correctAnswer: 'Test it against your time horizon, risk capacity and verified information', explanation: 'Education helps you ask better questions. Suitability depends on your specific situation, and market outcomes are uncertain.' },
          ],
          passingScore: 70,
          xpReward: 100,
        });
        moduleCount++; lessonCount++; quizCount += 2;
      }
    }

    console.log(`Seeded educational structure:`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Modules: ${moduleCount}`);
    console.log(`- Lessons: ${lessonCount}`);
    console.log(`- Quiz Questions: ${quizCount}`);

    console.log('Database seeding successfully finished!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
