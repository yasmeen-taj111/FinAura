import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Landmark, ArrowUpRight, ArrowDownRight, RefreshCw,
  ShoppingBag, Trash2, History, AlertTriangle, Play, Award, 
  Search, SlidersHorizontal, Info, ChevronRight, CheckCircle2, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../services/api';

const Sandbox = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [sips, setSips] = useState([]);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs & Filters
  const [activeTab, setActiveTab] = useState('market'); // 'market', 'portfolio', 'sips', 'transactions', 'scenarios'
  const [marketFilter, setMarketFilter] = useState('ALL'); // 'ALL', 'STOCK', 'MUTUAL_FUND', 'FD', 'BOND', 'GOLD'
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Asset for details panel
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [compareAssetId, setCompareAssetId] = useState('');
  const [chartTimeline, setChartTimeline] = useState('1M'); // '1W', '1M', '1Y'

  // Inline Order Form State (Right Panel)
  const [tradeType, setTradeType] = useState('BUY'); // 'BUY', 'SELL', 'SIP'
  const [tradeQty, setTradeQty] = useState(1);
  const [sipAmount, setSipAmount] = useState(1000);
  const [sipFrequency, setSipFrequency] = useState('MONTHLY');
  
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');

  // Market Simulator State
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(null);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(true);

  // Local Scenario History logs
  const [scenarioHistory, setScenarioHistory] = useState([
    {
      id: 1,
      event: 'NEUTRAL',
      title: 'Sandbox Seeding Complete',
      timestamp: new Date(),
      description: 'Your ₹1,00,000 virtual cash balance has been allocated. You can make buy/sell transactions or start a systematic virtual SIP.',
      education: 'Rupee-cost averaging via Systematic Investment Plans (SIPs) is designed to handle market fluctuations by buying fewer units when prices are high, and more units when prices are low.'
    }
  ]);

  const fetchAllData = async (shouldKeepSelected = false) => {
    try {
      const [portRes, assetsRes, transRes, sipsRes, profileRes, goalsRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/portfolio/assets'),
        api.get('/portfolio/transactions'),
        api.get('/portfolio/sips'),
        api.get('/profile'),
        api.get('/goals')
      ]);
      setPortfolio(portRes.data);
      setAssets(assetsRes.data);
      setTransactions(transRes.data);
      setSips(sipsRes.data);
      setProfile(profileRes.data);
      setGoals(goalsRes.data);

      // Default select the first asset if none is selected
      if (assetsRes.data?.length > 0 && !shouldKeepSelected) {
        const defaultAsset = assetsRes.data.find(a => a.symbol === 'TCS') || assetsRes.data[0];
        setSelectedAsset(defaultAsset);
      } else if (shouldKeepSelected && selectedAsset) {
        // Sync selected asset with fresh data
        const updated = assetsRes.data.find(a => a._id === selectedAsset._id);
        if (updated) setSelectedAsset(updated);
      }
    } catch (err) {
      console.error('Error fetching sandbox details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleExecuteTrade = async () => {
    setTradeLoading(true);
    setTradeError('');
    setTradeSuccess('');
    
    try {
      if (tradeType === 'SIP') {
        if (!sipAmount || sipAmount < 500) {
          setTradeError('Please enter a valid SIP amount (minimum ₹500).');
          setTradeLoading(false);
          return;
        }

        const res = await api.post('/portfolio/sips', {
          assetId: selectedAsset._id,
          amount: Number(sipAmount),
          frequency: sipFrequency
        });

        setTradeSuccess(`Successfully initiated Virtual SIP! First installment executed.`);
        setSipAmount(1000);

        if (res.data.badgeUnlocked) {
          setBadgeUnlocked(res.data.badgeUnlocked);
          window.dispatchEvent(new Event('update-progress'));
        }
      } else {
        if (!tradeQty || tradeQty <= 0) {
          setTradeError('Please enter a valid quantity.');
          setTradeLoading(false);
          return;
        }

        const res = await api.post('/portfolio/trade', {
          assetId: selectedAsset._id,
          type: tradeType,
          quantity: Number(tradeQty)
        });

        setTradeSuccess(`Successfully executed ${tradeType} order!`);
        setTradeQty(1);

        if (res.data.badgeUnlocked) {
          setBadgeUnlocked(res.data.badgeUnlocked);
          window.dispatchEvent(new Event('update-progress'));
        }
      }

      await fetchAllData(true);
    } catch (err) {
      console.error('Trade execution failed:', err);
      setTradeError(err.response?.data?.message || 'Transaction rejected. Check balance.');
    } finally {
      setTradeLoading(false);
    }
  };

  const handleCancelSip = async (sipId) => {
    if (!window.confirm('Are you sure you want to cancel this virtual Systematic Investment Plan?')) return;
    try {
      await api.delete(`/portfolio/sips/${sipId}`);
      await fetchAllData(true);
    } catch (err) {
      console.error('Failed to cancel SIP:', err);
      alert('Failed to cancel SIP subscription.');
    }
  };

  const handleSimulateMarket = async (eventType) => {
    setSimulating(true);
    setSimMessage('');
    setBadgeUnlocked(null);
    try {
      const res = await api.post('/portfolio/simulate-market', { eventType });
      
      let alertMsg = '';
      let explanation = '';
      if (eventType === 'BULL_RUN') {
        alertMsg = '📈 Market Scenario: Positive corporate earnings trigger a strong market bull run! Stocks index values surge.';
        explanation = 'In a Bull market, retail confidence spikes, and buying momentum drives prices up. It is tempting to buy everything, but watch out for valuation bubbles. Large-cap stocks grow steadily, while speculative stocks rally aggressively.';
      } else if (eventType === 'BEAR_MARKET') {
        alertMsg = '📉 Market Scenario: Inflation worries trigger interest rate hikes. Equities corrected across the board.';
        explanation = 'A Bear market is characterized by widespread pessimism. Equity valuations drop. Diversified assets like Fixed Deposits and Gold act as structural anchors to limit drawdown. Continuing SIPs here accumulates more units at discounted prices—boosting long-term compounding when the market recovers.';
      } else if (eventType === 'FLASH_CRASH') {
        alertMsg = '💥 Extreme Event: Algorithmic sell-offs create a -25% market flash crash! High volatility assets hit hardest.';
        explanation = 'Flash crashes are liquidity shocks driven by high-frequency algorithmic execution. While portfolio values drop dramatically in minutes, these are typically short-term panics. Selling during a crash locks in paper losses. Historically, markets recover when fundamental earnings remain intact.';
      } else {
        alertMsg = '🔄 Market Scenario: General price adjustments completed. Moderate fluctuations recorded.';
        explanation = 'Normal market days have minor price swings (volatility). Rupee-cost averaging (SIPs) is designed to handle these fluctuations by buying fewer units when prices are high, and more units when prices are low.';
      }

      setSimMessage(alertMsg);

      // Append to scenario history
      setScenarioHistory(prev => [
        {
          id: Date.now(),
          event: eventType,
          title: eventType.replace('_', ' '),
          timestamp: new Date(),
          description: alertMsg,
          education: explanation
        },
        ...prev
      ]);

      if (res.data.badgeUnlocked) {
        setBadgeUnlocked(res.data.badgeUnlocked);
        window.dispatchEvent(new Event('update-progress'));
      }

      await fetchAllData(true);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleProcessMonthlySips = async () => {
    setSimulating(true);
    setSimMessage('');
    try {
      const res = await api.post('/portfolio/sips/process-month');
      
      let message = '📅 1 Month Advanced! Market prices adjusted.';
      let successList = [];
      if (res.data.executions && res.data.executions.length > 0) {
        const successExecutions = res.data.executions.filter(e => e.status === 'SUCCESS');
        const failedExecutions = res.data.executions.filter(e => e.status === 'FAILED');
        
        if (successExecutions.length > 0) {
          successList = successExecutions.map(e => e.assetSymbol);
          message += ` Executed ${successExecutions.length} SIP installment(s) for ${successList.join(', ')}.`;
        }
        if (failedExecutions.length > 0) {
          message += ` ⚠️ Failed ${failedExecutions.length} SIP installment(s) due to insufficient cash balance.`;
        }
      } else {
        message += ' No active virtual SIPs were due for processing this month.';
      }

      setSimMessage(message);
      
      setScenarioHistory(prev => [
        {
          id: Date.now(),
          event: 'TIME_ADVANCE',
          title: 'Time Travel (1 Month)',
          timestamp: new Date(),
          description: message,
          education: `Time-based SIP compounding allows you to smooth out buying prices automatically. Notice how the average purchase price of your holdings matches the moving average of the asset's price, shielding you from trying to time the market.`
        },
        ...prev
      ]);

      await fetchAllData(true);
    } catch (err) {
      console.error('Simulation of month failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  const assetTypes = [
    { label: 'All', value: 'ALL' },
    { label: 'Stocks', value: 'STOCK' },
    { label: 'Mutual Funds', value: 'MUTUAL_FUND' },
    { label: 'Gold', value: 'GOLD' },
    { label: 'Fixed Deposits', value: 'FD' },
    { label: 'Bonds', value: 'BOND' }
  ];

  const tourSteps = [
    {
      title: 'Welcome to the Investment Sandbox',
      text: 'This is a safe practice space. You start with ₹1,00,000 of virtual cash, so no real money is invested or at risk.',
    },
    {
      title: 'Prices and charts are simulated',
      text: 'The market board uses educational sample prices and generated charts. Use it to learn how risk and price changes work—not as a live market-data source or a buy recommendation.',
    },
    {
      title: 'Choose an asset, then practise',
      text: 'Select a stock, fund, gold, bond, or FD to review its risk label. On the right, you can place a virtual buy or sell order, or start a virtual SIP.',
    },
    {
      title: 'Test market scenarios',
      text: '“Fluctuate prices” applies a small simulated movement. Bull Run raises eligible prices, Bear Cycle simulates a broad fall, and Flash Crash creates a sharper short-term fall. These are learning scenarios, not predictions.',
    },
    {
      title: 'Advance your virtual month',
      text: '“Simulate 1 Month” moves the sandbox forward, adjusts simulated prices, and processes any active virtual SIP instalments. Check your health score afterwards to see the impact.',
    },
  ];

  // Filters & Search logic
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (a.symbol === 'CASH') return false; // Hide cash from buy table
      const matchesType = marketFilter === 'ALL' || a.type === marketFilter;
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            a.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [assets, marketFilter, searchTerm]);

  // Combined Chart Data generator (Primary Selected Asset + Compare Asset)
  const combinedChartData = useMemo(() => {
    if (!selectedAsset) return [];
    
    const daysCount = chartTimeline === '1W' ? 7 : chartTimeline === '1M' ? 30 : 90;
    
    const seed1 = selectedAsset.symbol.charCodeAt(0) + (selectedAsset.symbol.charCodeAt(1) || 0);
    const vol1 = (selectedAsset.volatility || 10) / 100 / 4;
    
    const compareAsset = compareAssetId ? assets.find(a => a._id === compareAssetId) : null;
    const seed2 = compareAsset ? (compareAsset.symbol.charCodeAt(0) + (compareAsset.symbol.charCodeAt(1) || 0)) : 0;
    const vol2 = compareAsset ? ((compareAsset.volatility || 10) / 100 / 4) : 0;

    let price1 = selectedAsset.previousPrice || selectedAsset.currentPrice * 0.97;
    let price2 = compareAsset ? (compareAsset.previousPrice || compareAsset.currentPrice * 0.97) : 0;
    
    const points = [];
    let currentVal1 = price1;
    let currentVal2 = price2;
    
    for (let i = daysCount; i >= 1; i--) {
      // Seeded swing
      const swing1 = (Math.sin(seed1 + i + selectedAsset.currentPrice) * 1000) % 1;
      currentVal1 = currentVal1 * (1 + swing1 * vol1);
      
      if (compareAsset) {
        const swing2 = (Math.sin(seed2 + i + compareAsset.currentPrice) * 1000) % 1;
        currentVal2 = currentVal2 * (1 + swing2 * vol2);
      }
      
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

      const pt = {
        name: label,
        [selectedAsset.symbol]: Math.round(Math.max(1, currentVal1) * 100) / 100
      };
      if (compareAsset) {
        pt[compareAsset.symbol] = Math.round(Math.max(1, currentVal2) * 100) / 100;
      }
      points.push(pt);
    }

    // Today
    const finalPt = {
      name: 'Today',
      [selectedAsset.symbol]: selectedAsset.currentPrice
    };
    if (compareAsset) {
      finalPt[compareAsset.symbol] = compareAsset.currentPrice;
    }
    points.push(finalPt);

    return points;
  }, [selectedAsset, assets, compareAssetId, chartTimeline]);

  // Check if daily return is positive or negative
  const isDailyPriceGain = useMemo(() => {
    if (!selectedAsset) return true;
    return selectedAsset.currentPrice >= selectedAsset.previousPrice;
  }, [selectedAsset]);

  // Get selected asset compared details
  const compareAsset = useMemo(() => {
    return compareAssetId ? assets.find(a => a._id === compareAssetId) : null;
  }, [compareAssetId, assets]);

  // Compute holdings for the selected asset
  const selectedAssetHoldings = useMemo(() => {
    if (!selectedAsset || !portfolio?.holdings) return null;
    return portfolio.holdings.find(h => h.assetId.toString() === selectedAsset._id.toString());
  }, [selectedAsset, portfolio]);

  const cashBalance = portfolio?.balance || 0;
  const netWorth = portfolio?.totalPortfolioValue || 100000;

  const allocationBreakdown = useMemo(() => {
    const list = [{ name: 'Cash', value: cashBalance, color: '#8FAF9A' }];
    const colors = ['#064E3B', '#083C32', '#D89B24', '#C68A4A', '#167A55', '#3B82F6'];
    (portfolio?.holdings || []).forEach((h, idx) => {
      list.push({
        name: h.asset.symbol,
        value: h.currentValue,
        color: colors[idx % colors.length]
      });
    });
    return list.filter(item => item.value > 0);
  }, [portfolio]);

  const selectedRiskMessage = useMemo(() => {
    if (!selectedAsset) return null;
    const riskScore = profile?.scores?.riskUnderstanding || 0;
    if (!profile?.assessmentCompleted) return 'Complete the financial assessment to receive a personalised risk check. This asset data remains simulated.';
    if (['High', 'Very High'].includes(selectedAsset.riskLevel) && riskScore < 45) {
      return `Your risk-understanding score is ${riskScore}/100. This simulated ${selectedAsset.riskLevel.toLowerCase()}-risk asset is a learning opportunity—run a bear-cycle test before adding it.`;
    }
    if (selectedAsset.riskLevel === 'Very High') return 'Very-high-risk simulated asset: use a long horizon in this lab and test a downturn before investing more.';
    return 'Simulation reminder: this price and chart are educational estimates, not live market data or a recommendation.';
  }, [selectedAsset, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-brand-ink">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-brand-sage/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary animate-spin"></div>
        </div>
        <p className="mt-4 text-brand-muted text-xs font-semibold">Connecting to virtual market exchanges...</p>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="page-shell px-5 py-8 md:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <AnimatePresence>
          {showTour && (
=======
    <div className="min-h-screen py-10 px-6 md:px-12 relative overflow-hidden bg-brand-bg text-slate-100">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 z-10 relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest block mb-2">VIRTUAL TRADING ENVIRONMENT</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Investment Learning Sandbox</h1>
          <p className="text-brand-muted text-xs md:text-sm max-w-xl leading-relaxed">
            Practice real trading decisions with zero risk. Use ₹1,00,000 virtual balance to buy and sell stocks, index funds, bonds, and test portfolio survival against simulated crashes.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSimulateMarket('NEUTRAL')}
            disabled={simulating}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regular Fluctuation</span>
          </button>
        </div>
      </div>

      {/* Notification Toast for Simulations */}
      {simMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto p-4 bg-indigo-500/10 border border-brand-primary/25 rounded-2xl mb-8 flex items-center justify-between gap-4 text-xs font-medium text-slate-200"
        >
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-brand-secondary animate-pulse" />
            <span>{simMessage}</span>
          </div>
          <button onClick={() => setSimMessage('')} className="text-[10px] text-slate-500 hover:text-white font-bold">Dismiss</button>
        </motion.div>
      )}

      {/* Grid: Stats & Simulator Triggers */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 z-10 relative">
        
        {/* Core Wallet Stat */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500"></div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Total Net Worth</span>
            <h2 className="text-3xl font-extrabold text-white mt-1.5">₹{netWorth.toLocaleString()}</h2>
            <div className="flex items-center space-x-1.5 mt-2.5">
              {portfolio?.overallGainLoss >= 0 ? (
                <span className="text-xs text-brand-success font-bold flex items-center bg-brand-success/10 px-2.5 py-0.5 rounded-lg border border-brand-success/15">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +{portfolio?.overallGainLossPercent.toFixed(2)}% (₹{portfolio?.overallGainLoss.toLocaleString()})
                </span>
              ) : (
                <span className="text-xs text-brand-danger font-bold flex items-center bg-brand-danger/10 px-2.5 py-0.5 rounded-lg border border-brand-danger/15">
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  {portfolio?.overallGainLossPercent.toFixed(2)}% (₹{Math.abs(portfolio?.overallGainLoss).toLocaleString()})
                </span>
              )}
              <span className="text-[10px] text-brand-muted font-medium">Return on Cost</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
            <div>
              <span className="text-brand-muted text-[10px] block uppercase">Free Cash Balance</span>
              <span className="text-slate-200">₹{cashBalance.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-brand-muted text-[10px] block uppercase">Value of Holdings</span>
              <span className="text-slate-200">₹{totalAssetsValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Portfolio asset allocation breakdown bar */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Asset Allocation</h3>
            <p className="text-brand-muted text-[10px] mb-5">Diversification percentage based on valuation</p>
          </div>

          <div className="space-y-4">
            {/* Allocation Stack Bar */}
            <div className="w-full h-4 bg-slate-900 rounded-full flex overflow-hidden border border-white/5">
              {allocationBreakdown.map((item, idx) => {
                const percent = (item.value / netWorth) * 100;
                if (percent <= 0) return null;
                return (
                  <div
                    key={idx}
                    className={`h-full ${item.color}`}
                    style={{ width: `${percent}%` }}
                    title={`${item.name}: ${percent.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Legends list */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-slate-300">
              {allocationBreakdown.map((item, idx) => {
                const percent = (item.value / netWorth) * 100;
                if (percent <= 0) return null;
                return (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <div className={`w-2.5 h-2.5 rounded ${item.color}`} />
                    <span>{item.name} ({percent.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scenario Simulator triggers */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Market Scenario Injector</h3>
            <p className="text-brand-muted text-[10px] mb-4">Simulate financial cycles and test portfolio resistance</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSimulateMarket('BULL_RUN')}
              disabled={simulating}
              className="flex flex-col items-center justify-center p-3 bg-emerald-500/10 border border-brand-success/15 hover:bg-emerald-500/25 rounded-2xl transition-all disabled:opacity-50 cursor-pointer group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📈</span>
              <span className="text-[10px] font-bold text-brand-success mt-1.5">Bull Run</span>
            </button>

            <button
              onClick={() => handleSimulateMarket('BEAR_MARKET')}
              disabled={simulating}
              className="flex flex-col items-center justify-center p-3 bg-amber-500/10 border border-brand-warning/15 hover:bg-amber-500/25 rounded-2xl transition-all disabled:opacity-50 cursor-pointer group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📉</span>
              <span className="text-[10px] font-bold text-brand-warning mt-1.5">Bear Cycle</span>
            </button>

            <button
              onClick={() => handleSimulateMarket('FLASH_CRASH')}
              disabled={simulating}
              className="flex flex-col items-center justify-center p-3 bg-rose-500/10 border border-brand-danger/15 hover:bg-rose-500/25 rounded-2xl transition-all disabled:opacity-50 cursor-pointer group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">💥</span>
              <span className="text-[10px] font-bold text-brand-danger mt-1.5">Flash Crash</span>
            </button>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex space-x-2 border-b border-white/5 mb-8 z-10 relative">
        {[
          { id: 'portfolio', label: 'My Holdings', icon: Landmark },
          { id: 'market', label: 'Market Tickers', icon: Compass },
          { id: 'transactions', label: 'Transaction Logs', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
                active
                  ? 'border-brand-secondary text-brand-secondary'
                  : 'border-transparent text-brand-muted hover:text-brand-ink'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main View Area */}
      <div className="max-w-7xl mx-auto z-10 relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PORTFOLIO HOLDINGS */}
          {activeTab === 'portfolio' && (
>>>>>>> origin/front
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-end justify-center bg-brand-ink/35 p-4 backdrop-blur-[1px] md:items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                className="w-full max-w-md rounded-3xl border border-brand-border bg-white p-6 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Sandbox tour · {tourStep + 1} of {tourSteps.length}</p>
                    <h2 className="mt-2 text-xl font-bold text-brand-ink">{tourSteps[tourStep].title}</h2>
                  </div>
                  <button onClick={() => setShowTour(false)} className="border-0 bg-transparent text-[11px] font-bold text-brand-muted hover:text-brand-ink cursor-pointer">Skip</button>
                </div>
                <p className="mt-4 text-sm leading-6 text-brand-muted">{tourSteps[tourStep].text}</p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="flex gap-1.5">{tourSteps.map((_, index) => <span key={index} className={`h-1.5 w-5 rounded-full ${index <= tourStep ? 'bg-brand-primary' : 'bg-brand-border'}`} />)}</div>
                  <button onClick={() => tourStep === tourSteps.length - 1 ? setShowTour(false) : setTourStep(step => step + 1)} className="rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white border-0 cursor-pointer">{tourStep === tourSteps.length - 1 ? 'Start exploring' : 'Next'}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header Hero Section */}
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Virtual Trading Environment · Simulated Data</p>
            <h1 className="mt-2 font-serif text-4xl text-brand-ink md:text-5xl">Investment Sandbox</h1>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Practice with ₹1,00,000 virtual INR, test cash flows, configure virtual SIPs, and see how scenarios affect a portfolio. Prices, charts, and events are simulated for education—not live market data.
            </p>
          </div>

          {/* Scenario / Time travel injectors */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setTourStep(0); setShowTour(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-brand-border px-4 py-2.5 text-xs font-bold text-brand-primary hover:bg-brand-light transition-all shadow-card cursor-pointer"
            >
              <Info size={15} />
              Tour
            </button>
            <button
              onClick={() => handleSimulateMarket('NEUTRAL')}
              disabled={simulating}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-brand-border px-4 py-2.5 text-xs font-bold text-brand-primary hover:bg-brand-light transition-all shadow-card cursor-pointer"
            >
              <RefreshCw size={15} className={simulating ? 'animate-spin' : ''} />
              Fluctuate Prices
            </button>
            <button
              onClick={handleProcessMonthlySips}
              disabled={simulating}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 transition-all shadow-card border-0 cursor-pointer"
            >
              <Play size={15} />
              Simulate 1 Month (Process SIPs)
            </button>
          </div>
        </header>

        {/* Simulation Toast alert */}
        {simMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-brand-light border border-brand-border rounded-2xl mb-8 flex items-center justify-between gap-4 text-xs font-bold text-brand-ink shadow-card"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-brand-warning animate-bounce" size={18} />
              <span>{simMessage}</span>
            </div>
            <button onClick={() => setSimMessage('')} className="text-[10px] text-brand-muted hover:text-brand-ink bg-transparent border-0 cursor-pointer font-bold">Dismiss</button>
          </motion.div>
        )}

        {/* Market Stats & Scenario injectors */}
        <section className="grid gap-6 md:grid-cols-3 mb-8">
          
          {/* Net Worth */}
          <div className="surface-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-primary"></div>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Sandbox Net Worth</span>
            <p className="text-2xl font-bold text-brand-ink mt-2">₹{netWorth.toLocaleString('en-IN')}</p>
            
            <div className="flex items-center space-x-1.5 mt-2">
              {portfolio?.overallGainLoss >= 0 ? (
                <span className="text-xs text-brand-success font-bold flex items-center bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +{portfolio?.overallGainLossPercent.toFixed(2)}% (₹{portfolio?.overallGainLoss.toLocaleString('en-IN')})
                </span>
              ) : (
                <span className="text-xs text-brand-danger font-bold flex items-center bg-red-50 px-2.5 py-0.5 rounded border border-red-100">
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  {portfolio?.overallGainLossPercent.toFixed(2)}% (₹{Math.abs(portfolio?.overallGainLoss).toLocaleString('en-IN')})
                </span>
              )}
            </div>
          </div>

          {/* Allocation Breakdown Bar */}
          <div className="surface-card p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Sandbox Allocation</span>
              <div className="w-full h-3 bg-brand-light rounded-full flex overflow-hidden border border-brand-border mt-3">
                {allocationBreakdown.map((item, idx) => {
                  const percent = (item.value / netWorth) * 100;
                  return (
                    <div
                      key={idx}
                      className="h-full"
                      style={{ width: `${percent}%`, backgroundColor: item.color }}
                      title={`${item.name}: ${percent.toFixed(1)}%`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-bold text-brand-muted mt-2">
              {allocationBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-xs" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({Math.round((item.value / netWorth) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Macro Scenario injector panel */}
          <div className="surface-card p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Macro Cycle Stress-Tester</span>
              <p className="text-[10px] text-brand-muted mt-0.5">Test portfolio survival against simulated economic cycles</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                onClick={() => handleSimulateMarket('BULL_RUN')}
                disabled={simulating}
                className="flex flex-col items-center justify-center p-2.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/50 rounded-xl transition-all disabled:opacity-50 cursor-pointer group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">📈</span>
                <span className="text-[9px] font-bold text-brand-success mt-1">Bull Run</span>
              </button>

              <button
                onClick={() => handleSimulateMarket('BEAR_MARKET')}
                disabled={simulating}
                className="flex flex-col items-center justify-center p-2.5 bg-amber-50 border border-amber-100 hover:bg-amber-100/50 rounded-xl transition-all disabled:opacity-50 cursor-pointer group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">📉</span>
                <span className="text-[9px] font-bold text-brand-warning mt-1">Bear Cycle</span>
              </button>

              <button
                onClick={() => handleSimulateMarket('FLASH_CRASH')}
                disabled={simulating}
                className="flex flex-col items-center justify-center p-2.5 bg-red-50 border border-red-100 hover:bg-red-100/50 rounded-xl transition-all disabled:opacity-50 cursor-pointer group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">💥</span>
                <span className="text-[9px] font-bold text-brand-danger mt-1">Flash Crash</span>
              </button>
            </div>
          </div>

        </section>

        {/* WORKSPACE LAYOUT GRID */}
        <section className="grid gap-8 lg:grid-cols-12 items-start relative z-10">
          
          {/* Left Panel: Tickers & Accounts (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Ticker Logs Sub-tabs */}
            <div className="flex space-x-2 border-b border-brand-border bg-white p-1 rounded-t-2xl">
              {[
                { id: 'market', label: 'Market Tickers', icon: Compass },
                { id: 'portfolio', label: 'Sandbox Holdings', icon: Landmark },
                { id: 'sips', label: 'My Virtual SIPs', icon: RefreshCw },
                { id: 'transactions', label: 'Order History', icon: History },
                { id: 'scenarios', label: 'Scenario Log & Advice', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
<<<<<<< HEAD
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 pb-3 pt-2 px-4 border-b-2 font-bold text-xs md:text-sm transition-all cursor-pointer border-0 ${
                      active
                        ? 'border-brand-primary text-brand-primary bg-transparent'
                        : 'border-transparent text-brand-muted hover:text-brand-ink bg-transparent'
=======
                    key={type.value}
                    onClick={() => setMarketFilter(type.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      marketFilter === type.value
                        ? 'bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-glow-primary'
                         : 'text-white/80 hover:text-white hover:bg-white/5'
>>>>>>> origin/front
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: MARKET tickers */}
            {activeTab === 'market' && (
              <div className="space-y-4">
                
                {/* Search Bar & Categorization filters */}
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-muted" />
                    <input 
                      type="text" 
                      placeholder="Search company symbol, mutual funds..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-ink focus:outline-brand-primary"
                    />
                  </div>

                  {/* Asset class filter buttons */}
                  <div className="flex flex-wrap gap-1">
                    {assetTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setMarketFilter(type.value)}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          marketFilter === type.value
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-white text-brand-muted border-brand-border hover:bg-brand-light'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Market ticker list table */}
                <div className="surface-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-brand-ink">
                      <thead>
                        <tr className="border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-brand-light/35">
                          <th className="py-4 px-6">Ticker / Asset</th>
                          <th className="py-4 px-6">Asset Class</th>
                          <th className="py-4 px-6 text-right">Price</th>
                          <th className="py-4 px-6 text-right">Price Change</th>
                          <th className="py-4 px-6 text-center">Risk Level</th>
                          <th className="py-4 px-6 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-xs">
                        {filteredAssets.map((asset) => {
                          const change = asset.currentPrice - asset.previousPrice;
                          const percent = asset.previousPrice > 0 ? (change / asset.previousPrice) * 100 : 0;
                          const isUp = change >= 0;
                          const isSelected = selectedAsset?._id === asset._id;

                          return (
                            <tr 
                              key={asset._id} 
                              onClick={() => {
                                setSelectedAsset(asset);
                                // Clear compare selection if same
                                if (compareAssetId === asset._id) setCompareAssetId('');
                              }}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-brand-light/40 border-l-4 border-l-brand-primary' : 'hover:bg-brand-light/15'
                              }`}
                            >
                              <td className="py-4 px-6">
                                <div className="font-bold text-brand-ink">{asset.symbol}</div>
                                <div className="text-[10px] text-brand-muted font-medium">{asset.name}</div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-[10px] font-bold bg-brand-light px-2 py-0.5 rounded text-brand-primary">
                                  {asset.type}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right font-bold">
                                ₹{asset.currentPrice.toLocaleString('en-IN')}
                              </td>
                              <td className="py-4 px-6 text-right">
                                {percent === 0 ? (
                                  <span className="text-brand-muted font-semibold">-</span>
                                ) : (
                                  <span className={`font-bold flex items-center justify-end ${isUp ? 'text-brand-success' : 'text-brand-danger'}`}>
                                    {isUp ? '+' : ''}
                                    {percent.toFixed(1)}%
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                  asset.riskLevel === 'Low' ? 'bg-emerald-50 text-brand-success border-emerald-100' :
                                  asset.riskLevel === 'Moderate' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                  asset.riskLevel === 'High' ? 'bg-amber-50 text-brand-warning border-amber-100' :
                                  'bg-red-50 text-brand-danger border-red-100'
                                }`}>
                                  {asset.riskLevel} Risk
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="text-brand-primary hover:underline font-bold text-[10px] flex items-center justify-center">
                                  Select <ChevronRight size={13} />
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: MY HOLDINGS */}
            {activeTab === 'portfolio' && (
              <div className="surface-card overflow-hidden">
                {(!portfolio || portfolio.holdings.length === 0) ? (
                  <div className="p-16 text-center space-y-4">
                    <p className="text-brand-muted text-sm font-medium">Your virtual holdings portfolio is currently empty.</p>
                    <button
                      onClick={() => setActiveTab('market')}
                      className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl border-0 cursor-pointer"
                    >
                      View Market board to buy assets
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-brand-ink">
                      <thead>
                        <tr className="border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-brand-light/35">
                          <th className="py-4 px-6">Asset symbol</th>
                          <th className="py-4 px-6 text-right">Holdings</th>
                          <th className="py-4 px-6 text-right">Avg Cost</th>
                          <th className="py-4 px-6 text-right">Market value</th>
                          <th className="py-4 px-6 text-right">Profit / Loss</th>
                          <th className="py-4 px-6 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-xs">
                        {portfolio.holdings.map((holding) => {
                          const isGain = holding.gainLoss >= 0;
                          return (
                            <tr 
                              key={holding._id} 
                              onClick={() => {
                                setSelectedAsset(holding.asset);
                                setActiveTab('market'); // Redirect visual focus
                              }}
                              className="hover:bg-brand-light/15 transition-colors cursor-pointer"
                            >
                              <td className="py-4 px-6 font-bold">
                                {holding.asset.symbol}
                                <span className="block text-[9px] text-brand-muted font-normal">{holding.asset.name}</span>
                              </td>
                              <td className="py-4 px-6 text-right font-medium">{holding.quantity.toFixed(4)} Unit(s)</td>
                              <td className="py-4 px-6 text-right text-brand-muted">₹{holding.averageBuyPrice.toLocaleString()}</td>
                              <td className="py-4 px-6 text-right font-bold">₹{holding.currentValue.toLocaleString()}</td>
                              <td className="py-4 px-6 text-right">
                                <span className={`font-bold flex items-center justify-end ${isGain ? 'text-brand-success' : 'text-brand-danger'}`}>
                                  {isGain ? '+' : ''}
                                  {holding.roi.toFixed(1)}% (₹{holding.gainLoss.toLocaleString()})
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAsset(holding.asset);
                                    setTradeType('SELL');
                                    setTradeQty(holding.quantity);
                                  }}
                                  className="px-3 py-1.5 bg-brand-danger/10 text-brand-danger hover:bg-brand-danger hover:text-white border border-brand-danger/20 rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  Trade Sell
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MY VIRTUAL SIPS */}
            {activeTab === 'sips' && (
              <div className="surface-card overflow-hidden">
                {sips.length === 0 ? (
                  <div className="p-16 text-center space-y-4">
                    <p className="text-brand-muted text-sm font-medium">You have no active virtual Systematic Investment Plans (SIP).</p>
                    <button
                      onClick={() => setActiveTab('market')}
                      className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl border-0 cursor-pointer"
                    >
                      View Market Board to Start SIP
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-brand-ink">
                      <thead>
                        <tr className="border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-brand-light/35">
                          <th className="py-4 px-6">Asset Symbol</th>
                          <th className="py-4 px-6">SIP Amount</th>
                          <th className="py-4 px-6">Frequency</th>
                          <th className="py-4 px-6 text-right">Total Invested</th>
                          <th className="py-4 px-6 text-right">Total Units</th>
                          <th className="py-4 px-6 text-right">Avg Cost</th>
                          <th className="py-4 px-6 text-center">Next Installment</th>
                          <th className="py-4 px-6 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-xs">
                        {sips.map((sip) => {
                          const avgCost = sip.totalUnits > 0 ? (sip.totalInvested / sip.totalUnits) : 0;
                          return (
                            <tr key={sip._id} className="hover:bg-brand-light/15 transition-colors">
                              <td className="py-4 px-6 font-bold">
                                {sip.assetId?.symbol}
                                <span className="block text-[9px] text-brand-muted font-normal">{sip.assetId?.name}</span>
                              </td>
                              <td className="py-4 px-6 font-bold text-brand-primary">₹{sip.amount.toLocaleString()}</td>
                              <td className="py-4 px-6 uppercase font-bold text-[10px] text-brand-muted">{sip.frequency}</td>
                              <td className="py-4 px-6 text-right font-bold">₹{sip.totalInvested.toLocaleString()}</td>
                              <td className="py-4 px-6 text-right font-semibold">{sip.totalUnits.toFixed(4)}</td>
                              <td className="py-4 px-6 text-right text-brand-muted">₹{avgCost.toFixed(2)}</td>
                              <td className="py-4 px-6 text-center font-medium text-[10px]">
                                {new Date(sip.nextExecutionDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => handleCancelSip(sip._id)}
                                  className="px-3 py-1.5 bg-red-50 text-brand-danger hover:bg-brand-danger hover:text-white border border-brand-danger/20 rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  Cancel SIP
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: TRANSACTION LOGS */}
            {activeTab === 'transactions' && (
              <div className="surface-card overflow-hidden">
                {transactions.length === 0 ? (
                  <div className="p-16 text-center text-brand-muted text-sm font-medium">
                    No transactions executed yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-brand-ink">
                      <thead>
                        <tr className="border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-brand-light/35">
                          <th className="py-4 px-6">Timestamp</th>
                          <th className="py-4 px-6">Order</th>
                          <th className="py-4 px-6">Asset symbol</th>
                          <th className="py-4 px-6 text-right">Quantity</th>
                          <th className="py-4 px-6 text-right">Execution Price</th>
                          <th className="py-4 px-6 text-right">Total Flow</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-xs text-brand-ink">
                        {transactions.map((t) => {
                          const isBuy = t.type === 'BUY';
                          const total = t.quantity * t.price;
                          return (
                            <tr key={t._id} className="hover:bg-brand-light/10 transition-colors">
                              <td className="py-4 px-6 text-brand-muted text-[10px] font-semibold">
                                {new Date(t.timestamp).toLocaleString()}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  isBuy ? 'bg-emerald-50 text-brand-success border-emerald-100' : 'bg-red-50 text-brand-danger border-red-100'
                                }`}>
                                  {t.type}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-bold">{t.assetId?.symbol || 'UNKNOWN'}</td>
                              <td className="py-4 px-6 text-right">{t.quantity.toFixed(4)}</td>
                              <td className="py-4 px-6 text-right font-medium">₹{t.price.toLocaleString()}</td>
                              <td className="py-4 px-6 text-right font-bold text-brand-ink">₹{total.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MACRO SCENARIOS stress testing logs */}
            {activeTab === 'scenarios' && (
              <div className="space-y-4">
                {scenarioHistory.map((historyItem) => (
                  <div key={historyItem.id} className="surface-card p-5 border-l-4 border-l-brand-primary space-y-3 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-brand-light text-brand-primary border border-brand-border">
                          {historyItem.event}
                        </span>
                        <h4 className="text-sm font-bold text-brand-ink mt-1.5">{historyItem.title}</h4>
                      </div>
                      <span className="text-[10px] text-brand-muted font-medium">
                        {new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-brand-ink font-semibold leading-relaxed">
                      {historyItem.description}
                    </p>

                    <div className="p-3.5 bg-brand-light/50 border border-brand-border rounded-xl text-[11px] text-brand-muted leading-relaxed font-semibold">
                      <div className="flex items-center gap-1.5 font-extrabold text-brand-primary uppercase text-[9px] mb-1">
                        <Info size={12} />
                        Financial Advisor Takeaway
                      </div>
                      {historyItem.education}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Right Panel: Selected Asset detail & Order Panel (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {selectedAsset ? (
              <div className="surface-card p-5 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-brand-primary"></div>
                
                {/* Symbol, Name & Realtime price */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold bg-brand-light px-2.5 py-1 rounded text-brand-primary uppercase">
                      {selectedAsset.type}
                    </span>
                    <h2 className="text-xl font-bold text-brand-ink mt-2">{selectedAsset.symbol}</h2>
                    <p className="text-[11px] text-brand-muted font-medium">{selectedAsset.name}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-brand-ink block">
                      ₹{selectedAsset.currentPrice.toLocaleString('en-IN')}
                    </span>
                    {selectedAsset.currentPrice >= selectedAsset.previousPrice ? (
                      <span className="text-[11px] font-bold text-brand-success flex items-center justify-end">
                        <ArrowUpRight size={14} />
                        +{((selectedAsset.currentPrice - selectedAsset.previousPrice) / (selectedAsset.previousPrice || 1) * 100).toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-brand-danger flex items-center justify-end">
                        <ArrowDownRight size={14} />
                        {((selectedAsset.currentPrice - selectedAsset.previousPrice) / (selectedAsset.previousPrice || 1) * 100).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className={`rounded-xl border p-3 text-[11px] leading-5 ${['High', 'Very High'].includes(selectedAsset.riskLevel) ? 'border-amber-200 bg-amber-50 text-brand-ink' : 'border-brand-border bg-brand-light/40 text-brand-muted'}`}>
                  <div className="mb-1 flex items-center gap-1 font-bold text-brand-primary"><Info size={13} /> Personal risk check</div>
                  {selectedRiskMessage}
                  {goals.length > 0 && tradeType !== 'SELL' && <p className="mt-1.5 border-t border-brand-border pt-1.5">Your saved goals stay separate from this virtual trade. Use the Goals page to record actual savings progress.</p>}
                </div>

                {/* Dynamic Price Chart with timeline toggles */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-brand-muted uppercase border-b border-brand-border pb-1">
                    <span>{compareAsset ? 'Performance Comparison' : 'Performance Trend Chart'}</span>
                    <div className="flex gap-1.5 bg-brand-light/50 p-0.5 rounded-lg border border-brand-border">
                      {['1W', '1M', '1Y'].map(t => (
                        <button
                          key={t}
                          onClick={() => setChartTimeline(t)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all border-0 cursor-pointer ${
                            chartTimeline === t ? 'bg-white text-brand-primary shadow-xs' : 'text-brand-muted hover:text-brand-ink bg-transparent'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Area Line Chart */}
                  <div className="h-44 w-full bg-brand-bg/40 border border-brand-border rounded-xl overflow-hidden p-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={combinedChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isDailyPriceGain ? '#167A55' : '#C64A4A'} stopOpacity={0.25}/>
                            <stop offset="95%" stopColor={isDailyPriceGain ? '#167A55' : '#C64A4A'} stopOpacity={0.01}/>
                          </linearGradient>
                          <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#65736D' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 8, fill: '#65736D' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ background: '#FFFFFF', border: '1px solid #DDE5DE', borderRadius: '8px', fontSize: '9px', color: '#12332C' }}
                          formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey={selectedAsset.symbol} 
                          stroke={isDailyPriceGain ? '#167A55' : '#C64A4A'} 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorPrice)" 
                        />
                        {compareAsset && (
                          <Area 
                            type="monotone" 
                            dataKey={compareAsset.symbol} 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorCompare)" 
                          />
                        )}
                        {compareAsset && <Legend verticalAlign="top" height={16} wrapperStyle={{ fontSize: '8px', fontWeight: 'bold' }} />}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Asset Comparison Dropdown */}
                <div className="space-y-2 border-t border-brand-border pt-3">
                  <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1">
                    <SlidersHorizontal size={12} />
                    Compare with Ticker
                  </h4>
                  <select
                    value={compareAssetId}
                    onChange={(e) => setCompareAssetId(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs font-bold outline-none text-brand-ink focus:border-brand-primary"
                  >
                    <option value="">-- Choose Asset to Compare --</option>
                    {assets.filter(a => a._id !== selectedAsset._id && a.symbol !== 'CASH').map(a => (
                      <option key={a._id} value={a._id}>
                        {a.symbol} - {a.name} ({a.type})
                      </option>
                    ))}
                  </select>

                  {compareAsset && (
                    <div className="bg-brand-light/60 p-3.5 rounded-xl border border-brand-border text-[11px] font-semibold space-y-2.5 mt-2">
                      <div className="flex justify-between items-center border-b border-brand-border/45 pb-1.5">
                        <span className="font-extrabold text-brand-ink uppercase text-[9px] tracking-wider">{compareAsset.symbol} Specifications</span>
                        <button
                          onClick={() => setCompareAssetId('')}
                          className="text-[9px] text-brand-danger hover:underline bg-transparent border-0 cursor-pointer font-bold"
                        >
                          Clear Comparison
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-brand-ink">
                        <div>
                          <span className="text-[9px] text-brand-muted block uppercase">Current Price</span>
                          <span>₹{compareAsset.currentPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-brand-muted block uppercase">Asset Type</span>
                          <span className="text-brand-primary">{compareAsset.type}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-brand-muted block uppercase">Volatility</span>
                          <span>{compareAsset.volatility}% Index</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-brand-muted block uppercase">Risk Level</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] border ${
                            compareAsset.riskLevel === 'Low' ? 'bg-emerald-50 text-brand-success border-emerald-100' :
                            compareAsset.riskLevel === 'Moderate' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            compareAsset.riskLevel === 'High' ? 'bg-amber-50 text-brand-warning border-amber-100' :
                            'bg-red-50 text-brand-danger border-red-100'
                          }`}>
                            {compareAsset.riskLevel}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-brand-muted font-medium italic border-t border-brand-border/20 pt-1.5 leading-relaxed">
                        {compareAsset.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Key Fundamental / Instrument Stats (realistic facts matching Groww) */}
                <div className="space-y-2 text-xs text-brand-ink">
                  <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1 border-b border-brand-border pb-1">
                    <Info size={12} />
                    Key Statistics & Indicators
                  </h4>

                  {selectedAsset.type === 'STOCK' && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-brand-border/30 pt-1 font-semibold">
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Open</span><span>₹{(selectedAsset.currentPrice * 0.985).toFixed(1)}</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Prev Close</span><span>₹{selectedAsset.previousPrice.toLocaleString()}</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Day High</span><span>₹{(selectedAsset.currentPrice * 1.018).toFixed(1)}</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Day Low</span><span>₹{(selectedAsset.currentPrice * 0.975).toFixed(1)}</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Volatility</span><span>{selectedAsset.volatility}% Index</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Market Cap</span><span>{selectedAsset.riskLevel === 'High' ? 'Mid Cap' : 'Large Cap'}</span></div>
                    </div>
                  )}

                  {selectedAsset.type === 'MUTUAL_FUND' && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-brand-border/30 pt-1 font-semibold">
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">AUM</span><span>₹18,450 Cr</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Expense Ratio</span><span>0.38%</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">NAV Price</span><span>₹{selectedAsset.currentPrice}</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Fund Rating</span><span>★★★★★</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Min SIP</span><span>₹500</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Exit Load</span><span>1.0% (1Yr)</span></div>
                    </div>
                  )}

                  {selectedAsset.type === 'GOLD' && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-brand-border/30 pt-1 font-semibold">
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Purity</span><span>24 Karat 99.9%</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Issuer</span><span>Reserve Bank</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Maturity</span><span>8 Years</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Interest yield</span><span>2.5% p.a.</span></div>
                    </div>
                  )}

                  {selectedAsset.type === 'FD' && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-brand-border/30 pt-1 font-semibold">
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Lock-in</span><span>1 Year</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Yield Yield</span><span>7.10% p.a.</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Risk rating</span><span>No market risk</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Penalty fee</span><span>1.00% Premature</span></div>
                    </div>
                  )}

                  {selectedAsset.type === 'BOND' && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-brand-border/30 pt-1 font-semibold">
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Coupon Yield</span><span>7.18% p.a.</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Maturity</span><span>10 Years</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Issuer</span><span>Govt of India</span></div>
                      <div className="flex justify-between border-b border-brand-border/20 pb-1"><span className="text-brand-muted">Credit rating</span><span>AAA Sovereign</span></div>
                    </div>
                  )}

                  <p className="text-[10px] text-brand-muted leading-relaxed font-semibold">
                    {selectedAsset.description}
                  </p>
                </div>

                {/* Inline Order Transaction panel */}
                <div className="space-y-4 border-t border-brand-border pt-4 text-brand-ink">
                  
                  {/* BUY / SELL / SIP Switch */}
                  <div className="flex rounded-xl bg-brand-light/70 p-1 border border-brand-border">
                    <button
                      onClick={() => { setTradeType('BUY'); setTradeError(''); setTradeSuccess(''); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                        tradeType === 'BUY' ? 'bg-white text-brand-success shadow-xs' : 'text-brand-muted hover:text-brand-ink bg-transparent'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => { setTradeType('SELL'); setTradeError(''); setTradeSuccess(''); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                        tradeType === 'SELL' ? 'bg-white text-brand-danger shadow-xs' : 'text-brand-muted hover:text-brand-ink bg-transparent'
                      }`}
                    >
                      Sell
                    </button>
                    <button
                      onClick={() => { setTradeType('SIP'); setTradeError(''); setTradeSuccess(''); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                        tradeType === 'SIP' ? 'bg-white text-brand-primary shadow-xs' : 'text-brand-muted hover:text-brand-primary bg-transparent'
                      }`}
                    >
                      Virtual SIP
                    </button>
                  </div>

                  {/* Quantity / SIP input & Calculator */}
                  {tradeType === 'SIP' ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-brand-muted uppercase">SIP Installment Amount (₹)</label>
                        <span className="text-[10px] text-brand-primary font-bold">Min: ₹500</span>
                      </div>
                      <input
                        type="number"
                        min="500"
                        step="500"
                        value={sipAmount}
                        onChange={(e) => setSipAmount(Math.max(500, parseInt(e.target.value) || 500))}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-4 text-xs font-bold outline-none text-brand-ink focus:border-brand-primary"
                      />
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-brand-muted uppercase">Frequency</label>
                        <select
                          value={sipFrequency}
                          onChange={(e) => setSipFrequency(e.target.value)}
                          className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-3 text-xs font-bold outline-none text-brand-ink focus:border-brand-primary"
                        >
                          <option value="MONTHLY">Monthly</option>
                          <option value="WEEKLY">Weekly</option>
                        </select>
                      </div>

                      {/* SIP order costs */}
                      <div className="bg-brand-light/45 p-3.5 rounded-xl space-y-2 border border-brand-border text-xs font-semibold">
                        <div className="flex justify-between text-brand-muted">
                          <span>First Installment:</span>
                          <span className="text-brand-ink">₹{sipAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-brand-muted">
                          <span>Available Cash:</span>
                          <span className="text-brand-ink">₹{cashBalance.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-brand-muted">
                          <span>Remaining Balance:</span>
                          <span className={`font-bold ${cashBalance >= sipAmount ? 'text-brand-success' : 'text-brand-danger'}`}>
                            ₹{(cashBalance - sipAmount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-brand-muted uppercase">Quantity of Units</label>
                        {selectedAssetHoldings && (
                          <span className="text-[10px] text-brand-muted font-bold">
                            Owned: {selectedAssetHoldings.quantity.toFixed(4)} unit(s)
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={tradeQty}
                        onChange={(e) => setTradeQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-4 text-xs font-bold outline-none text-brand-ink focus:border-brand-primary"
                      />

                      {/* Order costs */}
                      <div className="bg-brand-light/45 p-3.5 rounded-xl space-y-2 border border-brand-border text-xs font-semibold">
                        <div className="flex justify-between text-brand-muted">
                          <span>Transaction Total Cost:</span>
                          <span className="text-brand-ink">₹{(tradeQty * selectedAsset.currentPrice).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-brand-muted">
                          <span>Available Cash:</span>
                          <span className="text-brand-ink">₹{cashBalance.toLocaleString('en-IN')}</span>
                        </div>
                        {tradeType === 'BUY' ? (
                          <div className="flex justify-between text-brand-muted">
                            <span>Remaining Balance:</span>
                            <span className={`font-bold ${cashBalance >= (tradeQty * selectedAsset.currentPrice) ? 'text-brand-success' : 'text-brand-danger'}`}>
                              ₹{(cashBalance - (tradeQty * selectedAsset.currentPrice)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-brand-muted">
                            <span>Projected Cash:</span>
                            <span className="text-brand-success font-bold">
                              ₹{(cashBalance + (tradeQty * selectedAsset.currentPrice)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {tradeError && (
                    <p className="p-3 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger rounded-xl text-[10px] font-semibold text-center animate-shake">
                      {tradeError}
                    </p>
                  )}

                  {tradeSuccess && (
                    <p className="p-3 bg-brand-success/10 border border-brand-success/20 text-brand-success rounded-xl text-[10px] font-semibold text-center">
                      {tradeSuccess}
                    </p>
                  )}

                  <button
                    onClick={handleExecuteTrade}
                    disabled={tradeLoading}
                    className={`w-full py-3 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wider border-0 shadow-card cursor-pointer ${
                      tradeType === 'BUY' 
                        ? 'bg-brand-success hover:opacity-90 disabled:opacity-50' 
                        : tradeType === 'SELL'
                        ? 'bg-brand-danger hover:opacity-90 disabled:opacity-50'
                        : 'bg-brand-primary hover:opacity-90 disabled:opacity-50'
                    }`}
                  >
                    {tradeLoading 
                      ? 'Confirming execution...' 
                      : tradeType === 'SIP' 
                      ? 'Start Virtual SIP' 
                      : `Confirm ${tradeType} Order`
                    }
                  </button>
                </div>

              </div>
            ) : (
              <div className="surface-card p-10 text-center text-brand-muted text-xs">
                Select an asset in market tickers to review details.
              </div>
            )}

          </div>
        </section>
      </div>

      {/* Badge Unlocked Celebration Overlay */}
      <AnimatePresence>
        {badgeUnlocked && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-ink/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full bg-white rounded-3xl p-8 border border-brand-gold/30 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-gold"></div>
              
              <Award className="w-16 h-16 text-brand-gold fill-brand-gold mx-auto animate-bounce mb-4" />
              
              <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest block mb-1">ACHIEVEMENT UNLOCKED</span>
              <h3 className="text-xl font-black text-brand-ink mb-2">{badgeUnlocked.title}</h3>
              <p className="text-xs text-brand-muted leading-relaxed mb-6">
                {badgeUnlocked.description}
              </p>

              <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-xl inline-block text-xs font-bold text-brand-gold mb-6">
                +{badgeUnlocked.xpReward} XP Reward Added
              </div>

              <button
                onClick={() => setBadgeUnlocked(null)}
                className="w-full py-3 bg-brand-primary text-white text-xs font-bold rounded-xl border-0 cursor-pointer shadow-card"
              >
                Awesome, Continue!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Sandbox;
