/**
 * Detailed educational content dictionary for FinAura learning modules.
 * This file contains rich HTML content for all lessons to satisfy the requirement
 * that all modules have detailed, professional information.
 */

const detailedContent = {
  // Course 1: Money Basics & Budgeting
  'Needs vs Wants': `
    <h3>Understanding Cash Flow: Needs vs. Wants</h3>
    <p>Every successful financial journey begins with visibility. Before you can invest or compound wealth, you must understand where your money goes. One of the most fundamental distinctions is separating your outflows into <strong>Needs</strong> and <strong>Wants</strong>.</p>
    
    <div class="my-5 p-4 bg-emerald-50 border border-brand-border rounded-xl">
      <h4 class="font-bold text-brand-primary text-sm uppercase">The Definitive Test</h4>
      <p class="text-xs mt-1">If you can postpone an expense for a month or two without immediately threatening your health, shelter, safety, or core livelihood, it is a <strong>Want</strong>. If it is essential for survival or basic functioning, it is a <strong>Need</strong>.</p>
    </div>

    <h4>Key Categories</h4>
    <ul>
      <li><strong>Needs:</strong> Basic groceries, rent/mortgage, utility bills (electricity, water, basic internet), minimum debt payments, healthcare, insurance premiums.</li>
      <li><strong>Wants:</strong> Dining out, subscription services (Netflix, Spotify), premium designer clothes, leisure travel, upgrade purchases (e.g., buying a new phone when the current one works fine).</li>
    </ul>

    <h4>Action Plan: The 48-Hour Rule</h4>
    <p>To reduce impulsive lifestyle spending, implement the <strong>48-Hour Rule</strong>: when you want to buy a non-essential item, wait 48 hours. If the urge to buy is still strong and it fits within your monthly budget, proceed. Often, you will find the desire has faded.</p>
  `,

  'The 50/30/20 Rule': `
    <h3>Implementing the 50/30/20 Budgeting Rule</h3>
    <p>A budget is not about restricting your freedom; it is about giving every rupee a job before the month starts. Popularized by Senator Elizabeth Warren, the <strong>50/30/20 Rule</strong> is an intuitive framework for tracking allocations.</p>

    <table class="w-full my-5 border-collapse text-xs">
      <thead>
        <tr class="bg-brand-light text-brand-primary">
          <th class="border border-brand-border p-2 text-left">Percentage</th>
          <th class="border border-brand-border p-2 text-left">Category</th>
          <th class="border border-brand-border p-2 text-left">Typical Items Included</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border border-brand-border p-2 font-bold">50%</td>
          <td class="border border-brand-border p-2">Essential Needs</td>
          <td class="border border-brand-border p-2">Rent, utilities, groceries, medicines, transport.</td>
        </tr>
        <tr class="bg-brand-bg/30">
          <td class="border border-brand-border p-2 font-bold">30%</td>
          <td class="border border-brand-border p-2">Lifestyle Wants</td>
          <td class="border border-brand-border p-2">Gym, subscriptions, hobbies, shopping, dining out.</td>
        </tr>
        <tr>
          <td class="border border-brand-border p-2 font-bold">20%</td>
          <td class="border border-brand-border p-2">Savings & Investments</td>
          <td class="border border-brand-border p-2">Emergency fund deposits, mutual funds, SIPs, debt prepayments.</td>
        </tr>
      </tbody>
    </table>

    <h4>Applying the Rule in India</h4>
    <p>If your monthly net salary is ₹50,000:</p>
    <ul>
      <li><strong>₹25,000 (50%)</strong> goes to essentials. If your essentials cost less than this, you can allocate the remainder to savings.</li>
      <li><strong>₹15,000 (30%)</strong> goes to lifestyle choices. Be disciplined here; if you exceed it, cut back on wants, not savings.</li>
      <li><strong>₹10,000 (20%)</strong> goes directly to your financial goals. Best practice is to automate this transfer right after salary credit.</li>
    </ul>
  `,

  'Setting Up Emergency Funds': `
    <h3>The Emergency Fund: Your Financial Shield</h3>
    <p>Before you invest a single rupee in the stock market or buy a mutual fund, you must establish an <strong>Emergency Fund</strong>. Investing without an emergency reserve is highly risky; if you face an unexpected expense, you might be forced to sell assets at a loss.</p>

    <div class="my-5 p-4 bg-amber-50 border border-brand-warning/30 rounded-xl">
      <h4 class="font-bold text-brand-warning text-sm uppercase">Why It Comes First</h4>
      <p class="text-xs mt-1">Markets fluctuate. If the market drops 20% and you have a medical emergency, selling your stocks to pay the hospital bill locks in a permanent capital loss. An emergency fund keeps your long-term investments safe from short-term panic.</p>
    </div>

    <h4>Structure & Size</h4>
    <p>An emergency fund should cover <strong>3 to 6 months of essential living expenses</strong>. If your monthly essential needs cost ₹20,000, your target fund size is between ₹60,000 and ₹1,20,000.</p>
    
    <h4>Where to Keep It?</h4>
    <p>Safety and liquidity are far more important than returns for this fund. Recommended vehicles include:</p>
    <ul>
      <li>High-interest savings accounts with instant withdrawal.</li>
      <li>Bank Fixed Deposits (FDs) with zero or low premature withdrawal penalties.</li>
      <li>Liquid Mutual Funds that offer instant redemption facilities (up to ₹50,000 or 90% of portfolio within minutes).</li>
    </ul>
  `,

  // Course 2: Compounding & Saving
  'Simple vs Compound Interest': `
    <h3>Simple vs. Compound Interest: The Math of Wealth</h3>
    <p>Compound interest is the mechanism that turns small regular contributions into significant nest eggs. Albert Einstein famously called it the "eighth wonder of the world." Let's look at how it compares to simple interest.</p>

    <h4>The Formulas</h4>
    <ul>
      <li><strong>Simple Interest (SI):</strong> Earned only on the initial principal. <br/><code>Interest = Principal × Rate × Time</code></li>
      <li><strong>Compound Interest (CI):</strong> Earned on the principal AND the accumulated interest of prior periods. <br/><code>Amount = Principal × (1 + Rate / Compounding Frequency) ^ (Frequency × Time)</code></li>
    </ul>

    <div class="my-5 p-4 bg-emerald-50 border border-brand-border rounded-xl">
      <h4 class="font-bold text-brand-primary text-sm uppercase">The Power of Time</h4>
      <p class="text-xs mt-1">If you invest ₹10,000 at a 10% annual rate:
      <br/>• Under SI, you earn ₹1,000 every year. After 10 years, your total is ₹20,000.
      <br/>• Under CI, you earn ₹1,000 in Year 1. In Year 2, you earn 10% of ₹11,000 = ₹1,100. After 10 years, your total is ₹25,937.
      <br/>• After 30 years, simple interest yields ₹40,000, whereas compounding yields ₹1,74,494!</p>
    </div>

    <h4>Compounding Frequency</h4>
    <p>The more frequently interest is compounded (daily, monthly, quarterly, or annually), the faster your money grows. Most savings accounts compound quarterly, while credit card debt compounds daily, making it compound against you extremely fast.</p>
  `,

  'The Cost of Delay': `
    <h3>The Cost of Delay: Why Starting Early Matters</h3>
    <p>The single most valuable asset an investor has is not capital, but <strong>time</strong>. Because compound growth is exponential, the final years of an investment journey experience the most massive absolute gains. Starting just a few years late can cut your final wealth in half.</p>

    <h4>A Tale of Two Investors (Assume 12% Annual Growth)</h4>
    <ul>
      <li><strong>Investor A (Starts at 22):</strong> Invests ₹5,000 per month. They stop contributing at age 32 (investing for 10 years, total invested: ₹6,00,000). They let the money grow until age 60 without adding a single rupee.
      <br/><strong>Final Value at Age 60: ₹2.2 Crores!</strong></li>
      <li><strong>Investor B (Starts at 32):</strong> Invests ₹5,000 per month and continues contributing every single month until age 60 (investing for 28 years, total invested: ₹16,80,000).
      <br/><strong>Final Value at Age 60: ₹1.4 Crores!</strong></li>
    </ul>

    <p>Even though Investor B invested nearly three times more capital than Investor A, their final nest egg was significantly smaller because Investor A's money had an extra 10 years to compound in the background.</p>

    <div class="my-5 p-4 bg-amber-50 border border-brand-warning/30 rounded-xl">
      <h4 class="font-bold text-brand-warning text-sm uppercase">Key Lesson</h4>
      <p class="text-xs mt-1">Start small immediately rather than waiting to start big later. A monthly SIP of ₹1,000 started at age 20 is worth more than a ₹3,000 monthly SIP started at age 30.</p>
    </div>
  `,

  'Inflation: The Silent Money Eater': `
    <h3>Inflation: Erasing Your Purchasing Power</h3>
    <p><strong>Inflation</strong> is the rate at which the general level of prices for goods and services rises, eroding the purchasing power of your cash. If the annual inflation rate is 6%, a basket of goods costing ₹100 today will cost ₹106 next year. That means ₹100 cash in your drawer becomes worth less in terms of what it can buy.</p>

    <h4>Real Return vs. Nominal Return</h4>
    <p>When evaluating investments, always calculate the <strong>Real Rate of Return</strong>, which is the nominal interest rate minus the inflation rate.</p>
    <ul>
      <li><strong>Nominal Return:</strong> The interest rate printed on your certificate (e.g., Bank FD yielding 6.5%).</li>
      <li><strong>Real Return:</strong> Your actual purchasing-power growth after accounting for inflation (e.g., if inflation is 6%, your real return is 6.5% - 6% = <strong>0.5%</strong>).</li>
    </ul>

    <div class="my-5 p-4 bg-red-50 border border-brand-danger/20 rounded-xl">
      <h4 class="font-bold text-brand-danger text-sm uppercase">The Cash Locker Trap</h4>
      <p class="text-xs mt-1">Keeping ₹1,00,000 cash in a safe locker for 10 years feels "safe" because you see the same amount. However, at a 6% inflation rate, that ₹1,00,000 will only buy what ₹55,800 buys today. You have lost nearly 45% of your wealth to the silent erosion of inflation.</p>
    </div>

    <h4>Beating Inflation</h4>
    <p>To beat inflation over the long term, you must allocate a portion of your savings to assets that historically outpace inflation, such as equities, equity mutual funds, and real estate, while accepting that these assets fluctuate in the short term.</p>
  `,

  // Course 3: Introduction to Investing
  'Equity: Owning a Slice of Business': `
    <h3>Equity Investing: How the Stock Market Works</h3>
    <p>When you purchase a share of a company, you are not simply buying a ticker symbol or a digital line on a screen—you are buying a <strong>fractional ownership slice of a live business enterprise</strong>. You share in its profits, assets, and future growth, but you also share in its business failures and risks.</p>

    <h4>Primary vs. Secondary Markets</h4>
    <ul>
      <li><strong>Primary Market (IPO):</strong> A company issues new shares to raise capital from investors. The money goes directly to the company to fund expansion, pay off debt, or let early founders cash out.</li>
      <li><strong>Secondary Market (Exchanges):</strong> Investors buy and sell existing shares to each other on stock exchanges like NSE (National Stock Exchange) or BSE (Bombay Stock Exchange). No new money flows to the company.</li>
    </ul>

    <h4>Ways Investors Earn Returns</h4>
    <p>Equity investors benefit in two ways:</p>
    <ol>
      <li><strong>Capital Gains:</strong> The price of the stock increases over time as the underlying business increases its profits and value.</li>
      <li><strong>Dividends:</strong> A portion of the company’s current cash earnings distributed directly to shareholders.</li>
    </ol>
  `,

  'Mutual Funds & SIPs': `
    <h3>Demystifying Mutual Funds and SIPs</h3>
    <p>A <strong>Mutual Fund</strong> is an investment vehicle that pools money from thousands of individual investors to purchase a diversified portfolio of securities (stocks, bonds, gold, etc.) managed by professional Fund Managers. Each investor owns units that represent a portion of the total pool.</p>

    <h4>Key Terms to Know</h4>
    <ul>
      <li><strong>NAV (Net Asset Value):</strong> The market value of one unit of the mutual fund scheme, calculated daily after market hours.</li>
      <li><strong>Expense Ratio:</strong> The annual management fee charged by the Asset Management Company (AMC) to run the fund. Expressed as a percentage (typically 0.1% to 2.2%). A lower expense ratio is generally better for long-term returns.</li>
      <li><strong>Direct vs. Regular Plans:</strong> Direct plans are purchased directly from the AMC (no distributor commissions), while Regular plans include a broker/distributor commission, which raises the expense ratio and reduces long-term returns.</li>
    </ul>

    <h4>What is a SIP?</h4>
    <p>A <strong>Systematic Investment Plan (SIP)</strong> is not an investment product itself; it is a automated payment method. It automatically invests a fixed sum of money on a scheduled date (e.g., the 5th of every month) into a chosen mutual fund. SIPs enable <strong>rupee-cost averaging</strong>, meaning you automatically buy more units when prices are low and fewer units when prices are high.</p>
  `,

  'Traditional vs Modern Assets': `
    <h3>Asset Classes: Comparing FDs, Gold, Bonds, and Equities</h3>
    <p>Different asset classes serve different purposes. A balanced portfolio allocates money based on time horizon and risk tolerance. Let's compare the most common options in India.</p>

    <table class="w-full my-5 border-collapse text-xs">
      <thead>
        <tr class="bg-brand-light text-brand-primary">
          <th class="border border-brand-border p-2 text-left">Asset Type</th>
          <th class="border border-brand-border p-2 text-left">Risk Level</th>
          <th class="border border-brand-border p-2 text-left">Historical Return Range</th>
          <th class="border border-brand-border p-2 text-left">Best Suited For</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border border-brand-border p-2 font-bold">Fixed Deposits (FD)</td>
          <td class="border border-brand-border p-2 text-brand-success">Very Low</td>
          <td class="border border-brand-border p-2">5% - 7.5%</td>
          <td class="border border-brand-border p-2">Short-term liquidity, capital safety.</td>
        </tr>
        <tr class="bg-brand-bg/30">
          <td class="border border-brand-border p-2 font-bold">Bonds / Debt Securities</td>
          <td class="border border-brand-border p-2">Low to Moderate</td>
          <td class="border border-brand-border p-2">6% - 9%</td>
          <td class="border border-brand-border p-2">Steady periodic interest income.</td>
        </tr>
        <tr>
          <td class="border border-brand-border p-2 font-bold">Gold (Physical/SGB)</td>
          <td class="border border-brand-border p-2">Moderate</td>
          <td class="border border-brand-border p-2">8% - 10%</td>
          <td class="border border-brand-border p-2">Inflation hedge, market crisis buffer.</td>
        </tr>
        <tr class="bg-brand-bg/30">
          <td class="border border-brand-border p-2 font-bold">Equities (Stocks/MFs)</td>
          <td class="border border-brand-border p-2 text-brand-danger">High</td>
          <td class="border border-brand-border p-2 font-bold">11% - 15% (Long-Term)</td>
          <td class="border border-brand-border p-2">Long-term wealth building (>5 years).</td>
        </tr>
      </tbody>
    </table>

    <div class="my-5 p-4 bg-emerald-50 border border-brand-border rounded-xl">
      <h4 class="font-bold text-brand-primary text-sm uppercase">Sovereign Gold Bonds (SGBs)</h4>
      <p class="text-xs mt-1">SGBs are government-backed securities denominated in grams of gold. They offer a safer alternative to physical gold, pay a fixed annual interest (typically 2.5%), and are exempt from capital gains tax if held to maturity (8 years).</p>
    </div>
  `,

  // Course 4: Risk & Portfolio Diversification
  'What is Investment Risk?': `
    <h3>Understanding Risk and Volatility</h3>
    <p>Many beginners think risk is simply "the chance that I lose all my money." While that is ultimate risk, in financial markets, risk is more accurately measured as <strong>volatility</strong> (the speed and scale of price fluctuations). Understanding volatility helps you stay calm during market corrections.</p>

    <h4>Key Risk Types</h4>
    <ul>
      <li><strong>Market Risk (Systematic):</strong> The risk that the entire market declines due to macroeconomic events (recessions, geopolitical events). This risk cannot be diversified away.</li>
      <li><strong>Business Risk (Unsystematic):</strong> The risk that a specific company performs poorly due to bad management, competition, or operational failure. This risk CAN be minimized by diversification.</li>
      <li><strong>Credit Risk:</strong> The risk that a bond issuer defaults on interest or principal repayments. Relevant for corporate debt funds.</li>
      <li><strong>Liquidity Risk:</strong> The risk that you cannot sell an asset quickly at its fair market price. E.g., physical real estate often has high liquidity risk.</li>
    </ul>
  `,

  'The Diversification shield': `
    <h3>Portfolio Diversification: Mitigating Unsystematic Risk</h3>
    <p>The oldest rule in investing is "don't put all your eggs in one basket." <strong>Diversification</strong> is the process of spreading your capital across different assets, sectors, and asset classes that are not highly correlated. If one asset performs poorly, other assets balance it out.</p>

    <div class="my-5 p-4 bg-emerald-50 border border-brand-border rounded-xl">
      <h4 class="font-bold text-brand-primary text-sm uppercase">Asset Correlation Explained</h4>
      <p class="text-xs mt-1">Correlation measures how two assets move in relation to each other.
      <br/>• <strong>Positive correlation (+1.0):</strong> Two assets move in the same direction. E.g., buying 5 different technology stocks is not true diversification, as they will likely rise and fall together.
      <br/>• <strong>Negative correlation (-1.0):</strong> Two assets move in opposite directions. Historically, gold and equities have shown negative or low correlation during market panic, making gold a buffer.</p>
    </div>

    <h4>Building a Balanced Portfolio</h4>
    <p>A classic, moderate asset allocation might contain:</p>
    <ul>
      <li><strong>60% Equities (Nifty 50 Index + Flexi-cap funds)</strong> to generate long-term growth.</li>
      <li><strong>30% Debt/FDs (Liquid funds + AAA Corporate bonds)</strong> to provide short-term stability.</li>
      <li><strong>10% Gold (Sovereign Gold Bonds)</strong> as an inflation hedge and emergency buffer.</li>
    </ul>
  `,

  'Risk Profiles Explained': `
    <h3>Determining Your Personal Risk Profile</h3>
    <p>Your <strong>Risk Profile</strong> is a combination of two distinct factors: your <strong>Risk Tolerance</strong> (emotional ability to handle market drops) and your <strong>Risk Capacity</strong> (financial ability to absorb potential losses based on income, age, and reserves).</p>

    <h4>The Three Core Risk Profiles</h4>
    <ol>
      <li><strong>Conservative:</strong> Focused on capital preservation. Willing to accept lower returns (like FDs and debt funds) in exchange for high stability. Suitable for near-retirement or short-term goals.</li>
      <li><strong>Moderate:</strong> Seeks balance. Comfortable with moderate fluctuations in exchange for returns that outpace inflation. Portfolio contains a mix of debt and diversified equity.</li>
      <li><strong>Aggressive:</strong> Focused on long-term wealth growth. Comfortable with short-term portfolio drops of 20% to 30% in search of high equity returns. Suitable for young professionals with stable income.</li>
    </ol>

    <div class="my-5 p-4 bg-amber-50 border border-brand-warning/30 rounded-xl">
      <h4 class="font-bold text-brand-warning text-sm uppercase">Capacity vs. Tolerance</h4>
      <p class="text-xs mt-1">A 25-year-old with a stable job has high <em>Capacity</em> to take risk. However, if seeing their portfolio drop by 5% causes sleepless nights, their <em>Tolerance</em> is low. Your portfolio should never exceed your emotional limit, as it leads to panic-selling at market bottoms.</p>
    </div>
  `,

  // Course 5: Investor Psychology
  'Fear and Greed in Markets': `
    <h3>Navigating the Market Cycles of Fear and Greed</h3>
    <p>In theory, investing is simple: buy low, sell high. In practice, human psychology leads most retail investors to do the exact opposite. Stock markets are driven in the short term by two primary emotions: <strong>Greed</strong> and <strong>Fear</strong>.</p>

    <h4>The Emotional Cycle</h4>
    <p>Understanding this cycle helps you recognize emotional traps:</p>
    <ul>
      <li><strong>Greed (Market Peaks):</strong> When stocks are rising, social media is full of stories about overnight riches. Investors feel euphoric, throw caution to the wind, and invest their emergency funds at high valuations.</li>
      <li><strong>Fear (Market Bottoms):</strong> When the market crashes, news headlines project economic collapse. Panicked investors sell their holdings at massive losses to "save what's left," right before the market begins to recover.</li>
    </ul>

    <div class="my-5 p-4 bg-emerald-50 border border-brand-border rounded-xl">
      <h4 class="font-bold text-brand-primary text-sm uppercase">Warren Buffett's Maxim</h4>
      <p class="text-xs mt-1">"Be fearful when others are greedy, and greedy when others are fearful." When asset valuations are excessively high and optimism is universal, exercise caution. When panic sets in and good companies are sold at discounts, search for value.</p>
    </div>
  `,

  'FOMO: Fear Of Missing Out': `
    <h3>FOMO: The Retail Investor's Greatest Hazard</h3>
    <p><strong>FOMO (Fear Of Missing Out)</strong> is the anxiety that others are making money while you sit on the sidelines. FOMO is responsible for inflating speculative bubbles, from penny stocks to hyped IPOs and crypto trends. It causes investors to buy into assets they don't understand, at prices that are unsustainable.</p>

    <h4>How FOMO Distorts Decisions</h4>
    <p>When you act out of FOMO:</p>
    <ol>
      <li>You bypass research: You buy because the price is moving up, not because the underlying business is sound.</li>
      <li>You ignore valuation: You pay any price, assuming someone else will buy it from you at a higher price (the Great Fool Theory).</li>
      <li>You concentrate risk: You allocate too much capital into a single hot sector, leaving your portfolio vulnerable.</li>
    </ol>

    <h4>Combating FOMO</h4>
    <p>Always maintain a <strong>Written Investment Plan</strong>. Define what you invest in, why you invest, and stick to your schedule. If an asset class rises rapidly but is not in your plan, do not chase it.</p>
  `,

  'Patience and Discipline': `
    <h3>Cultivating Long-Term Patience & Discipline</h3>
    <p>Financial success in investing is less about IQ and more about behavior. Compounding is a slow process that requires consistent discipline over decades. The greatest challenge is staying the course when the market goes through flat or negative periods.</p>

    <h4>The Habit of Automating</h4>
    <p>The easiest way to remove emotion from investing is to automate it. Setting up a monthly SIP removes the need to "time the market" or make a monthly emotional decision. You buy when prices are high, and you buy when prices are low.</p>

    <div class="my-5 p-4 bg-emerald-50 border border-brand-border rounded-xl">
      <h4 class="font-bold text-brand-primary text-sm uppercase">Checking Your Portfolio</h4>
      <p class="text-xs mt-1">Research shows that the more frequently you check your portfolio, the more likely you are to make emotional changes that harm your returns. Try to review your progress only once every quarter or half-year. Avoid looking at daily market movements.</p>
    </div>
  `,

  // Extended Curriculum tracks:
  'Bank accounts, UPI & cash flow': `
    <h3>Managing Your Base: Accounts, UPI, and Cash Flow</h3>
    <p>Your bank account is the operational hub of your financial life. Managing it efficiently involves separating transactional liquidity from savings and using modern payment features safely.</p>
    
    <h4>Types of Bank Accounts</h4>
    <ul>
      <li><strong>Savings Account:</strong> Designed for personal funds, offers liquidity and pays modest interest (typically 2.5% - 4% in India).</li>
      <li><strong>Current Account:</strong> Tailored for businesses, allows unlimited transactions but pays zero interest.</li>
      <li><strong>Fixed Deposits (FD) / Recurring Deposits (RD):</strong> Time deposits offering higher interest rates in exchange for locking up money for a specified tenure.</li>
    </ul>

    <h4>Unified Payments Interface (UPI) Safety</h4>
    <p>UPI has revolutionized digital payments, but its extreme convenience can lead to impulse spending and security risks. Protect your funds:
    <br/>• Never enter your UPI PIN to <em>receive</em> money. A PIN is only required to send/pay money.
    <br/>• Treat UPI transaction limits seriously and keep a separate small account for daily UPI scans to protect your main savings account.</p>
  `,

  'Credit cards, loans & EMIs': `
    <h3>Debt Mechanics: Credit Cards, Interest, and EMIs</h3>
    <p>Debt is a double-edged sword. Used wisely (e.g., for purchasing an appreciating asset like a home), it can build wealth. Used poorly (e.g., for lifestyle consumption), it compounds against you rapidly.</p>

    <h4>The Danger of Minimum Due on Credit Cards</h4>
    <p>Credit card interest rates in India range between <strong>36% to 45% per annum</strong>. If you only pay the "Minimum Amount Due," the remaining balance accumulates daily interest, and new purchases lose their interest-free period. Credit cards should always be paid in full every single month.</p>

    <h4>Understanding EMIs</h4>
    <p>An <strong>Equated Monthly Installment (EMI)</strong> is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs consist of both principal and interest components. In the early stages of a loan, the interest portion dominates, while the principal repayment dominates toward the end.</p>
  `,

  'Emergency funds & insurance': `
    <h3>Risk Mitigation: Insurance and Emergency Cash</h3>
    <p>A solid financial plan doesn't just focus on growing money; it protects what you already have. Risk management starts with emergency reserves and the correct insurance coverage.</p>

    <h4>Essential Insurance Coverage</h4>
    <ul>
      <li><strong>Health Insurance:</strong> Prevents a medical crisis from wiping out your entire savings. Essential even if you have employer-provided cover.</li>
      <li><strong>Term Life Insurance:</strong> Provides a lump-sum payout to your dependents in the event of your death. Avoid expensive combination plans (like ULIPs) that mix insurance with investing; keep them separate.</li>
    </ul>

    <div class="my-5 p-4 bg-red-50 border border-brand-danger/20 rounded-xl">
      <h4 class="font-bold text-brand-danger text-sm uppercase">Rule of Thumb</h4>
      <p class="text-xs mt-1">Your term life insurance cover should be at least <strong>10 to 15 times your annual income</strong> to properly secure your family's future expenses and debts.</p>
    </div>
  `,

  'Equity, shares & ownership': `
    <h3>Equity and Corporate Shares Explained</h3>
    <p>A stock is not a speculative gambling token. It represents real legal ownership in a joint-stock corporation. Understanding this ownership concept is vital to long-term equity investing.</p>

    <h4>Shareholders Rights</h4>
    <p>As a shareholder, you possess several rights:</p>
    <ul>
      <li><strong>Voting Rights:</strong> Participate in major corporate resolutions (e.g. mergers, director appointments).</li>
      <li><strong>Residual Claim:</strong> Share in the assets of the company if it is liquidated, after all debts and creditors are paid.</li>
      <li><strong>Corporate Actions:</strong> Benefit from stock splits, bonus shares, and buybacks.</li>
    </ul>
  `,

  'Exchanges, demat & orders': `
    <h3>Market Infrastructure: Demat Accounts and Trading Mechanics</h3>
    <p>To buy and sell shares in India, you interact with a structured regulatory ecosystem consisting of brokers, exchanges, and depositories.</p>

    <h4>The Account Duumvirate</h4>
    <ul>
      <li><strong>Trading Account:</strong> Used to place buy and sell orders. Provided by your stockbroker (e.g. Zerodha, Groww).</li>
      <li><strong>Demat Account (Dematerialised):</strong> A digital vault where your shares are held electronically. Managed by central depositories (NSDL or CDSL) through Depository Participants (DPs).</li>
    </ul>

    <h4>Understanding Order Types</h4>
    <p>When trading, you can specify conditions using order types:</p>
    <ul>
      <li><strong>Market Order:</strong> Executes immediately at the best available current market price. Execution is guaranteed, but the exact price is not.</li>
      <li><strong>Limit Order:</strong> Executes only at your specified price or better. Price is guaranteed, but execution is not.</li>
    </ul>
  `,

  'Market cap: large, mid & small cap': `
    <h3>Market Capitalization and Size Segments</h3>
    <p>A company's size in the stock market is determined by its <strong>Market Capitalization</strong> (current share price multiplied by total outstanding shares).</p>

    <h4>SEBI Categories in India</h4>
    <ul>
      <li><strong>Large-Cap (1st - 100th company by market cap):</strong> Established market leaders. Highly liquid, relatively stable, but slower growth potential.</li>
      <li><strong>Mid-Cap (101st - 250th company):</strong> Mid-sized firms with high growth potential, but experience more volatility than large-caps.</li>
      <li><strong>Small-Cap (251st onwards):</strong> Emerging enterprises. Can grow rapidly, but carry significant business risk and high volatility.</li>
    </ul>
  `,

  'How mutual funds work': `
    <h3>The Structural Framework of Mutual Funds</h3>
    <p>Mutual funds in India are structured as a three-tier system regulated by SEBI to protect retail investors:</p>

    <ol class="space-y-2">
      <li><strong>Sponsor & Trustee:</strong> The sponsor sets up the fund. The Trustees act as watchdogs, ensuring the fund operates in the best interest of the investors.</li>
      <li><strong>Asset Management Company (AMC):</strong> The operational company that manages the money and designs schemes. Led by professional Fund Managers.</li>
      <li><strong>Custodian:</strong> An independent body (e.g., a major bank) that holds the physical/digital securities purchased by the fund to prevent fraud or theft.</li>
    </ol>
  `,

  'Equity, debt, hybrid & index funds': `
    <h3>Classifying Mutual Fund Schemes</h3>
    <p>Mutual funds are categorized based on what assets they are authorized to hold:</p>

    <ul>
      <li><strong>Equity Funds:</strong> Invest primarily in stocks. Designed for long-term growth; high risk.</li>
      <li><strong>Debt Funds:</strong> Invest in fixed-income securities (government bonds, commercial paper). Focused on interest income and capital stability.</li>
      <li><strong>Hybrid Funds:</strong> Combine equity and debt to balance growth and stability in a single fund.</li>
      <li><strong>Index Funds (Passive):</strong> Replicate a specific market index (like Nifty 50) at a very low expense ratio. No active fund manager decisions.</li>
    </ul>
  `,

  'SIPs, lumpsums & review discipline': `
    <h3>SIPs, Lumpsums, and Ongoing Portfolio Reviews</h3>
    <p>Choosing your investment route is just as important as choosing the asset itself. You can invest a lump-sum amount at once or set up a recurring SIP.</p>

    <h4>When to use which?</h4>
    <ul>
      <li><strong>SIP:</strong> Best for salary earners. Automates discipline, averages out market costs, and reduces the stress of trying to time market bottoms.</li>
      <li><strong>Lump-Sum:</strong> Suited when you receive a sudden windfall, bonus, or sale proceeds. Carry higher timing risk if invested right before a market dip.</li>
    </ul>

    <h4>Portfolio Reviews</h4>
    <p>Review your holdings once or twice a year. Check if your asset allocation has drifted due to market moves and rebalance back to your target. Avoid changing funds based on short-term underperformance under 1-2 years.</p>
  `,

  'Assets, liabilities & net worth': `
    <h3>The Personal Balance Sheet: Assets, Liabilities, and Net Worth</h3>
    <p>Your true financial health is measured by your <strong>Net Worth</strong>, not just your income. A high earner who spends everything and has heavy debt can have a negative net worth.</p>

    <div class="my-5 p-4 bg-emerald-50 border border-brand-border rounded-xl text-center">
      <h4 class="font-bold text-brand-primary text-sm uppercase">The Net Worth Equation</h4>
      <p class="font-serif text-lg my-2">Net Worth = Assets - Liabilities</p>
      <p class="text-xs text-brand-muted">Assets are things you own that have economic value. Liabilities are debts you owe to others.</p>
    </div>

    <h4>Examples</h4>
    <ul>
      <li><strong>Assets:</strong> Bank savings, mutual funds, gold bonds, employee provident fund (EPF), self-occupied home.</li>
      <li><strong>Liabilities:</strong> Credit card balances, car loans, education loans, home loans.</li>
    </ul>
  `,

  'Diversification & correlation': `
    <h3>Advanced Portfolio Diversification and Asset Correlation</h3>
    <p>True diversification requires asset classes that respond differently to the same economic news. If your stocks fall during a recession, you want bonds or gold to stand firm or rise.</p>

    <h4>Sector Diversification</h4>
    <p>Within your stock portfolio, diversify across unrelated industries:</p>
    <ul>
      <li><strong>Defensive Sectors:</strong> Consumer goods (FMCG), Pharmaceuticals, Utilities. These hold steady because people need medicine and soap even in recessions.</li>
      <li><strong>Cyclical Sectors:</strong> Banking, Automobiles, Real Estate, Metals. These perform exceptionally well in expansions but decline in downturns.</li>
    </ul>
  `,

  'Goal-based allocation': `
    <h3>Matching Goals to Investment Horizons</h3>
    <p>Never invest without a goal. A goal defines the <strong>time horizon</strong>, which determines the correct asset allocation.</p>

    <ul>
      <li><strong>Short-Term Goals (&lt; 3 years):</strong> Safety is paramount. Keep funds in Fixed Deposits, Liquid Funds, or Arbitrage Funds. Accept zero equity exposure here.</li>
      <li><strong>Medium-Term Goals (3 - 5 years):</strong> Moderate risk. Allocate to conservative hybrid funds, equity-savings funds, or a balanced mix (e.g. 30% equity, 70% debt).</li>
      <li><strong>Long-Term Goals (&gt; 5 years):</strong> Growth focus. Can tolerate short-term equity drops. Allocate to diversified equity mutual funds, index funds, and gold.</li>
    </ul>
  `,

  'OHLC, line charts & candlesticks': `
    <h3>Reading Stock Charts: OHLC and Candlestick Basics</h3>
    <p>Stock charts organize transaction history visually. The two most common charts are line charts (connecting closing prices) and candlestick charts (displaying the full session range).</p>

    <h4>Understanding a Candlestick</h4>
    <p>A single candle represents price action for a specific time interval (e.g. 5 minutes, 1 hour, 1 day):</p>
    <ul>
      <li><strong>Body:</strong> The rectangular part showing the range between the Open and Close prices. If green, the close was higher than the open. If red, the close was lower.</li>
      <li><strong>Wicks/Shadows:</strong> The thin lines extending above and below the body, showing the High and Low prices reached during the session.</li>
    </ul>
  `,

  'Trends, support, resistance & volume': `
    <h3>Market Structure: Trends and Support/Resistance Zones</h3>
    <p>Prices do not move in straight lines; they move in waves, forming trends and horizontal zones of interest.</p>

    <h4>Core Concepts</h4>
    <ul>
      <li><strong>Uptrend:</strong> Characterized by a sequence of higher highs and higher lows.</li>
      <li><strong>Downtrend:</strong> Characterized by lower highs and lower lows.</li>
      <li><strong>Support Zone:</strong> A price level where buying interest has historically been strong enough to overcome selling pressure, causing the price to bounce back up.</li>
      <li><strong>Resistance Zone:</strong> A price level where selling interest has historically been strong enough to halt an upward move, causing the price to turn down.</li>
    </ul>
  `,

  'Moving averages & indicators': `
    <h3>Moving Averages and Technical Indicators</h3>
    <p>Indicators are mathematical calculations based on price and volume. They help filter out short-term market noise but lag behind actual price action.</p>

    <h4>Common Indicators</h4>
    <ul>
      <li><strong>Simple Moving Average (SMA):</strong> The average price of a security over a specified number of periods. E.g., a 50-day SMA tracks the medium-term trend.</li>
      <li><strong>Relative Strength Index (RSI):</strong> A momentum oscillator that measures the speed and change of price movements on a scale from 0 to 100. Traditionally, values above 70 indicate an overbought condition, while values below 30 indicate an oversold condition.</li>
    </ul>
  `,

  'Business model & competitive position': `
    <h3>Fundamental Analysis: Business Models and Moats</h3>
    <p>Fundamental analysis starts with business understanding. Before opening a balance sheet, ask: "How does this company make money, and why do its customers choose it over competitors?"</p>

    <h4>Economic Moats</h4>
    <p>An economic moat is a sustainable competitive advantage that protects a company's market share and profit margins from competitors. Types of moats include:</p>
    <ul>
      <li><strong>Brand Moat:</strong> Customers are willing to pay a premium (e.g., Apple, Coca-Cola).</li>
      <li><strong>Switching Cost Moat:</strong> Moving to a competitor is too expensive or disruptive (e.g., Enterprise software).</li>
      <li><strong>Network Effect Moat:</strong> The service becomes more valuable as more people use it (e.g., Visa, WhatsApp).</li>
    </ul>
  `,

  'Financial statements': `
    <h3>Deconstructing Financial Statements</h3>
    <p>To evaluate a company's financial health, you must study its three core financial filings, which must be read together:</p>

    <ul>
      <li><strong>Income Statement (P&L):</strong> Shows revenue, expenses, and net profit over a specific period (quarter or year). Explains sales growth and margins.</li>
      <li><strong>Balance Sheet:</strong> Displays assets, liabilities, and shareholder equity at a single point in time. Shows debt levels and liquidity.</li>
      <li><strong>Cash Flow Statement:</strong> Records actual cash movements across Operations, Investing, and Financing. Ensures that reported net profit is backed by real cash receipts.</li>
    </ul>
  `,

  'Valuation metrics & limits': `
    <h3>Key Valuation Ratios and Financial Metrics</h3>
    <p>A great company is not always a great investment if you pay too high a price. Valuation ratios help you compare share price with underlying earnings.</p>

    <ul>
      <li><strong>Price-to-Earnings (P/E) Ratio:</strong> Shares price divided by Earnings Per Share (EPS). Indicates how much the market is willing to pay for every rupee of earnings. Compare against sector average and history.</li>
      <li><strong>Return on Equity (ROE):</strong> Net income divided by shareholders' equity. Measures how efficiently a company generates profits using shareholders' capital.</li>
      <li><strong>Debt-to-Equity:</strong> Total liabilities divided by shareholders' equity. Ratios above 1.5 indicate high leverage and potential risk, especially in cyclical industries.</li>
    </ul>
  `,

  'Tax documents & basic terms': `
    <h3>Personal Taxation and Compliance in India</h3>
    <p>Tax literacy prevents compliance penalties and helps you claim legal deductions. Understand the primary documents used in Indian tax filing:</p>

    <ul>
      <li><strong>Form 16:</strong> A certificate issued by your employer summarizing salary paid and tax deducted at source (TDS).</li>
      <li><strong>AIS (Annual Information Statement):</strong> A comprehensive statement generated by the Income Tax Department showing all your financial transactions, including interest earned, stock sales, and dividends received.</li>
      <li><strong>Financial Year (FY) vs. Assessment Year (AY):</strong> The FY is the year in which you earn income (e.g. April 1, 2025 to March 31, 2026). The AY is the following year in which your tax return is evaluated and filed (e.g. July 2026).</li>
    </ul>
  `,

  'Investment taxes & records': `
    <h3>Capital Gains Taxation on Investments</h3>
    <p>Taxation depends on the asset type and the <strong>holding period</strong> (how long you hold the asset before selling).</p>

    <h4>Equity Taxation (Stocks and Equity Mutual Funds)</h4>
    <ul>
      <li><strong>Short-Term Capital Gains (STCG):</strong> If sold within 1 year. Taxed at a flat rate (historically 15% to 20%).</li>
      <li><strong>Long-Term Capital Gains (LTCG):</strong> If sold after holding for more than 1 year. First ₹1.25 Lakhs of gains in a financial year are tax-free; gains exceeding this limit are taxed at a lower rate (typically 10% to 12.5%).</li>
    </ul>

    <p>Always keep brokers' contract notes, purchase statements, and bank records to calculate your cost of acquisition accurately during tax filing.</p>
  `,

  'KYC, nominations & fraud prevention': `
    <h3>Investor Security: KYC, Nominations, and Fraud Prevention</h3>
    <p>Securing your assets is just as important as picking them. Follow administrative guidelines to protect your financial legacy.</p>

    <h4>Key Safeguards</h4>
    <ul>
      <li><strong>KYC (Know Your Customer):</strong> A mandatory verification process to prevent money laundering and identity theft. Keep your KYC records updated.</li>
      <li><strong>Nominations:</strong> Always add a nominee (e.g., spouse, parent, child) to your bank accounts, mutual funds, and demat accounts. In the event of your death, this enables smooth transfer of assets without long legal battles.</li>
      <li><strong>Phishing and Fraud:</strong> Never share your passwords, OTPs, or UPI PINs. Always check if a broker or advisor is registered with SEBI before transferring any funds.</li>
    </ul>
  `,

  'Retirement math & inflation': `
    <h3>Retirement Planning and the Inflation Trap</h3>
    <p>Retirement planning is not about saving a random sum; it is about estimating future expenses adjusted for inflation, and ensuring your nest egg lasts your lifetime.</p>

    <h4>The Power of Inflation over Decades</h4>
    <p>At a 6% average inflation rate, your monthly expenses will double every 12 years. If you need ₹40,000 per month today, you will need ₹80,000 in 12 years, and ₹1,60,000 in 24 years just to maintain the exact same standard of living. Your retirement target must be calculated using these future values.</p>

    <h4>The Rule of 25x</h4>
    <p>A common starting point for retirement planning is targetting a nest egg equal to **25 to 30 times your estimated annual retirement expenses**. If your inflation-adjusted annual expenses in year one of retirement are ₹6,00,000, your target retirement corpus is ₹1.5 Crores.</p>
  `,

  'EPF, NPS & retirement buckets': `
    <h3>Retirement Vehicles: EPF, NPS, and PPF</h3>
    <p>The Indian government provides tax-advantaged accounts specifically designed to help citizens build long-term retirement savings.</p>

    <ul>
      <li><strong>EPF (Employee Provident Fund):</strong> A mandatory savings scheme for salaried employees. Both employee and employer contribute, earning a compounding interest rate backed by the government.</li>
      <li><strong>NPS (National Pension System):</strong> A voluntary, market-linked pension scheme. Funds are invested in a mix of equity, corporate debt, and government bonds, locking in savings until age 60. Provides an additional tax deduction of ₹50,000 under Section 80CCD(1B).</li>
      <li><strong>PPF (Public Provident Fund):</strong> A voluntary 15-year savings account with tax-free interest and maturity payouts. Excellent for conservative investors.</li>
    </ul>
  `,

  'Behaviour, reviews & a written plan': `
    <h3>The Final Step: The Annual Financial Review</h3>
    <p>A written financial plan is a living document, not a one-time exercise. Set up a recurring schedule (e.g., every year during Diwali or April) to review your progress.</p>

    <h4>The Annual Review Checklist</h4>
    <ol>
      <li><strong>Update Net Worth:</strong> List assets and liabilities to check if your net worth has increased.</li>
      <li><strong>Review Insurance Cover:</strong> Check if marriage, children, or higher income warrants upgrading health or term cover.</li>
      <li><strong>Rebalance Asset Allocation:</strong> If stock market gains have pushed your equity allocation from 60% to 70%, sell 10% equity and move it to debt to restore your original risk profile.</li>
      <li><strong>Confirm Nominees:</strong> Verify that nominees are correctly registered on all new accounts.</li>
    </ol>
  `
};

module.exports = detailedContent;
