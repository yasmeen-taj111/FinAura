require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const detailedContent = require('./detailedContent');

// Safe curriculum migration: it only inserts missing FinAura curriculum records.
// It never deletes users, progress, portfolios, or existing courses.
const tracks = [
  ['Saving, Banking & Debt Foundations', 'Saving', 'Beginner', [
    ['Bank accounts, UPI & cash flow', 'Understand savings accounts, recurring deposits, fixed deposits, UPI safety and cash-flow tracking. Income is money received; expenses are money spent; a budget gives every rupee a job.'],
    ['Credit cards, loans & EMIs', 'Learn principal, interest, tenure, credit utilisation and EMI amortisation. A lower EMI can still cost more overall if the loan runs for longer.'],
    ['Emergency funds & insurance', 'Keep emergency money separate from investments. Learn why health cover, term insurance and policy exclusions deserve careful reading.'],
  ]],
  ['Stocks, Equity & How Markets Work', 'Stocks', 'Beginner', [
    ['Equity, shares & ownership', 'A share is fractional ownership in a company. Equity holders may benefit from growth and dividends, but they also bear market and business risk.'],
    ['Exchanges, demat & orders', 'Learn the roles of brokers, depositories, NSE/BSE, demat accounts, market orders, limit orders, settlement and transaction costs.'],
    ['Market cap: large, mid & small cap', 'Market cap is share price multiplied by shares outstanding. Large-caps are generally more established; mid- and small-caps can be less liquid and more volatile.'],
  ]],
  ['Mutual Funds, ETFs & SIPs', 'Mutual Funds', 'Beginner', [
    ['How mutual funds work', 'A mutual fund pools investor money according to a stated mandate. Learn NAV, units, expense ratio, benchmark, direct plans and regular plans.'],
    ['Equity, debt, hybrid & index funds', 'Compare equity, debt, hybrid, index funds and ETFs by their underlying assets, liquidity, costs, risks and intended role.'],
    ['SIPs, lumpsums & review discipline', 'A SIP is a regular contribution method, not a guaranteed-return product. Learn rupee-cost averaging, step-ups, reviews and goal alignment.'],
  ]],
  ['Portfolio Construction & Asset Allocation', 'Financial Planning', 'Intermediate', [
    ['Assets, liabilities & net worth', 'Build a personal balance sheet. Assets are things you own; liabilities are obligations you owe; net worth is assets minus liabilities.'],
    ['Diversification & correlation', 'Diversification spreads exposure across asset classes and risk drivers. Holding many similar stocks is not the same as true diversification.'],
    ['Goal-based allocation', 'Match each investment decision to time horizon, liquidity needs, risk capacity and goal importance. Short-term money usually needs more stability.'],
  ]],
  ['Reading Markets: Charts & Candlesticks', 'Technical Analysis', 'Intermediate', [
    ['OHLC, line charts & candlesticks', 'OHLC means open, high, low and close. Candlesticks describe historical price action for a timeframe; a pattern is context, not a prediction or recommendation.'],
    ['Trends, support, resistance & volume', 'Explore trends, ranges, support, resistance and volume. Use them to understand market context and risk, never as a standalone certainty.'],
    ['Moving averages & indicators', 'Moving averages smooth historical prices but lag. SMA and EMA, RSI and MACD are analytical tools with false signals and limits.'],
  ]],
  ['Fundamental Analysis & Company Research', 'Markets', 'Intermediate', [
    ['Business model & competitive position', 'Research what a company sells, its customers, management, competitors and the risks to future cash flows before looking at a stock price.'],
    ['Financial statements', 'Read income statement, balance sheet and cash-flow statement together. Revenue growth is incomplete without profitability, debt and cash generation.'],
    ['Valuation metrics & limits', 'Understand EPS, P/E, ROE, debt-to-equity and free cash flow as context tools. No single ratio tells you whether a share is suitable.'],
  ]],
  ['Taxes, Compliance & Investor Protection', 'Tax Basics', 'Intermediate', [
    ['Tax documents & basic terms', 'Learn PAN, Form 16, AIS, TDS and the difference between financial and assessment years. Keep records and verify current rules before filing.'],
    ['Investment taxes & records', 'Capital-gains treatment can depend on asset type and holding period. Keep transaction records and get professional help for personal tax decisions.'],
    ['KYC, nominations & fraud prevention', 'Learn KYC, nominations, two-factor authentication, phishing red flags and why you should verify regulated entities before acting.'],
  ]],
  ['Long-Term Financial Independence', 'Retirement', 'Advanced', [
    ['Retirement math & inflation', 'Estimate future expenses using inflation and distinguish nominal from real return. Retirement plans need regular review because life and markets change.'],
    ['EPF, NPS & retirement buckets', 'Learn the role of employer benefits, voluntary retirement contributions, liquidity needs and lock-ins. Check current rules before committing.'],
    ['Behaviour, reviews & a written plan', 'Review goals, protection, allocation, nominations and contribution levels annually. Avoid reacting to market noise and treating past returns as forecasts.'],
  ]],
];

const sync = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finaura');
  let inserted = 0;
  for (const [title, category, difficulty, modules] of tracks) {
    const course = await Course.findOneAndUpdate({ title }, { $setOnInsert: { title, category, difficulty, description: `In-depth, practical financial education: ${title}.`, xpReward: 450 } }, { upsert: true, new: true });
    for (let index = 0; index < modules.length; index += 1) {
      const [moduleTitle, content] = modules[index];
      const module = await Module.findOneAndUpdate({ courseId: course._id, title: moduleTitle }, { $setOnInsert: { courseId: course._id, title: moduleTitle, description: content, order: index + 1 } }, { upsert: true, new: true });
      const lesson = await Lesson.findOneAndUpdate({ moduleId: module._id, title: moduleTitle }, { $setOnInsert: { moduleId: module._id, title: moduleTitle, content: detailedContent[moduleTitle] || `${content}\n\nLearn: define the terms. See: use a published factsheet, annual report or a simulated FinAura example. Try: test the idea with virtual money or the planner before committing real money. Every investment has risk; education is not personal investment advice.`, order: 1, xpReward: 75, videoUrl: category === 'Technical Analysis' ? 'https://zerodha.com/varsity/module/technical-analysis/' : 'https://investor.sebi.gov.in/inv_aware_edu_videos.html', videoTitle: `${title} companion videos`, durationMinutes: 12 } }, { upsert: true, new: true });
      const quiz = await Quiz.findOne({ lessonId: lesson._id });
      if (!quiz) {
        await Quiz.create({ lessonId: lesson._id, passingScore: 70, xpReward: 100, questions: [
          { question: `What is the responsible way to use the concept “${moduleTitle}”?`, options: ['As a guaranteed trading signal', 'As one input alongside goals, risk and verified information', 'By copying a social-media tip', 'By investing emergency money'], correctAnswer: 'As one input alongside goals, risk and verified information', explanation: 'Financial concepts help you analyse decisions; they do not guarantee outcomes or replace suitability checks.' },
          { question: 'Which statement is most accurate?', options: ['Historical returns guarantee future returns', 'Financial education should consider costs, risk and time horizon', 'All assets have the same risk', 'A chart pattern removes uncertainty'], correctAnswer: 'Financial education should consider costs, risk and time horizon', explanation: 'A sound plan considers your circumstances, risk, costs and uncertainty.' },
        ] });
      }
      inserted += 1;
    }
  }
  console.log(`Curriculum sync complete: checked ${inserted} lessons without deleting existing data.`);
  await mongoose.connection.close();
};

sync().catch(async (error) => { console.error(error); await mongoose.connection.close(); process.exit(1); });
