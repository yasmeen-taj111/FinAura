const { GoogleGenerativeAI } = require('@google/generative-ai');
const FinancialProfile = require('../models/FinancialProfile');
const Portfolio = require('../models/Portfolio');
const Goal = require('../models/Goal');
const ConsolidatedPortfolio = require('../models/ConsolidatedPortfolio');

/**
 * Intelligent Fallback Advisor - Generates highly structured, realistic financial advice
 * when Gemini API keys are not configured or fail.
 */
const generateFallbackResponse = (message, name, profile, portfolio, consolidated, goals) => {
  const msg = message.toLowerCase();
  
  // Calculate numbers
  const income = profile?.monthlyIncome || 0;
  const expenses = profile?.monthlyExpenses || 0;
  const savings = profile?.monthlySavings || 0;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const scoreOverall = profile?.scores?.overall || 0;

  // Sandbox calculations
  const sandboxBalance = portfolio?.balance || 100000;
  const sandboxHoldings = portfolio?.holdings || [];
  const sandboxValue = sandboxHoldings.reduce((acc, h) => acc + (h.currentValue || h.quantity * (h.asset?.currentPrice || 0)), 0);
  const sandboxNet = sandboxBalance + sandboxValue;

  // Consolidated calculations
  const consolidatedHoldings = consolidated || [];
  const consolidatedValue = consolidatedHoldings.reduce((acc, h) => acc + (h.quantity * h.currentPrice), 0);
  const consolidatedInvested = consolidatedHoldings.reduce((acc, h) => acc + (h.quantity * h.averageBuyPrice), 0);
  const consolidatedGain = consolidatedValue - consolidatedInvested;
  const consolidatedRoi = consolidatedInvested > 0 ? (consolidatedGain / consolidatedInvested) * 100 : 0;

  // Combined Net Worth
  const totalNetWorth = sandboxNet + consolidatedValue;

  // 1. HYPE FACT-CHECKER (Countering social media hype)
  if (msg.includes('hype') || msg.includes('double') || msg.includes('moon') || msg.includes('tip') || msg.includes('buy') && (msg.includes('zomato') || msg.includes('suzlon') || msg.includes('stock') || msg.includes('crypto'))) {
    // Determine target entity from message
    let stockName = "Target Equity Ticker";
    if (msg.includes('zomato')) stockName = "ZOMATO LTD";
    else if (msg.includes('suzlon')) stockName = "SUZLON ENERGY";
    else if (msg.includes('yes bank')) stockName = "YES BANK";
    
    return `### 🔍 Social Media Hype Fact-Check: ${stockName}

You queried about a popular social media recommendation. Here is the data-driven validation:

| Metrics | Market Hype Claims | Data-Driven Reality |
| :--- | :--- | :--- |
| **Projected Return** | "100% gains in 1 month" | Average historical standard deviation suggests a monthly swing range of ±8-12%. |
| **PE Ratio Valuation** | High valuation ignored | Trading significantly above historical sector averages. Price incorporates future growth. |
| **Debt & Balance Sheet** | Promoted as debt-free turnaround | Verify leverage ratios and debt-to-equity targets before committing capital. |
| **Fact-Check Rating** | **🟢 Strong Buy (According to hype)** | **🔴 High Volatility / Valuation Mismatch** |

**Actionable Advice:**
First-time investors frequently lose capital by buying at peak price points during retail hype. Avoid putting more than **5% of your portfolio** into single momentum equities. Always prioritize diversified index mutual funds or debt instruments to anchor your wealth.`;
  }

  // 2. SIP RISK ANALYZER
  if (msg.includes('sip') || msg.includes('mutual fund') || msg.includes('small cap') || msg.includes('large cap') || msg.includes('risk')) {
    const riskScore = profile?.scores?.riskUnderstanding || 50;
    let riskRecommendation = "";

    if (riskScore < 50) {
      riskRecommendation = `⚠️ **Risk Mismatch Warning:** Your diagnostic risk understanding score is low (**${riskScore}/100**). High-volatility Small-Cap SIPs have maximum drawdown potentials exceeding 30% during corrections. I advise you to allocate **60% to Large-Cap/Index Mutual Funds**, **30% to Hybrid Funds**, and only **10% to Small-Cap Funds** to mitigate downside shocks.`;
    } else {
      riskRecommendation = `✨ **Risk Alignment:** Your risk profile is moderate-to-high (**${riskScore}/100**). You have room to maintain a growth-focused SIP, but ensure you keep at least 3-6 months of emergency expenses in a liquid fixed deposit before expanding equity SIP amounts.`;
    }

    return `### 📊 SIP Risk Analysis & Asset Allocation

A Systematic Investment Plan (SIP) is excellent for rupee-cost averaging, but risk varies significantly by category:

1. **Small-Cap Mutual Funds:** Extremely high growth potential, but high volatility. Max drawdown can exceed 35% in market drops. Recommended holding period: 7+ years.
2. **Nifty 50 Index Funds (Large-Cap):** Stable returns tracking India's top 50 companies. Low-cost expense ratio. Recommended for beginners.
3. **Debt Mutual Funds / Fixed Deposits:** Flat interest rates (6.5% - 7.5%). No market equity risk.

${riskRecommendation}

**Proposed Action Plan:**
- Automate your SIP to debited on the day after you receive income to enforce savings discipline.
- Do not check portfolio valuations daily. This avoids emotional panic selling.`;
  }

  // 3. PORTFOLIO CONSOLIDATION & NET WORTH REVIEW
  if (msg.includes('portfolio') || msg.includes('holding') || msg.includes('asset') || msg.includes('consolidated') || msg.includes('worth') || msg.includes('zerodha') || msg.includes('groww')) {
    let response = `### 📈 Consolidated Asset Portfolio Review

Here is the integrated view of your virtual sandbox and external broker platforms:

* **Integrated Net Worth:** ₹${totalNetWorth.toLocaleString('en-IN')}
* **Virtual Sandbox Funds:** ₹${sandboxNet.toLocaleString('en-IN')} (Cash: ₹${sandboxBalance.toLocaleString('en-IN')}, Holdings: ₹${sandboxValue.toLocaleString('en-IN')})
* **Consolidated External Portfolio:** ₹${consolidatedValue.toLocaleString('en-IN')} (Gain/Loss: ${consolidatedGain >= 0 ? '🟢 +' : '🔴 '}₹${consolidatedGain.toLocaleString('en-IN')} / ${consolidatedRoi.toFixed(2)}%)

`;

    if (consolidatedHoldings.length > 0) {
      response += `**Consolidated Broker Positions:**\n\n`;
      response += `| Asset | Platform | Type | Value (INR) | Returns (ROI) |\n`;
      response += `| :--- | :--- | :--- | :--- | :--- |\n`;
      consolidatedHoldings.forEach(h => {
        const val = h.quantity * h.currentPrice;
        const gain = val - (h.quantity * h.averageBuyPrice);
        const roi = (h.quantity * h.averageBuyPrice) > 0 ? (gain / (h.quantity * h.averageBuyPrice)) * 100 : 0;
        response += `| **${h.symbol}** (${h.name}) | ${h.platform} | ${h.assetType} | ₹${val.toLocaleString('en-IN')} | ${gain >= 0 ? '🟢 +' : '🔴 '}${roi.toFixed(1)}% |\n`;
      });
      response += `\n`;
    } else {
      response += `*No external broker holdings have been consolidated yet. Please use the CSV statement uploader or manual form in the "Asset Portfolio Logs" tab to link your external platforms (Zerodha, Groww).* \n\n`;
    }

    // Allocation tips
    const cashRatio = (sandboxBalance / totalNetWorth) * 100;
    if (cashRatio > 50) {
      response += `⚠️ **Asset Allocation Warning:** Your cash allocation represents **${Math.round(cashRatio)}%** of your total net worth. This is excessively high. Inflation is eroding your purchasing power. Consider deploying 25% of your cash reserves into debt funds or sovereign gold.`;
    } else {
      response += `🟢 **Asset Allocation Status:** Your portfolio has a healthy balance of cash and active investments. Review your allocations quarterly.`;
    }

    return response;
  }

  // 4. BUDGETING & INCOME ANALYSIS
  if (msg.includes('budget') || msg.includes('save') || msg.includes('expense') || msg.includes('income') || msg.includes('savings')) {
    if (income === 0) {
      return `To provide a personalized budget assessment, please complete the **Financial Confidence Assessment** on the dashboard to register your income and monthly expenses.`;
    }

    // 50/30/20 Rule compliance
    const targetNeeds = Math.round(income * 0.5);
    const targetWants = Math.round(income * 0.3);
    const targetSavings = Math.round(income * 0.2);

    return `### 📊 Cash Flow & Savings Audit

Here is your monthly cash flow analyzed against the standard **50/30/20 Budgeting Rule**:

* **Net Monthly Income:** ₹${income.toLocaleString('en-IN')}
* **Essential Spending:** ₹${expenses.toLocaleString('en-IN')} (Target: ₹${targetNeeds.toLocaleString('en-IN')})
* **Monthly Savings Rate:** ${savingsRate}% (Actual: ₹${savings.toLocaleString('en-IN')}, Target: ₹${targetSavings.toLocaleString('en-IN')})

**Recommendations based on your profile:**
1. Your actual expenses are ₹${expenses.toLocaleString('en-IN')}. If this exceeds your necessities, audit your lifestyle spending (dining out, streaming packages) to release cash.
2. ${savingsRate >= 20 
   ? `🟢 Your monthly savings rate is **${savingsRate}%**, which complies with the 20% savings rule. Excellent discipline! Keep automating these deposits.` 
   : `⚠️ Your savings rate is **${savingsRate}%**, failing the 20% target. You need to free up ₹${(targetSavings - savings).toLocaleString('en-IN')} per month to stay on track.`}
3. Ensure you have a **Liquid Emergency Fund** equal to ₹${(expenses * 3).toLocaleString('en-IN')} (3 months of necessities) before investing in high-risk equities.`;
  }

  // 5. GOAL PLANNING CHECK
  if (msg.includes('goal') || msg.includes('track') || msg.includes('laptop') || msg.includes('bike') || msg.includes('car')) {
    if (!goals || goals.length === 0) {
      return `### 🎯 Financial Goal Tracking

You have not set any active financial goals. Goals convert standard saving habits into structured outcomes. 

Go to the **Plan (Goals)** tab to create your first goal. I recommend configuring an **Emergency Fund Goal** equal to 3 months of essential expenditures first.`;
    }

    let response = `### 🎯 Active Financial Goals Status Review\n\n`;
    let atRisk = false;

    goals.forEach((g, idx) => {
      const progress = g.targetAmount ? (g.currentSavings / g.targetAmount) * 100 : 0;
      const progressRatio = progress / 100;
      const timelineRatio = 1 / Math.max(g.timeline, 1);
      const isBehind = progressRatio < timelineRatio * 0.5;
      if (isBehind) atRisk = true;

      response += `${idx + 1}. **${g.name}** (${g.category})\n`;
      response += `   * Target: ₹${g.targetAmount.toLocaleString('en-IN')} over ${g.timeline} months\n`;
      response += `   * Current savings: ₹${g.currentSavings.toLocaleString('en-IN')} (**${Math.round(progress)}%** complete)\n`;
      response += `   * Status: ${progress >= 100 ? '🟢 Completed' : isBehind ? '🔴 Behind Timeline' : '🔵 On Track'}\n\n`;
    });

    if (atRisk) {
      response += `⚠️ **Advisory Action Required:** One or more of your active goals are behind their savings timelines. Consider cutting discretionary spending or setting up a recurring weekly investment to catch up.`;
    } else {
      response += `🟢 **Advisory Action Status:** All goals are currently on track. Ensure your savings are split across dedicated bank accounts or mutual funds mapped directly to these individual targets.`;
    }

    return response;
  }

  // 6. DEFAULT ADVICE
  return `Hello ${name}! I am your **FinAura AI Wealth Advisor**. I have consolidated your profile data, active goals, sandbox operations, and external broker holdings.

How can I help you optimize your wealth today? You can choose one of the preset prompts or ask questions about:
- **Portfolio Consolidation:** "Explain my asset allocation" or "Review my consolidated holdings."
- **SIP Risk Analyzer:** "What are the risks of a small-cap mutual fund?" or "Explain SIP compounding."
- **Hype Auditor:** "Is yes bank stock good to buy?" or "Verify social media stock tip."
- **Cash Flow Audit:** "Am I saving enough?" or "Analyze my monthly budget."`;
};

