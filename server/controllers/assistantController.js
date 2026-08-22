const FinancialProfile = require('../models/FinancialProfile');
const Portfolio = require('../models/Portfolio');
const Goal = require('../models/Goal');

/**
 * Helper to generate response based on user message and their financial data
 */
const generateAdvisorResponse = (message, name, profile, portfolio, goals) => {
  const msg = message.toLowerCase();
  
  // 1. GREETINGS & INTRO
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('help') || msg.includes('who are you') || msg.includes('introduce')) {
    return `Hello ${name}! I am your **FinAura AI Financial Advisor**.\n\nI have analyzed your profile, active goals, and virtual portfolio. You can ask me questions about:\n\n* **Your Portfolio:** "How is my portfolio allocation?" or "What is my net worth?"\n* **Budgeting & Savings:** "Am I saving enough?" or "How should I budget my income?"\n* **Financial Goals:** "Review my financial goals" or "Am I on track?"\n* **Financial Concepts:** "Explain compound interest," "What is inflation?", "How do mutual funds work?" or "What is asset allocation?"\n\nHow can I help you make informed financial decisions today?`;
  }

  // 2. PORTFOLIO & INVESTMENTS QUERY
  if (msg.includes('portfolio') || msg.includes('holding') || msg.includes('invest') || msg.includes('asset') || msg.includes('net worth') || msg.includes('worth') || msg.includes('balance') || msg.includes('stock') || msg.includes('fund')) {
    if (!portfolio) {
      return `I couldn't locate a virtual portfolio for you yet. Please go to the **Explore (Sandbox)** tab to initialize your portfolio with ₹1,00,000 in virtual trading capital!`;
    }

    const netWorth = portfolio.totalPortfolioValue || 100000;
    const cash = portfolio.balance || 0;
    const holdingsValue = portfolio.totalHoldingsValue || 0;
    const holdingsCount = portfolio.holdings?.length || 0;
    const gainLoss = portfolio.overallGainLoss || 0;
    const gainPercent = portfolio.overallGainLossPercent || 0;

    let response = `### 📈 Your Portfolio Analysis\n\n* **Total Net Worth:** ₹${netWorth.toLocaleString('en-IN')}\n* **Cash Balance:** ₹${cash.toLocaleString('en-IN')} (${Math.round((cash / netWorth) * 100)}%)\n* **Invested Value:** ₹${holdingsValue.toLocaleString('en-IN')} (${Math.round((holdingsValue / netWorth) * 100)}%)\n* **Total Holdings:** ${holdingsCount} asset class(es)\n* **Overall Returns:** ${gainLoss >= 0 ? '🟢 +' : '🔴 '}${gainPercent.toFixed(2)}% (₹${gainLoss.toLocaleString('en-IN')})\n\n`;

    if (holdingsCount > 0) {
      response += `**Current Assets:**\n`;
      portfolio.holdings.forEach(h => {
        const val = h.currentValue || 0;
        const alloc = Math.round((val / netWorth) * 100);
        response += `* **${h.asset.symbol}** (${h.asset.name}): ${h.quantity} units worth ₹${val.toLocaleString('en-IN')} (${alloc}% of portfolio)\n`;
      });
      response += `\n`;
    } else {
      response += `Your portfolio currently has no active holdings. All your capital is sitting in **Cash**.\n\n`;
    }

    // Advisory tips based on portfolio allocations
    const cashPercent = (cash / netWorth) * 100;
    if (cashPercent > 60) {
      response += `⚠️ **Advisory Tip:** You have a high cash allocation (**${Math.round(cashPercent)}%**). While cash provides security, its purchasing power is eroded over time by inflation. Consider allocating a portion to **Nifty 50 Index Funds** or stable corporate **Bonds** in the virtual sandbox to gain market practice.`;
    } else if (holdingsCount < 3 && holdingsCount > 0) {
      response += `⚠️ **Advisory Tip:** Your holdings are concentrated in only **${holdingsCount}** asset(s). True diversification means holding a mix of stocks, mutual funds, gold, and fixed deposits. Spreading your capital reduces risk. Consider looking at **Sovereign Gold Bonds (SGB)** or **SBI Fixed Deposits** to balance your equity exposure.`;
    } else {
      response += `✨ **Advisory Tip:** Your portfolio shows a healthy asset allocation and level of diversification. Remember to perform a rebalancing review once every six months to lock in profits or restore your target risk weights!`;
    }

    return response;
  }

  // 3. BUDGETING & BUDGET RULES QUERY
  if (msg.includes('budget') || msg.includes('save') || msg.includes('savings') || msg.includes('expense') || msg.includes('income') || msg.includes('spend') || msg.includes('salary') || msg.includes('cost')) {
    if (!profile || !profile.monthlyIncome) {
      return `To evaluate your budget, please complete the **Financial Confidence Assessment** on the dashboard. This records your income and expenses to customize your recommendations!`;
    }

    const income = profile.monthlyIncome || 0;
    const expenses = profile.monthlyExpenses || 0;
    const savings = profile.monthlySavings || 0;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

    // 50/30/20 calculations
    const targetNeeds = Math.round(income * 0.5);
    const targetWants = Math.round(income * 0.3);
    const targetSavings = Math.round(income * 0.2);

    let response = `### 📊 Monthly Budget & Cash Flow Analysis\n\n* **Monthly Net Income:** ₹${income.toLocaleString('en-IN')}\n* **Current Expenses:** ₹${expenses.toLocaleString('en-IN')}\n* **Current Monthly Savings:** ₹${savings.toLocaleString('en-IN')} (Savings Rate: **${savingsRate}%**)\n\n`;

    response += `**How you match the 50/30/20 Rule:**\n`;
    response += `* **Needs (Target ₹${targetNeeds.toLocaleString('en-IN')}):** Your actual expenses are ₹${expenses.toLocaleString('en-IN')}. If this includes lifestyle spending, remember to separate them!\n`;
    response += `* **Wants (Target ₹${targetWants.toLocaleString('en-IN')}):** Lifestyle expenses should be kept under 30% of your earnings to protect savings.\n`;
    response += `* **Savings Target:** ₹${targetSavings.toLocaleString('en-IN')} (20% limit). You are currently saving ₹${savings.toLocaleString('en-IN')}.\n\n`;

    if (savingsRate >= 20) {
      response += `🟢 **Advisory Tip:** Excellent! Your monthly savings rate is **${savingsRate}%**, which exceeds the recommended 20% savings rule. You have built a solid foundation. Make sure these savings are automated right after your salary is credited, dividing them into emergency reserves and long-term mutual fund SIPs.`;
    } else {
      response += `⚠️ **Advisory Tip:** Your current savings rate is **${savingsRate}%**, which falls short of the 20% target (₹${targetSavings.toLocaleString('en-IN')}). Try listing your lifestyle expenditures (wants) like subscription packages, dining out, and shopping, and see if you can defer or cancel some to free up cash.`;
    }

    return response;
  }

  // 4. FINANCIAL GOALS QUERY
  if (msg.includes('goal') || msg.includes('target') || msg.includes('planning') || msg.includes('timeline') || msg.includes('laptop') || msg.includes('bike') || msg.includes('college')) {
    if (!goals || goals.length === 0) {
      return `### 🎯 Goal Planning\n\nYou haven't created any financial goals yet! Setting a goal turns saving into a plan. \n\nGo to the **Plan (Goals)** page to create a target. A good starting goal is an **Emergency Fund** (3 months of essential expenditures) or a short-term goal (like a new laptop or study course).`;
    }

    let response = `### 🎯 Your Active Financial Goals\n\n`;
    
    let atRiskCount = 0;
    goals.forEach((g, idx) => {
      const progress = g.targetAmount ? (g.currentSavings / g.targetAmount) * 100 : 0;
      const expected = Math.min(100, Math.round((100 / Math.max(g.timeline, 1))));
      const isAtRisk = progress < expected * 0.5;
      if (isAtRisk) atRiskCount++;

      response += `${idx + 1}. **${g.name}** (${g.category})\n`;
      response += `   * Target: ₹${g.targetAmount.toLocaleString('en-IN')} over ${g.timeline} months\n`;
      response += `   * Savings: ₹${g.currentSavings.toLocaleString('en-IN')} (**${Math.round(progress)}%** complete)\n`;
      response += `   * Status: ${progress >= 100 ? '🟢 Completed' : isAtRisk ? '🔴 At Risk (Underfunded)' : '🔵 On Track'}\n\n`;
    });

    if (atRiskCount > 0) {
      response += `⚠️ **Advisory Tip:** You have **${atRiskCount}** goal(s) currently marked as underfunded or *At Risk*. Consider diverting a portion of your discretionary wants budget, or set up a recurring automated monthly SIP transfer to catch up on these timelines.`;
    } else {
      response += `🟢 **Advisory Tip:** All your goals are currently on track or completed! Keep up the disciplined monthly contributions. Ensure your emergency reserve is fully funded before accelerating savings to other long-term targets.`;
    }

    return response;
  }

  // 5. CONCEPT DEFINITIONS (SIP, Compounding, Inflation, Risk, etc.)
  if (msg.includes('compound') || msg.includes('compounding') || msg.includes('interest')) {
    return `### 🔄 What is Compound Interest?\n\n**Compound interest** is the process where the interest you earn on a deposit is added back to the principal, allowing you to earn interest on your interest in subsequent periods. This creates exponential growth over time.\n\n* **Example:** If you invest ₹10,000 at a 10% annual rate compounded annually:\n  * Year 1: You earn ₹1,000. Balance becomes ₹11,000.\n  * Year 2: You earn 10% of ₹11,000 = ₹1,100. Balance becomes ₹12,100.\n  * Over 30 years, ₹10,000 grows to **₹1,74,494** due to compounding, whereas simple interest only yields ₹40,000!\n\n**Rule of Thumb:** Start early. The longer your money sits compounding, the steeper the exponential wealth curve becomes!`;
  }

  if (msg.includes('inflation')) {
    return `### 💸 What is Inflation?\n\n**Inflation** is the rate at which general prices for goods and services rise, erodng the purchasing power of your money. If the annual inflation rate is 6%, a basket of items costing ₹100 today will cost ₹106 next year.\n\n* **The Locker Trap:** Keeping cash in a physical cupboard or drawer feels safe, but at 6% inflation, ₹1,00,000 cash will lose nearly **45%** of its purchasing power in 10 years.\n* **To beat inflation:** You must invest in assets that outpace inflation over the long term (like equity index funds or diversified mutual funds) rather than relying solely on low-interest savings accounts or traditional FDs.`;
  }

  if (msg.includes('sip') || msg.includes('systematic investment')) {
    return `### 📅 What is a SIP?\n\nA **Systematic Investment Plan (SIP)** is a method of investing a fixed sum of money at regular intervals (e.g. ₹2,000 on the 5th of every month) into a mutual fund scheme.\n\n**Key Advantages:**\n1. **Rupee-Cost Averaging:** You automatically buy more mutual fund units when market prices are low and fewer units when prices are high. This averages out your acquisition cost over time.\n2. **Discipline:** It automates your savings, removing the emotional stress of trying to time the market bottoms and peaks.\n3. **Flexibility:** You can start with as little as ₹100 or ₹500 per month, and pause or stop the SIP at any time with no penalties.`;
  }

  if (msg.includes('diversification') || msg.includes('diversify') || msg.includes('correlation')) {
    return `### 🛡️ What is Portfolio Diversification?\n\n**Diversification** means spreading your investments across uncorrelated asset classes (like stocks, debt bonds, gold, and cash) so that a crash in one asset doesn't wipe out your entire net worth. \n\n* **Asset Correlation:** Historically, gold and equities have a low or negative correlation. During stock market panics, gold often holds steady or rises, cushioning your portfolio.\n* **Diversification Checklist:** Avoid buying multiple shares in the same sector (e.g. holding 5 tech stocks is not true diversification). Aim for index funds, government bonds, and gold to construct a robust shield.`;
  }

  if (msg.includes('risk') || msg.includes('volatility')) {
    return `### ⚡ Understanding Risk and Volatility\n\nIn personal finance, **Risk** represents the uncertainty of returns. It is often measured as **volatility** (the size and frequency of short-term price swings).\n\n* **Risk Tolerance:** Your emotional capacity to handle portfolio drops without panic-selling.\n* **Risk Capacity:** Your financial ability to lose money based on your stable income, age, and emergency reserves.\n\n**Actionable Advice:** Never choose investments solely for high potential returns. If an asset's short-term fluctuations will make you sleepless, it exceeds your risk profile. Balance high-risk equities with low-risk fixed deposits or bonds.`;
  }

  // 6. DEFAULT FALLBACK
  return `I hear you, ${name}! That is a great question. While I'm evaluating the specific details of that topic, remember that sound financial decisions are built on:\n\n1. **Establishing an emergency fund** (3-6 months of essentials) before direct market investments.\n2. **Keeping costs low** (preferring direct mutual plans and passive index strategies).\n3. **Diversifying** across different assets (equities, bonds, gold, cash).\n4. **Remaining disciplined** rather than reacting to short-term market noise or social media tips.\n\nCould you clarify or ask me another question about your portfolio, budget goals, or compounding?`;
};

/**
 * AI assistant chat handler
 */
const chatWithAssistant = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Fetch user financial records for personalization
    const profile = await FinancialProfile.findOne({ userId });
    const portfolio = await Portfolio.findOne({ userId }).populate('holdings.asset');
    const goals = await Goal.find({ userId });
    const name = req.user.name || 'Learner';

    const reply = generateAdvisorResponse(message, name, profile, portfolio, goals);

    res.status(200).json({
      reply,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant
};
