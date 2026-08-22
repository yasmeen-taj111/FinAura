import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Mail, Calendar, Coins, Landmark, Target, Bot, Download, 
  Send, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, Award
} from 'lucide-react';
import api from '../services/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';

const Profile = () => {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'diagnostics', 'portfolio', 'chat'
  const [activeTab, setActiveTab] = useState('diagnostics');

  // Chat Assistant States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'advisor',
      text: "Hello! I am your **FinAura AI Advisor**. I have access to your financial profile, active goals, and virtual sandbox portfolio. Ask me any question, or select a prompt below!",
      timestamp: new Date()
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Load all user details
  const fetchAllData = async () => {
    try {
      const [profileRes, portRes, goalsRes, badgesRes] = await Promise.allSettled([
        api.get('/profile'),
        api.get('/portfolio'),
        api.get('/goals'),
        api.get('/learning/badges')
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
      if (portRes.status === 'fulfilled') setPortfolio(portRes.value.data);
      if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data);
      if (badgesRes.status === 'fulfilled') setBadges(badgesRes.value.data);
    } catch (err) {
      console.error('Error fetching profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync tab with URL anchor on load/hashchange
  useEffect(() => {
    if (location.hash === '#chat') {
      setActiveTab('chat');
    } else {
      setActiveTab('diagnostics');
    }
  }, [location.hash]);

  // Download Portfolio CSV Utility
  const handleDownloadPortfolio = () => {
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
      alert("You don't have any active virtual holdings in your portfolio yet! Buy assets in the Explore (Sandbox) tab first.");
      return;
    }

    // Define CSV Headers
    const headers = [
      'Symbol',
      'Asset Name',
      'Asset Type',
      'Quantity Owned',
      'Average Buy Cost (INR)',
      'Current Price (INR)',
      'Current Value (INR)',
      'Returns (ROI %)',
      'Total Net Gain/Loss (INR)'
    ];

    // Map holdings to CSV rows
    const rows = portfolio.holdings.map(h => [
      h.asset.symbol,
      `"${h.asset.name}"`, // Quote names to prevent comma breaking
      h.asset.type,
      h.quantity,
      h.averageBuyPrice,
      h.asset.currentPrice,
      h.currentValue,
      `${h.roi.toFixed(2)}%`,
      h.gainLoss
    ]);

    // Append cash balance row
    rows.push([
      'CASH',
      '"Cash Balance"',
      'CASH',
      1,
      portfolio.balance,
      portfolio.balance,
      portfolio.balance,
      '0.00%',
      0
    ]);

    // Compile text
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    // Create download element and click it
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finaura_portfolio_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send message to chatbot
  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    // Append User message
    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput('');
    
    setChatLoading(true);
    try {
      const response = await api.post('/assistant/chat', { message: textToSend });
      
      const advisorMsg = {
        sender: 'advisor',
        text: response.data.reply,
        timestamp: new Date(response.data.timestamp)
      };
      setChatMessages(prev => [...prev, advisorMsg]);
    } catch (err) {
      console.error('Advisor query failed', err);
      const errorMsg = {
        sender: 'advisor',
        text: "I'm having trouble connecting to my database modules right now. Please verify your connection or try again in a few moments.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Pre-calculated budget visuals data
  const budgetChartData = useMemo(() => {
    if (!profile) return [];
    return [
      { name: 'Income', Value: profile.monthlyIncome, color: '#064E3B' },
      { name: 'Expenses', Value: profile.monthlyExpenses, color: '#C64A4A' },
      { name: 'Savings', Value: profile.monthlySavings, color: '#167A55' }
    ];
  }, [profile]);

  // Recharts asset breakdown data
  const assetAllocationData = useMemo(() => {
    if (!portfolio) return [];
    const cash = portfolio.balance || 0;
    const data = [
      { name: 'Free Cash', value: cash, color: '#8FAF9A' }
    ];

    const colors = ['#064E3B', '#083C32', '#D89B24', '#C68A4A', '#167A55', '#3B82F6'];
    (portfolio.holdings || []).forEach((h, idx) => {
      data.push({
        name: h.asset.symbol,
        value: h.currentValue,
        color: colors[idx % colors.length]
      });
    });

    return data.filter(d => d.value > 0);
  }, [portfolio]);

  // Scores chart data
  const scoresData = useMemo(() => {
    if (!profile?.scores) return [];
    return [
      { name: 'Money Basics', Score: profile.scores.moneyManagement || 0 },
      { name: 'Investing', Score: profile.scores.investingKnowledge || 0 },
      { name: 'Risk', Score: profile.scores.riskUnderstanding || 0 },
      { name: 'Goals', Score: profile.scores.goalPlanning || 0 },
      { name: 'Habits', Score: profile.scores.financialBehavior || 0 }
    ];
  }, [profile]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-bg text-sm text-brand-muted">
        Loading your FinAura Profile dashboard...
      </div>
    );
  }

  // Profile status details
  const scoreOverall = profile?.scores?.overall || 0;
  const netWorth = portfolio?.totalPortfolioValue || 100000;
  const cashBalance = portfolio?.balance || 0;
  const holdingsValue = portfolio?.totalHoldingsValue || 0;
  const overallReturn = portfolio?.overallGainLoss || 0;
  const overallReturnPct = portfolio?.overallGainLossPercent || 0;
  const earnedBadgesCount = (badges || []).filter(b => b.earned).length;

  return (
    <div className="page-shell px-5 py-8 md:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Hero Section */}
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">User Diagnostics Workspace</p>
            <h1 className="mt-2 font-serif text-4xl text-brand-ink md:text-5xl">My Profile & Portfolio</h1>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Analyze your asset allocation, track domain scores, query the AI advisor, and download portfolio logs.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPortfolio}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs md:text-sm font-semibold text-white hover:opacity-90 transition-all shadow-card border-0 cursor-pointer"
            >
              <Download size={16} />
              Export Portfolio CSV
            </button>
          </div>
        </header>

        {/* Diagnostic overview quick cards */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          
          {/* Net Worth */}
          <div className="surface-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-primary"></div>
            <div className="flex items-center gap-2 text-brand-muted">
              <Landmark size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Virtual Net Worth</span>
            </div>
            <p className="text-xl font-bold text-brand-ink mt-3">₹{netWorth.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-brand-muted mt-1 block">Free Cash: ₹{cashBalance.toLocaleString('en-IN')}</span>
          </div>

          {/* Overall Return */}
          <div className="surface-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-primary"></div>
            <div className="flex items-center gap-2 text-brand-muted">
              <Coins size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Trading Returns</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <p className={`text-xl font-bold ${overallReturn >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                ₹{overallReturn.toLocaleString('en-IN')}
              </p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                overallReturn >= 0 ? 'bg-emerald-50 text-brand-success' : 'bg-red-50 text-brand-danger'
              }`}>
                {overallReturn >= 0 ? '+' : ''}{overallReturnPct.toFixed(2)}%
              </span>
            </div>
            <span className="text-[10px] text-brand-muted mt-1 block">Virtual sandbox assets</span>
          </div>

          {/* Assessment Score */}
          <div className="surface-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-primary"></div>
            <div className="flex items-center gap-2 text-brand-muted">
              <Shield size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Confidence Score</span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <p className="text-xl font-bold text-brand-ink">{scoreOverall}</p>
              <span className="text-[10px] text-brand-muted">/ 100</span>
            </div>
            <span className="text-[10px] text-brand-muted mt-1 block">
              {profile?.assessmentCompleted ? 'Diagnostic completed' : 'Assessment pending'}
            </span>
          </div>

          {/* Badges Earned */}
          <div className="surface-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-primary"></div>
            <div className="flex items-center gap-2 text-brand-muted">
              <Award size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Milestones Earned</span>
            </div>
            <p className="text-xl font-bold text-brand-ink mt-3">{earnedBadgesCount} / {badges.length}</p>
            <span className="text-[10px] text-brand-muted mt-1 block">Verified badge checklist</span>
          </div>

        </section>

        {/* Tab Selection */}
        <div className="flex space-x-2 border-b border-brand-border mb-8">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`pb-3 px-5 text-xs md:text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'diagnostics' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-brand-muted hover:text-brand-primary'
            }`}
          >
            <User size={16} />
            Diagnostic Dashboard
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-5 text-xs md:text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'portfolio' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-brand-muted hover:text-brand-primary'
            }`}
          >
            <Landmark size={16} />
            Asset Portfolio Logs
          </button>
          <button
            id="chat-tab-trigger"
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-5 text-xs md:text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'chat' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-brand-muted hover:text-brand-primary'
            }`}
          >
            <Bot size={16} />
            AI Financial Advisor
          </button>
        </div>

        {/* MAIN DISPLAY CHUNKS */}
        <div>
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DIAGNOSTIC DASHBOARD (CHARTS) */}
            {activeTab === 'diagnostics' && (
              <motion.div
                key="diagnostics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-6 lg:grid-cols-3"
              >
                
                {/* Column 1: Asset Allocation Pie Chart */}
                <div className="surface-card p-6 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <h3 className="font-semibold text-brand-ink text-sm uppercase tracking-wider">Asset Allocation</h3>
                    <p className="text-xs text-brand-muted mt-1">Diversification across cash and virtual instruments</p>
                  </div>

                  <div className="w-full h-56 mt-4">
                    {assetAllocationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assetAllocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {assetAllocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                            contentStyle={{ background: '#FFFFFF', border: '1px solid #DDE5DE', borderRadius: '12px', fontSize: '11px', color: '#12332C' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                        No holdings assets recorded. Check Sandbox.
                      </div>
                    )}
                  </div>

                  {/* Allocation legends */}
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-brand-muted">
                    {assetAllocationData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold">{item.name} ({Math.round((item.value / netWorth) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Budget Breakdown (Income vs Spend vs Save) */}
                <div className="surface-card p-6 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <h3 className="font-semibold text-brand-ink text-sm uppercase tracking-wider">Cash Flow Budget</h3>
                    <p className="text-xs text-brand-muted mt-1">Monthly income vs essential spending and savings</p>
                  </div>

                  <div className="w-full h-56 mt-4">
                    {profile && profile.monthlyIncome > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#65736D" fontSize={10} tickLine={false} />
                          <YAxis stroke="#65736D" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                            contentStyle={{ background: '#FFFFFF', border: '1px solid #DDE5DE', borderRadius: '12px', fontSize: '11px' }}
                          />
                          <Bar dataKey="Value" radius={[8, 8, 0, 0]}>
                            {budgetChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                        No profile income records. Take the assessment first.
                      </div>
                    )}
                  </div>

                  {/* Summary rate */}
                  {profile && profile.monthlyIncome > 0 ? (
                    <div className="mt-4 pt-3 border-t border-brand-border flex justify-between items-center text-xs">
                      <span className="text-brand-muted">Target Savings rate compliance (20%):</span>
                      <strong className="text-brand-success">
                        {Math.round((profile.monthlySavings / profile.monthlyIncome) * 100)}%
                      </strong>
                    </div>
                  ) : (
                    <div className="mt-4 text-center">
                      <Link to="/assessment" className="text-xs font-bold text-brand-primary">Begin Assessment</Link>
                    </div>
                  )}
                </div>

                {/* Column 3: Domain Confidence Matrix */}
                <div className="surface-card p-6 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <h3 className="font-semibold text-brand-ink text-sm uppercase tracking-wider">Financial Domain Matrix</h3>
                    <p className="text-xs text-brand-muted mt-1">Strengths and rooms to grow based on diagnostics</p>
                  </div>

                  <div className="w-full h-56 mt-4">
                    {profile && profile.assessmentCompleted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoresData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <XAxis type="number" domain={[0, 100]} stroke="#65736D" fontSize={9} />
                          <YAxis dataKey="name" type="category" stroke="#65736D" fontSize={10} width={75} tickLine={false} />
                          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #DDE5DE', borderRadius: '12px', fontSize: '11px' }} />
                          <Bar dataKey="Score" fill="#064E3B" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                        No assessment metrics. Complete evaluation on dashboard.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-brand-border flex justify-between items-center text-xs">
                    <span className="text-brand-muted">Overall Diagnostics score:</span>
                    <strong className="text-brand-primary">{scoreOverall} / 100</strong>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: PORTFOLIO LOGS */}
            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="surface-card rounded-3xl border border-brand-border overflow-hidden"
              >
                {(!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) ? (
                  <div className="p-16 text-center space-y-4">
                    <p className="text-brand-muted text-sm font-medium">Your virtual holdings portfolio is currently empty.</p>
                    <Link
                      to="/sandbox"
                      className="inline-flex rounded-xl bg-brand-primary text-white text-xs font-bold px-5 py-2.5 shadow-card hover:opacity-90 border-0 cursor-pointer text-center"
                    >
                      Go to Virtual Sandbox
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-brand-ink">
                      <thead>
                        <tr className="border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-brand-light/35">
                          <th className="py-4 px-6">Asset symbol</th>
                          <th className="py-4 px-6">Name</th>
                          <th className="py-4 px-6">Type</th>
                          <th className="py-4 px-6 text-right">Units</th>
                          <th className="py-4 px-6 text-right">Avg cost</th>
                          <th className="py-4 px-6 text-right">Market value</th>
                          <th className="py-4 px-6 text-right">Returns (ROI %)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-xs">
                        {portfolio.holdings.map((holding) => {
                          const isGain = holding.gainLoss >= 0;
                          return (
                            <tr key={holding._id} className="hover:bg-brand-light/20 transition-colors">
                              <td className="py-4 px-6 font-bold">{holding.asset.symbol}</td>
                              <td className="py-4 px-6 text-brand-muted font-medium">{holding.asset.name}</td>
                              <td className="py-4 px-6">
                                <span className="text-[10px] bg-brand-light px-2 py-0.5 rounded border border-brand-border text-brand-primary font-bold">
                                  {holding.asset.type}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">{holding.quantity}</td>
                              <td className="py-4 px-6 text-right">₹{holding.averageBuyPrice.toLocaleString('en-IN')}</td>
                              <td className="py-4 px-6 text-right font-bold">₹{holding.currentValue.toLocaleString('en-IN')}</td>
                              <td className="py-4 px-6 text-right">
                                <span className={`font-bold flex items-center justify-end ${isGain ? 'text-brand-success' : 'text-brand-danger'}`}>
                                  {isGain ? '+' : ''}
                                  {holding.roi.toFixed(1)}% (₹{holding.gainLoss.toLocaleString('en-IN')})
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {/* Cash balance aggregate row */}
                        <tr className="bg-brand-light/10 font-semibold border-t-2 border-brand-border">
                          <td className="py-4 px-6 font-bold">CASH</td>
                          <td className="py-4 px-6 text-brand-muted">Free Cash Balance</td>
                          <td className="py-4 px-6">
                            <span className="text-[10px] bg-brand-light px-2 py-0.5 rounded border border-brand-border text-brand-muted">CASH</span>
                          </td>
                          <td className="py-4 px-6 text-right">1</td>
                          <td className="py-4 px-6 text-right">₹{cashBalance.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-6 text-right font-bold">₹{cashBalance.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-6 text-right text-brand-muted">0.0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: AI ADVISOR CHATBOT */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="surface-card rounded-3xl border border-brand-border overflow-hidden flex flex-col h-[520px]"
              >
                
                {/* Chat Panel Header */}
                <div className="px-6 py-4 border-b border-brand-border bg-brand-light/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="text-brand-primary" />
                    <div>
                      <h3 className="font-bold text-brand-ink text-sm">FinAura AI Financial Assistant</h3>
                      <p className="text-[10px] text-brand-muted">Context-aware advice utilizing your profile goals and holdings</p>
                    </div>
                  </div>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-success"></span>
                  </span>
                </div>

                {/* Messages view */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-brand-bg/25">
                  {chatMessages.map((msg, idx) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 text-xs md:text-sm border leading-relaxed ${
                          isUser 
                            ? 'bg-brand-primary text-white border-brand-primary rounded-tr-none shadow-card' 
                            : 'bg-white text-brand-ink border-brand-border rounded-tl-none shadow-card prose'
                        }`}>
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                          )}
                          <span className={`text-[8px] mt-1.5 block text-right ${isUser ? 'text-white/60' : 'text-brand-muted'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-brand-ink border border-brand-border rounded-2xl rounded-tl-none p-4 shadow-card flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions bubble rows */}
                <div className="px-6 py-2 border-t border-brand-border bg-white flex flex-wrap gap-2 overflow-x-auto">
                  {[
                    "Analyze my allocation",
                    "Review my budget",
                    "Explain compound interest",
                    "Am I on track for my goals?"
                  ].map((sug) => (
                    <button
                      key={sug}
                      onClick={() => handleSendMessage(sug)}
                      disabled={chatLoading}
                      className="px-3 py-1.5 rounded-full border border-brand-border text-[10px] font-bold text-brand-primary hover:bg-brand-light transition-all cursor-pointer bg-white"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Chat Inputs */}
                <div className="px-6 py-4 border-t border-brand-border bg-white flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Ask about your budgeting, savings rate, portfolio, or goals..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={chatLoading}
                    className="flex-1 bg-brand-bg/50 border border-brand-border rounded-xl px-4 py-3 text-xs md:text-sm text-brand-ink focus:outline-brand-primary"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-3 bg-brand-primary text-white rounded-xl hover:opacity-95 disabled:opacity-30 transition-all border-0 cursor-pointer shadow-card"
                  >
                    <Send size={16} />
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Profile;