/**
 * AI assistant chat handler - routes queries to Google Gemini API
 * and falls back gracefully to local analysis when needed.
 */
const chatWithAssistant = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Fetch complete user financial records for contextual prompt engineering
    const [profile, portfolio, goals, consolidated] = await Promise.all([
      FinancialProfile.findOne({ userId }),
      Portfolio.findOne({ userId }).populate('holdings.asset'),
      Goal.find({ userId }),
      ConsolidatedPortfolio.find({ userId }).lean()
    ]);

    const name = req.user.name || 'Learner';
    const isMockKey = !process.env.AI_API_KEY || process.env.AI_API_KEY === 'mock_key';

    if (isMockKey) {
      // Return high-quality structured simulator response directly
      const reply = generateFallbackResponse(message, name, profile, portfolio, consolidated, goals);
      return res.status(200).json({
        reply,
        timestamp: new Date()
      });
    }

    // Integrate real Google Gemini
    try {
      const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
      // Use gemini-1.5-flash for speed and efficiency in chat
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Compile user context
      const savingsRate = profile?.monthlyIncome > 0 
        ? Math.round((profile.monthlySavings / profile.monthlyIncome) * 100) 
        : 0;

      const goalsText = goals.length > 0
        ? goals.map((g, idx) => `${idx+1}. Goal Name: ${g.name}, Target: ₹${g.targetAmount}, Current: ₹${g.currentSavings}, Timeline: ${g.timeline} months, Category: ${g.category}`).join('\n')
        : 'No active goals configured.';

      const sandboxHoldingsText = portfolio?.holdings?.length > 0
        ? portfolio.holdings.map(h => `- Symbol: ${h.asset?.symbol}, Units: ${h.quantity}, Avg Cost: ₹${h.averageBuyPrice}, Current Price: ₹${h.asset?.currentPrice}`).join('\n')
        : 'No sandbox holdings (only cash).';

      const consolidatedText = consolidated.length > 0
        ? consolidated.map(c => `- Symbol: ${c.symbol} (${c.name}), Platform: ${c.platform}, Asset Type: ${c.assetType}, Units: ${c.quantity}, Avg Cost: ₹${c.averageBuyPrice}, Current Price: ₹${c.currentPrice}`).join('\n')
        : 'No consolidated external broker holdings.';

      const systemPrompt = `You are FinAura's Elite AI Wealth Advisor, an expert digital financial assistant configured for Indian retail investors (students and professionals). 
Your objective is to turn complex market statistics and user budget records into clear, personalized, data-driven, and actionable advice.
Maintain a professional, objective, yet highly encouraging financial planner tone. Avoid generic filler.
CRITICAL DESIGN RULE: Do NOT use excessive emojis. Emojis make your outputs look automated/AI-generated. Use a maximum of 2-3 emojis in the entire response, only to draw attention to critical alerts (e.g. ⚠️ for risk mismatch, 🔴 for high risk, 🟢 for healthy metrics).

User Details:
- Name: ${name}
- Diagnostic Confidence Scores (out of 100):
  * Overall: ${profile?.scores?.overall || 'Not completed'}
  * Money Management: ${profile?.scores?.moneyManagement || 0}
  * Investing Knowledge: ${profile?.scores?.investingKnowledge || 0}
  * Risk Understanding: ${profile?.scores?.riskUnderstanding || 0}
  * Goal Planning: ${profile?.scores?.goalPlanning || 0}
  * Financial Behavior: ${profile?.scores?.financialBehavior || 0}
- Net Monthly Income: ₹${profile?.monthlyIncome || 0}
- Essential Expenses: ₹${profile?.monthlyExpenses || 0}
- Monthly Savings: ₹${profile?.monthlySavings || 0} (Actual Savings Rate: ${savingsRate}%)

Active Goals:
${goalsText}

Virtual Sandbox Holdings (₹100,000 Starting Cash):
${sandboxHoldingsText}

Consolidated Broker Portfolio (External accounts like Zerodha, Groww):
${consolidatedText}

Instruction Guidelines:
1. **Portfolio and Net Worth Audit**: If the user asks about their portfolio, holdings, asset allocation, or net worth, provide a consolidated analysis integrating both sandbox and external positions. Calculate asset class breakdowns (Equity, Mutual Funds, Gold, Cash) and suggest diversifications where needed.
2. **SIP Risk Analysis**: Address the common student issue of beginning SIPs without understanding risk. If mutual funds/SIPs are discussed, highlight risk volatility, standard deviations, and maximum drawdown cycles. Check if their selected assets align with their "Risk Understanding" score.
3. **Social Media Hype Validation**: If the user asks about a stock recommendation, social media tip, or hype news, act as a fact-checker. Provide fundamental valuation checks (e.g., high PE ratio, debt-to-equity risk) and rate it clearly (e.g. "Hype Mismatch Risk" or "Fundamentally Stable").
4. **Rich Markdown Output**: Render lists, bullet points, headers, and clean tables for data comparisons. Make sure the outputs are clear, concise, and structured. Do not use markdown features like blockquotes or checkboxes.

Now, answer the user's query: "${message}"`;

      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();

      res.status(200).json({
        reply: text,
        timestamp: new Date()
      });

    } catch (apiError) {
      console.error('Gemini API call failed, falling back to local advisor:', apiError);
      const reply = generateFallbackResponse(message, name, profile, portfolio, consolidated, goals);
      res.status(200).json({
        reply,
        timestamp: new Date()
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant
};
