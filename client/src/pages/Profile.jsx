import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Mail, Coins, Landmark, Target, Download,
  AlertCircle, ArrowUpRight, ArrowDownRight, Award,
  Upload, Plus, Trash2, HelpCircle, FileText, CheckCircle2, ChevronRight, X, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'diagnostics', 'portfolio'
  const [activeTab, setActiveTab] = useState('diagnostics');

  // Portfolio Sub-Tab: 'sandbox' vs 'consolidated'
  const [portfolioTab, setPortfolioTab] = useState('sandbox');

  // Consolidated Portfolio States
  const [consolidatedData, setConsolidatedData] = useState({
    holdings: [],
    totalCurrentValue: 0,
    totalInvestedValue: 0,
    overallGainLoss: 0,
    overallGainLossPercent: 0,
    platformBreakdown: {},
    assetTypeBreakdown: {}
  });

  // Manual Holding Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submittingHolding, setSubmittingHolding] = useState(false);
  const [holdingForm, setHoldingForm] = useState({
    platform: 'Zerodha',
    symbol: '',
    name: '',
    assetType: 'STOCK',
    quantity: '',
    averageBuyPrice: '',
    currentPrice: ''
  });

  // Drag and Drop CSV State
  const [dragOver, setDragOver] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);

  // Fetch all user records
  const fetchAllData = async () => {
    try {
      const [profileRes, portRes, goalsRes, badgesRes, consRes] = await Promise.allSettled([
        api.get('/profile'),
        api.get('/portfolio'),
        api.get('/goals'),
        api.get('/learning/badges'),
        api.get('/portfolio/consolidated')
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
      if (portRes.status === 'fulfilled') setPortfolio(portRes.value.data);
      if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data);
      if (badgesRes.status === 'fulfilled') setBadges(badgesRes.value.data);
      
      if (consRes.status === 'fulfilled' && consRes.value.data) {
        setConsolidatedData(consRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard database records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Download Portfolio CSV Utility
  const handleDownloadPortfolio = () => {
    const isSandbox = portfolioTab === 'sandbox';

    if (isSandbox) {
      if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
        alert("Your virtual sandbox portfolio has no holdings! Execute orders in the Explore (Sandbox) tab first.");
        return;
      }

      const headers = ['Symbol', 'Asset Name', 'Asset Type', 'Quantity Owned', 'Average Buy Cost (INR)', 'Current Price (INR)', 'Current Value (INR)', 'Returns (ROI %)', 'Net Gain/Loss (INR)'];
      const rows = portfolio.holdings.map(h => [
        h.asset.symbol,
        `"${h.asset.name}"`,
        h.asset.type,
        h.quantity,
        h.averageBuyPrice,
        h.asset.currentPrice,
        h.currentValue,
        `${h.roi.toFixed(2)}%`,
        h.gainLoss
      ]);

      rows.push(['CASH', '"Cash Balance"', 'CASH', 1, portfolio.balance, portfolio.balance, portfolio.balance, '0.00%', 0]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `finaura_sandbox_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Export Consolidated Portfolio
      if (consolidatedData.holdings.length === 0) {
        alert("You don't have any consolidated holdings. Import broker CSV statements or use the manual add form first.");
        return;
      }

      const headers = ['Platform', 'Symbol', 'Asset Name', 'Asset Type', 'Quantity Owned', 'Average Buy Price (INR)', 'Current Price (INR)', 'Current Value (INR)', 'Returns (ROI %)', 'Gain/Loss (INR)'];
      const rows = consolidatedData.holdings.map(h => [
        h.platform,
        h.symbol,
        `"${h.name}"`,
        h.assetType,
        h.quantity,
        h.averageBuyPrice,
        h.currentPrice,
        h.currentValue,
        `${h.roi.toFixed(2)}%`,
        h.gainLoss
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `finaura_consolidated_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Pre-calculated budget visuals
  const budgetChartData = useMemo(() => {
    if (!profile) return [];
    return [
      { name: 'Income', Value: profile.monthlyIncome, color: '#064E3B' },
      { name: 'Expenses', Value: profile.monthlyExpenses, color: '#C64A4A' },
      { name: 'Savings', Value: profile.monthlySavings, color: '#167A55' }
    ];
  }, [profile]);

  // Recharts asset breakdown data for Sandbox
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

  // Platform Breakdown Donut Chart
  const platformChartData = useMemo(() => {
    if (!consolidatedData || !consolidatedData.platformBreakdown) return [];
    const colors = ['#083C32', '#167A55', '#D89B24', '#C68A4A', '#3B82F6'];
    return Object.keys(consolidatedData.platformBreakdown).map((platform, idx) => ({
      name: platform,
      value: consolidatedData.platformBreakdown[platform],
      color: colors[idx % colors.length]
    })).filter(p => p.value > 0);
  }, [consolidatedData]);

  // Consolidated Asset Allocation Chart
  const consolidatedAssetData = useMemo(() => {
    if (!consolidatedData || !consolidatedData.assetTypeBreakdown) return [];
    const colors = ['#064E3B', '#D89B24', '#167A55', '#C64A4A', '#3B82F6'];
    return Object.keys(consolidatedData.assetTypeBreakdown).map((type, idx) => ({
      name: type.replace('_', ' '),
      value: consolidatedData.assetTypeBreakdown[type],
      color: colors[idx % colors.length]
    })).filter(a => a.value > 0);
  }, [consolidatedData]);

  // Domain score radar/bar
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

  // Dynamically tailored AI Advisor preset prompts based on weakest diagnostic scores
  const advisorSuggestions = useMemo(() => {
    const defaultSuggestions = [
      { label: "Check SIP Drawdown Risk", text: "Evaluate the risks of starting a Small-Cap or Sectoral mutual fund SIP and verify my risk alignment." },
      { label: "Audit Multi-Broker Assets", text: "Analyze my consolidated asset allocation and platform concentration metrics." },
      { label: "Fact-Check Social Hype", text: "Validate this social media stock recommendation: Buy SUZLON ENERGY target 120 INR in 30 days!" },
      { label: "Assess Savings Compliance", text: "Evaluate my monthly budgeting and savings rate against standard personal finance rules." }
    ];

    if (!profile?.scores) return defaultSuggestions;

    const categories = [
      { key: 'moneyManagement', label: 'Money Basics' },
      { key: 'investingKnowledge', label: 'Investing' },
      { key: 'riskUnderstanding', label: 'Risk' },
      { key: 'goalPlanning', label: 'Goal Planning' },
      { key: 'financialBehavior', label: 'Financial Habits' }
    ];

    let weakest = categories[0];
    categories.forEach(cat => {
      if ((profile.scores[cat.key] || 0) < (profile.scores[weakest.key] || 0)) {
        weakest = cat;
      }
    });

    if ((profile.scores[weakest.key] || 0) === 0) {
      return defaultSuggestions;
    }

    const tailored = [];
    if (weakest.key === 'moneyManagement') {
      tailored.push({ label: "💡 Optimize My Budget Allocation", text: "Based on my income and expenses, explain how I can structure my money using the 50/30/20 rule." });
      tailored.push({ label: "🛡️ Emergency Fund Requirements", text: "How should I structure my emergency safety fund? Suggest liquid instruments for parking cash." });
    } else if (weakest.key === 'investingKnowledge') {
      tailored.push({ label: "📈 Explain Rupee Cost Averaging", text: "How does SIP rupee-cost averaging help first-time investors who don't understand price movements?" });
      tailored.push({ label: "⚖️ Equity vs Debt vs FDs", text: "Explain the difference in expected returns and security when choosing between stocks, bonds, mutual funds, and fixed deposits." });
    } else if (weakest.key === 'riskUnderstanding') {
      tailored.push({ label: "⚠️ Evaluate Small-Cap SIP Risk", text: "Verify if starting a Small-Cap equity SIP is suitable given my risk profiling score." });
      tailored.push({ label: "📉 Diversification Health Index", text: "Analyze my portfolio's diversification index score and give me suggestions to protect against market flash crashes." });
    } else if (weakest.key === 'goalPlanning') {
      tailored.push({ label: "🎯 Set a Multi-Year Target Goal", text: "How should I allocate savings toward near-term goals (like buying a laptop) vs long-term retirement goals?" });
      tailored.push({ label: "🚩 Review Goal Status Under Bear Run", text: "Explain how goals might fall behind schedule if I invest short-term savings in volatile stocks." });
    } else {
      tailored.push({ label: "🧠 Avoid Herd FOMO Traps", text: "How can I avoid making emotional stock purchases based on social media hype or tips?" });
      tailored.push({ label: "📊 Audit Monthly Savings Rate", text: "Evaluate if my financial habits are sound relative to my savings compliance." });
    }

    tailored.push({ label: "🔍 Fact-Check Social Hype", text: "Validate this social media stock recommendation: Buy SUZLON ENERGY target 120 INR in 30 days!" });
    tailored.push({ label: "📂 Audit Multi-Broker Assets", text: "Analyze my consolidated asset allocation and platform concentration metrics." });

    return tailored.slice(0, 4);
  }, [profile]);

  // Unified Diversification Index calculation (0 to 100)
  const diversificationIndex = useMemo(() => {
    const sandboxAssets = portfolio?.holdings?.length || 0;
    const consolidatedAssets = consolidatedData?.holdings?.length || 0;
    const uniqueAssets = new Set();
    const uniquePlatforms = new Set();
    const uniqueAssetTypes = new Set();

    // Sandbox
    if (portfolio?.holdings) {
      portfolio.holdings.forEach(h => {
        uniqueAssets.add(h.asset.symbol);
        uniquePlatforms.add('Virtual Sandbox');
        uniqueAssetTypes.add(h.asset.type);
      });
      if (portfolio.balance > 0) {
        uniqueAssetTypes.add('CASH');
      }
    }

    // Consolidated
    if (consolidatedData?.holdings) {
      consolidatedData.holdings.forEach(h => {
        uniqueAssets.add(h.symbol);
        uniquePlatforms.add(h.platform);
        uniqueAssetTypes.add(h.assetType);
      });
    }

    const assetsCount = uniqueAssets.size;
    const platformsCount = uniquePlatforms.size;
    const typesCount = uniqueAssetTypes.size;

    if (assetsCount === 0) return 0;

    // Weight allocation:
    // Number of distinct assets: 10 pts each, max 40
    // Number of platforms: 15 pts each, max 30
    // Number of asset classes: 15 pts each, max 30
    const score = (assetsCount * 10) + (platformsCount * 15) + (typesCount * 15);
    return Math.min(100, score);
  }, [portfolio, consolidatedData]);

  // Manual Form Handlers
  const handleFormChange = (e) => {
    setHoldingForm({ ...holdingForm, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleAddManualHolding = async (e) => {
    e.preventDefault();
    const { platform, symbol, name, assetType, quantity, averageBuyPrice, currentPrice } = holdingForm;

    if (!symbol || !name || !quantity || !averageBuyPrice) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmittingHolding(true);
    setFormError('');
    setFormSuccess('');
    try {
      await api.post('/portfolio/consolidated', {
        platform,
        symbol: symbol.toUpperCase(),
        name,
        assetType,
        quantity: Number(quantity),
        averageBuyPrice: Number(averageBuyPrice),
        currentPrice: Number(currentPrice || averageBuyPrice)
      });
      setFormSuccess('Holding successfully added!');
      setHoldingForm({
        platform: 'Zerodha',
        symbol: '',
        name: '',
        assetType: 'STOCK',
        quantity: '',
        averageBuyPrice: '',
        currentPrice: ''
      });
      setShowAddForm(false);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to record consolidated holding.');
    } finally {
      setSubmittingHolding(false);
    }
  };

  const handleDeleteConsolidated = async (id) => {
    if (!window.confirm('Are you sure you want to remove this position from your consolidated account statement?')) return;
    try {
      await api.delete(`/portfolio/consolidated/${id}`);
      await fetchAllData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to remove position.');
    }
  };

  const handleClearConsolidated = async () => {
    if (!window.confirm('This will wipe out all consolidated external broker accounts. Proceed?')) return;
    try {
      await api.delete('/portfolio/consolidated/clear');
      await fetchAllData();
    } catch (err) {
      console.error('Wipe failed:', err);
      alert('Failed to clear holdings.');
    }
  };

  // CSV Drag and Drop Parsers
  const parseCSVText = async (text) => {
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length < 2) throw new Error("Statement is empty or missing rows");

      const parsedHoldings = [];
      const startIdx = isNaN(lines[0].split(',')[4]) ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 6) {
          parsedHoldings.push({
            platform: cols[0] || 'Manual',
            symbol: cols[1]?.toUpperCase() || 'UNKNOWN',
            name: cols[2] || cols[1] || 'Asset Name',
            assetType: ['STOCK', 'MUTUAL_FUND', 'GOLD', 'FD', 'BOND'].includes(cols[3]?.toUpperCase()) ? cols[3].toUpperCase() : 'STOCK',
            quantity: Number(cols[4]) || 0,
            averageBuyPrice: Number(cols[5]) || 0,
            currentPrice: Number(cols[6] || cols[5]) || 0
          });
        }
      }

      if (parsedHoldings.length === 0) {
        throw new Error("Columns could not be parsed. Template: Platform,Symbol,Name,AssetType,Quantity,AvgBuyPrice,CurrentPrice");
      }

      const res = await api.post('/portfolio/consolidated/bulk', { holdings: parsedHoldings });
      alert(`Statement parsed! Successfully consolidated ${res.data.count} external positions.`);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to parse CSV document.");
    }
  };

  const handleCSVFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCSV(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      await parseCSVText(event.target.result);
      setUploadingCSV(false);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    setUploadingCSV(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      await parseCSVText(event.target.result);
      setUploadingCSV(false);
    };
    reader.readAsText(file);
  };

  // Inject standard simulated broker holdings statement
  const handleInjectSampleStatement = async () => {
    const sampleHoldings = [
      { platform: 'Zerodha', symbol: 'INFY', name: 'Infosys Ltd', assetType: 'STOCK', quantity: 15, averageBuyPrice: 1420, currentPrice: 1550 },
      { platform: 'Zerodha', symbol: 'RELIANCE', name: 'Reliance Industries', assetType: 'STOCK', quantity: 8, averageBuyPrice: 2350, currentPrice: 2480 },
      { platform: 'Groww', symbol: 'HDFC_SENSEX', name: 'HDFC Sensex Index Fund', assetType: 'MUTUAL_FUND', quantity: 245.5, averageBuyPrice: 110, currentPrice: 122 },
      { platform: 'Groww', symbol: 'NIPPON_SMALL', name: 'Nippon India Small Cap Fund', assetType: 'MUTUAL_FUND', quantity: 120.4, averageBuyPrice: 85, currentPrice: 94 },
      { platform: 'INDmoney', symbol: 'SGB_AUG2026', name: 'Sovereign Gold Bond 2026', assetType: 'GOLD', quantity: 5, averageBuyPrice: 5200, currentPrice: 5900 },
      { platform: 'Manual', symbol: 'SBI_FD_2YR', name: 'SBI Fixed Deposit 2 Year', assetType: 'FD', quantity: 1, averageBuyPrice: 50000, currentPrice: 53500 },
    ];

    try {
      setUploadingCSV(true);
      const res = await api.post('/portfolio/consolidated/bulk', { holdings: sampleHoldings });
      alert(`Sample statement loaded! Injected ${res.data.count} multi-platform holdings.`);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      alert('Failed to load sample holdings.');
    } finally {
      setUploadingCSV(false);
    }
  };

  // Helper Custom Formatter for AI Advisor Responses
  const renderBotResponse = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    
    let inList = false;
    let listItems = [];
    
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];

    const flushList = (key) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-5 space-y-1.5 my-2">
            {listItems}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    const flushTable = (key) => {
      if (tableRows.length > 0 || tableHeaders.length > 0) {
        elements.push(
          <div key={`table-wrapper-${key}`} className="overflow-x-auto my-3 border border-brand-border rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              {tableHeaders.length > 0 && (
                <thead>
                  <tr className="bg-brand-light border-b border-brand-border font-bold">
                    {tableHeaders.map((h, i) => (
                      <th key={i} className="py-2.5 px-3.5 text-brand-primary font-bold uppercase tracking-wider text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-brand-border bg-white">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-brand-bg/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3.5 text-brand-ink font-medium">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
      }
      inTable = false;
    };

    const formatSpanText = (lineText) => {
      let html = lineText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/⚠️/g, '<span class="text-brand-warning font-bold">⚠️</span>')
        .replace(/🟢/g, '<span class="text-brand-success font-bold">🟢</span>')
        .replace(/🔴/g, '<span class="text-brand-danger class="font-bold">🔴</span>');
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Table lines parsing
      if (trimmed.startsWith('|')) {
        flushList(idx);
        inTable = true;
        const cols = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
        if (cols.every(c => c.startsWith(':') || c.startsWith('-') || c.endsWith('-'))) return;

        if (tableHeaders.length === 0 && tableRows.length === 0) {
          tableHeaders = cols;
        } else {
          tableRows.push(cols);
        }
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      // Bullet lists
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        inList = true;
        const content = trimmed.substring(1).trim();
        listItems.push(
          <li key={`li-${idx}-${listItems.length}`} className="text-brand-ink text-xs md:text-sm">
            {formatSpanText(content)}
          </li>
        );
        return;
      } else if (inList) {
        flushList(idx);
      }

      // Subheaders
      if (trimmed.startsWith('###')) {
        const headerText = trimmed.substring(3).trim();
        elements.push(
          <h4 key={idx} className="text-xs md:text-sm font-bold text-brand-primary mt-4 mb-2 flex items-center gap-1.5 border-b border-brand-border/60 pb-1.5 uppercase tracking-wider">
            {formatSpanText(headerText)}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('##')) {
        const headerText = trimmed.substring(2).trim();
        elements.push(
          <h3 key={idx} className="text-sm md:text-base font-extrabold text-brand-ink mt-5 mb-2.5">
            {formatSpanText(headerText)}
          </h3>
        );
        return;
      }

      // Normal text / warning boxes
      if (trimmed.length > 0) {
        const isWarning = trimmed.startsWith('⚠️') || trimmed.startsWith('🔴') || trimmed.includes('Warning') || trimmed.includes('Alert');
        if (isWarning) {
          elements.push(
            <div key={idx} className="my-3.5 p-4 bg-brand-warning/10 border border-brand-warning/20 rounded-xl text-brand-warning flex items-start gap-3 text-xs md:text-sm shadow-xs">
              <div className="mt-0.5 flex-shrink-0 text-brand-warning">⚠️</div>
              <div className="text-brand-ink">{formatSpanText(trimmed.replace(/^[⚠️🔴]\s*/, ''))}</div>
            </div>
          );
        } else {
          elements.push(
            <p key={idx} className="text-brand-ink text-xs md:text-sm leading-relaxed my-2">
              {formatSpanText(trimmed)}
            </p>
          );
        }
      }
    });

    flushList('final');
    flushTable('final');

    return <div className="space-y-1">{elements}</div>;
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-bg text-sm text-brand-muted">
        Syncing your FinAura diagnostic profiles...
      </div>
    );
  }

  // Diagnostics variables
  const scoreOverall = profile?.scores?.overall || 0;
  const virtualNetWorth = portfolio?.totalPortfolioValue || 100000;
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
            <p className="eyebrow">Production Dashboard</p>
            <h1 className="mt-2 font-serif text-4xl text-brand-ink md:text-5xl">My Profile & Portfolio</h1>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Analyze asset allocation, integrate external broker statements, compute diversification health indexes, and consult the AI advisor.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPortfolio}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs md:text-sm font-semibold text-white hover:opacity-90 transition-all shadow-card border-0 cursor-pointer"
            >
              <Download size={16} />
              Export {portfolioTab === 'sandbox' ? 'Sandbox' : 'Consolidated'} CSV
            </button>
          </div>
        </header>

        {/* Unified Diagnostic Status Cards */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          
          {/* Integrated Net Worth */}
          <div className="surface-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-primary"></div>
            <div className="flex items-center gap-2 text-brand-muted">
              <Landmark size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Integrated Net Worth</span>
            </div>
            <p className="text-xl font-bold text-brand-ink mt-3">
              ₹{(virtualNetWorth + consolidatedData.totalCurrentValue).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-brand-muted mt-1 block">
              Sandbox: ₹{virtualNetWorth.toLocaleString('en-IN')} | Real: ₹{consolidatedData.totalCurrentValue.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Diversification Health Check */}
          <div className="surface-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-gold"></div>
            <div className="flex items-center gap-2 text-brand-muted">
              <Coins size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Diversification Index</span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <p className={`text-xl font-bold ${
                diversificationIndex >= 70 ? 'text-brand-success' : diversificationIndex >= 40 ? 'text-brand-gold' : 'text-brand-danger'
              }`}>
                {diversificationIndex}
              </p>
              <span className="text-[10px] text-brand-muted">/ 100</span>
            </div>
            <span className="text-[10px] text-brand-muted mt-1 block">
              {diversificationIndex >= 70 ? 'Healthy allocation spread' : diversificationIndex >= 40 ? 'Moderate allocation concentration' : 'High concentration hazard'}
            </span>
          </div>

          {/* Diagnostic confidence */}
          <div className="surface-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-primary"></div>
            <div className="flex items-center gap-2 text-brand-muted">
              <Shield size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Confidence Rating</span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <p className="text-xl font-bold text-brand-ink">{scoreOverall}</p>
              <span className="text-[10px] text-brand-muted">/ 100</span>
            </div>
            <span className="text-[10px] text-brand-muted mt-1 block">
              {profile?.assessmentCompleted ? 'Full evaluation completed' : 'Initial assessment pending'}
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
        </div>

        {/* MAIN TABS DISPLAY */}
        <div>
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DIAGNOSTIC DASHBOARD */}
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
                    <h3 className="font-semibold text-brand-ink text-sm uppercase tracking-wider">Sandbox Allocation</h3>
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

                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-brand-muted">
                    {assetAllocationData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold">{item.name} ({Math.round((item.value / virtualNetWorth) * 100)}%)</span>
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

                  {profile && profile.monthlyIncome > 0 ? (
                    <div className="mt-4 pt-3 border-t border-brand-border flex justify-between items-center text-xs">
                      <span className="text-brand-muted">Savings compliance rate:</span>
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

            {/* TAB 2: PORTFOLIO LOGS (SANDBOX vs CONSOLIDATED) */}
            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Toggles for Sandbox vs Consolidated */}
                <div className="flex gap-2 bg-brand-light/60 p-1 rounded-xl w-fit border border-brand-border">
                  <button
                    onClick={() => setPortfolioTab('sandbox')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      portfolioTab === 'sandbox' ? 'bg-white text-brand-primary shadow-xs' : 'text-brand-muted hover:text-brand-ink'
                    }`}
                  >
                    Virtual Sandbox Portfolio
                  </button>
                  <button
                    onClick={() => setPortfolioTab('consolidated')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      portfolioTab === 'consolidated' ? 'bg-white text-brand-primary shadow-xs' : 'text-brand-muted hover:text-brand-ink'
                    }`}
                  >
                    Consolidated Broker Statements (Zerodha / Groww)
                  </button>
                </div>

                {/* VIRTUAL SANDBOX VIEW */}
                {portfolioTab === 'sandbox' && (
                  <div className="surface-card overflow-hidden">
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
                            <tr className="bg-brand-light/10 font-semibold border-t border-brand-border">
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
                  </div>
                )}

                {/* CONSOLIDATED BROKER VIEW */}
                {portfolioTab === 'consolidated' && (
                  <div className="space-y-6">
                    
                    {/* Visual Charts Row */}
                    {consolidatedData.holdings.length > 0 && (
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Donut Chart: Broker exposure */}
                        <div className="surface-card p-6 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-brand-ink text-xs uppercase tracking-wider">Broker Platform Exposure</h4>
                            <p className="text-[10px] text-brand-muted mt-1">Capital distribution across broker apps</p>
                          </div>
                          
                          <div className="w-full h-44 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={platformChartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={30}
                                  outerRadius={55}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {platformChartData.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                  contentStyle={{ background: '#FFFFFF', border: '1px solid #DDE5DE', borderRadius: '12px', fontSize: '11px' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px] text-brand-muted font-bold">
                            {platformChartData.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span>{item.name} ({Math.round((item.value / consolidatedData.totalCurrentValue) * 100)}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pie Chart: Asset Allocation */}
                        <div className="surface-card p-6 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-brand-ink text-xs uppercase tracking-wider">Asset Class Distribution</h4>
                            <p className="text-[10px] text-brand-muted mt-1">Unified asset class valuation</p>
                          </div>
                          
                          <div className="w-full h-44 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={consolidatedAssetData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={30}
                                  outerRadius={55}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {consolidatedAssetData.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                  contentStyle={{ background: '#FFFFFF', border: '1px solid #DDE5DE', borderRadius: '12px', fontSize: '11px' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px] text-brand-muted font-bold">
                            {consolidatedAssetData.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span>{item.name} ({Math.round((item.value / consolidatedData.totalCurrentValue) * 100)}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Uploader / Actions Panel */}
                    <div className="grid gap-6 md:grid-cols-3">
                      
                      {/* Drag & Drop CSV panel */}
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`md:col-span-2 border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col justify-center items-center gap-3 bg-white ${
                          dragOver ? 'border-brand-primary bg-brand-light/35' : 'border-brand-border bg-white'
                        }`}
                      >
                        <Upload size={32} className="text-brand-muted animate-pulse" />
                        <div>
                          <h4 className="font-semibold text-brand-ink text-sm">Consolidate Broker Statements</h4>
                          <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto leading-relaxed">
                            Drag and drop a broker trade CSV or click to select a file. Columns required: Platform, Symbol, Name, AssetType, Quantity, AvgBuyPrice, CurrentPrice.
                          </p>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <label className="rounded-lg bg-brand-light text-brand-primary text-xs font-bold px-4 py-2 hover:bg-brand-sage/20 transition-all cursor-pointer border border-brand-border">
                            {uploadingCSV ? 'Uploading Statement...' : 'Select Trade File'}
                            <input 
                              type="file" 
                              accept=".csv" 
                              onChange={handleCSVFileSelect} 
                              disabled={uploadingCSV} 
                              className="hidden" 
                            />
                          </label>
                          <button
                            onClick={handleInjectSampleStatement}
                            className="rounded-lg bg-brand-primary text-white text-xs font-bold px-4 py-2 hover:opacity-90 transition-all border-0 cursor-pointer"
                          >
                            Inject Sample Statement
                          </button>
                        </div>
                      </div>

                      {/* Manual adding form toggle / summary card */}
                      <div className="surface-card p-6 flex flex-col justify-between items-center text-center gap-3">
                        <FileText size={32} className="text-brand-primary" />
                        <div>
                          <h4 className="font-semibold text-brand-ink text-sm">Manual Position Entry</h4>
                          <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                            Don't have a CSV file? Insert holdings manually for Zerodha, Groww, or off-market physical Fixed Deposits and Gold assets.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddForm(prev => !prev)}
                          className="rounded-lg bg-white border border-brand-border hover:bg-brand-light/50 text-brand-primary text-xs font-bold px-4 py-2 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={14} />
                          {showAddForm ? 'Close Entry Form' : 'Add Position Manually'}
                        </button>
                      </div>
                    </div>

                    {/* Manual Holding Input Drawer */}
                    {showAddForm && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="surface-card p-6 border border-brand-border bg-white rounded-2xl"
                      >
                        <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-2">
                          <h4 className="font-bold text-brand-primary text-sm">New Portfolio Position Entry</h4>
                          <button onClick={() => setShowAddForm(false)} className="text-brand-muted hover:text-brand-ink border-0 bg-transparent cursor-pointer"><X size={16} /></button>
                        </div>

                        <form onSubmit={handleAddManualHolding} className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Broker Platform</label>
                            <select 
                              name="platform"
                              value={holdingForm.platform}
                              onChange={handleFormChange}
                              className="w-full text-xs font-semibold p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                            >
                              <option value="Zerodha">Zerodha (Kite)</option>
                              <option value="Groww">Groww</option>
                              <option value="INDmoney">INDmoney</option>
                              <option value="Manual">Off-market / Manual</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Ticker Symbol *</label>
                            <input 
                              type="text" 
                              name="symbol" 
                              placeholder="e.g. TCS"
                              value={holdingForm.symbol}
                              onChange={handleFormChange}
                              className="w-full text-xs p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Asset Name *</label>
                            <input 
                              type="text" 
                              name="name" 
                              placeholder="e.g. Tata Consultancy"
                              value={holdingForm.name}
                              onChange={handleFormChange}
                              className="w-full text-xs p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Asset Class</label>
                            <select 
                              name="assetType"
                              value={holdingForm.assetType}
                              onChange={handleFormChange}
                              className="w-full text-xs font-semibold p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                            >
                              <option value="STOCK">STOCK</option>
                              <option value="MUTUAL_FUND">MUTUAL FUND</option>
                              <option value="GOLD">GOLD</option>
                              <option value="FD">FIXED DEPOSIT</option>
                              <option value="BOND">BOND</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Quantity owned *</label>
                            <input 
                              type="number" 
                              name="quantity" 
                              step="any"
                              value={holdingForm.quantity}
                              onChange={handleFormChange}
                              className="w-full text-xs p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Avg Purchase Cost (INR) *</label>
                            <input 
                              type="number" 
                              name="averageBuyPrice" 
                              step="any"
                              value={holdingForm.averageBuyPrice}
                              onChange={handleFormChange}
                              className="w-full text-xs p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Current Price (Optional)</label>
                            <input 
                              type="number" 
                              name="currentPrice" 
                              step="any"
                              value={holdingForm.currentPrice}
                              onChange={handleFormChange}
                              className="w-full text-xs p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              type="submit"
                              disabled={submittingHolding}
                              className="w-full rounded-lg bg-brand-primary hover:opacity-95 text-white text-xs font-bold py-2.5 transition-all cursor-pointer border-0 shadow-card"
                            >
                              {submittingHolding ? 'Recording...' : 'Add Position'}
                            </button>
                          </div>
                        </form>
                        {formError && <p className="mt-2 text-xs text-brand-danger font-semibold">{formError}</p>}
                        {formSuccess && <p className="mt-2 text-xs text-brand-success font-semibold">{formSuccess}</p>}
                      </motion.div>
                    )}

                    {/* Consolidated holdings list */}
                    <div className="surface-card overflow-hidden">
                      <div className="px-6 py-4 border-b border-brand-border bg-brand-light/20 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-brand-ink text-sm">Consolidated Statement Positions</h4>
                          <p className="text-[10px] text-brand-muted">Aggregated summary of external broker accounts</p>
                        </div>
                        {consolidatedData.holdings.length > 0 && (
                          <button
                            onClick={handleClearConsolidated}
                            className="text-brand-danger text-xs font-bold hover:underline bg-transparent border-0 cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 size={13} />
                            Wipe Statement
                          </button>
                        )}
                      </div>

                      {consolidatedData.holdings.length === 0 ? (
                        <div className="p-16 text-center space-y-4 text-brand-muted text-sm font-medium">
                          No broker positions consolidated yet. Select "Inject Sample Statement" above to try it instantly!
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-brand-ink">
                            <thead>
                              <tr className="border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-brand-light/10">
                                <th className="py-4 px-6">Asset symbol</th>
                                <th className="py-4 px-6">Name</th>
                                <th className="py-4 px-6">Broker App</th>
                                <th className="py-4 px-6">Asset Class</th>
                                <th className="py-4 px-6 text-right">Units</th>
                                <th className="py-4 px-6 text-right">Avg cost</th>
                                <th className="py-4 px-6 text-right">Current Value</th>
                                <th className="py-4 px-6 text-right">Returns (ROI %)</th>
                                <th className="py-4 px-6 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border text-xs">
                              {consolidatedData.holdings.map((h) => {
                                const isGain = h.gainLoss >= 0;
                                return (
                                  <tr key={h._id} className="hover:bg-brand-light/15 transition-colors">
                                    <td className="py-4 px-6 font-bold">{h.symbol}</td>
                                    <td className="py-4 px-6 text-brand-muted font-medium">{h.name}</td>
                                    <td className="py-4 px-6">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        h.platform === 'Zerodha' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        h.platform === 'Groww' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        'bg-purple-50 text-purple-700 border-purple-100'
                                      }`}>
                                        {h.platform}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-brand-muted font-medium">{h.assetType}</td>
                                    <td className="py-4 px-6 text-right">{h.quantity}</td>
                                    <td className="py-4 px-6 text-right">₹{h.averageBuyPrice.toLocaleString('en-IN')}</td>
                                    <td className="py-4 px-6 text-right font-bold">₹{h.currentValue.toLocaleString('en-IN')}</td>
                                    <td className="py-4 px-6 text-right">
                                      <span className={`font-bold flex items-center justify-end ${isGain ? 'text-brand-success' : 'text-brand-danger'}`}>
                                        {isGain ? '+' : ''}
                                        {h.roi.toFixed(1)}% (₹{h.gainLoss.toLocaleString('en-IN')})
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                      <button
                                        onClick={() => handleDeleteConsolidated(h._id)}
                                        className="text-brand-danger hover:text-red-700 hover:scale-105 transition-all bg-transparent border-0 cursor-pointer"
                                        title="Delete position"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr className="bg-brand-light/10 font-bold border-t border-brand-border">
                                <td className="py-4 px-6" colSpan={3}>TOTAL EXTERNAL INVESTMENTS</td>
                                <td className="py-4 px-6 text-right" colSpan={3}>Cost: ₹{consolidatedData.totalInvestedValue.toLocaleString('en-IN')}</td>
                                <td className="py-4 px-6 text-right">₹{consolidatedData.totalCurrentValue.toLocaleString('en-IN')}</td>
                                <td className="py-4 px-6 text-right" colSpan={2}>
                                  <span className={consolidatedData.overallGainLoss >= 0 ? 'text-brand-success' : 'text-brand-danger'}>
                                    {consolidatedData.overallGainLoss >= 0 ? '+' : ''}
                                    {consolidatedData.overallGainLossPercent.toFixed(1)}% (₹{consolidatedData.overallGainLoss.toLocaleString('en-IN')})
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Profile;
