import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Landmark, ArrowUpRight, ArrowDownRight, RefreshCw,
  ShoppingBag, Trash2, History, AlertTriangle, Play, Award, HelpCircle
} from 'lucide-react';
import api from '../services/api';

const Sandbox = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio', 'market', 'transactions'
  const [marketFilter, setMarketFilter] = useState('ALL'); // 'ALL', 'STOCK', 'MUTUAL_FUND', 'FD', 'BOND', 'GOLD'
  
  // Trade Modal State
  const [tradeModal, setTradeModal] = useState({ open: false, asset: null, type: 'BUY' });
  const [tradeQty, setTradeQty] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');

  // Market Simulator State
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(null);

  const fetchAllData = async () => {
    try {
      const [portRes, assetsRes, transRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/portfolio/assets'),
        api.get('/portfolio/transactions')
      ]);
      setPortfolio(portRes.data);
      setAssets(assetsRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      console.error('Error fetching sandbox data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openTradeModal = (asset, type) => {
    setTradeModal({ open: true, asset, type });
    setTradeQty(1);
    setTradeError('');
    setTradeLoading(false);
  };

  const handleExecuteTrade = async () => {
    if (!tradeQty || tradeQty <= 0) {
      setTradeError('Please enter a valid quantity.');
      return;
    }
    setTradeLoading(true);
    setTradeError('');
    try {
      const res = await api.post('/portfolio/trade', {
        assetId: tradeModal.asset._id,
        type: tradeModal.type,
        quantity: Number(tradeQty)
      });

      if (res.data.badgeUnlocked) {
        setBadgeUnlocked(res.data.badgeUnlocked);
        // Trigger Layout update
        window.dispatchEvent(new Event('update-progress'));
      }

      setTradeModal({ open: false, asset: null, type: 'BUY' });
      await fetchAllData();
    } catch (err) {
      console.error('Trade failed', err);
      setTradeError(err.response?.data?.message || 'Transaction rejected. Check balance.');
    } finally {
      setTradeLoading(false);
    }
  };

  const handleSimulateMarket = async (eventType) => {
    setSimulating(true);
    setSimMessage('');
    setBadgeUnlocked(null);
    try {
      const res = await api.post('/portfolio/simulate-market', { eventType });
      
      let alertMsg = '';
      if (eventType === 'BULL_RUN') alertMsg = '📈 Market Update: Positive macroeconomic policies trigger a market bull run! Large-cap equities spike.';
      else if (eventType === 'BEAR_MARKET') alertMsg = '📉 Market Update: Rising interest rates result in a bearish correction. Stocks drop across the board.';
      else if (eventType === 'FLASH_CRASH') alertMsg = '💥 Emergency alert: A sudden algorithmic sell-off creates a -25% market flash crash! High volatility assets hit hardest.';
      else alertMsg = '🔄 Market Update: General daily price update. Moderate fluctuations recorded.';

      setSimMessage(alertMsg);
      if (res.data.badgeUnlocked) {
        setBadgeUnlocked(res.data.badgeUnlocked);
        // Trigger Layout update
        window.dispatchEvent(new Event('update-progress'));
      }

      await fetchAllData();
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setSimulating(false);
    }
  };

  const assetTypes = [
    { label: 'All Assets', value: 'ALL' },
    { label: 'Stocks', value: 'STOCK' },
    { label: 'Mutual Funds', value: 'MUTUAL_FUND' },
    { label: 'Gold', value: 'GOLD' },
    { label: 'Fixed Deposits', value: 'FD' },
    { label: 'Bonds', value: 'BOND' }
  ];

  const filteredAssets = marketFilter === 'ALL'
    ? assets
    : assets.filter(a => a.type === marketFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-slate-100">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-secondary animate-spin"></div>
        </div>
        <p className="mt-4 text-brand-muted text-xs font-medium">Connecting to virtual market exchanges...</p>
      </div>
    );
  }

  // Calculate allocation breakdown percentages
  const totalAssetsValue = portfolio?.totalHoldingsValue || 0;
  const cashBalance = portfolio?.balance || 0;
  const netWorth = portfolio?.totalPortfolioValue || 100000;

  const allocationBreakdown = [
    { name: 'Cash', value: cashBalance, color: 'bg-emerald-500' },
    ...((portfolio?.holdings || []).map((h, idx) => {
      const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-rose-500', 'bg-amber-500', 'bg-purple-500'];
      return {
        name: h.asset.symbol,
        value: h.currentValue,
        color: colors[idx % colors.length]
      };
    }))
  ];

  return (
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
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-3xl border border-white/5 overflow-hidden"
            >
              {(!portfolio || portfolio.holdings.length === 0) ? (
                <div className="p-16 text-center space-y-4">
                  <p className="text-brand-muted text-sm">Your virtual portfolio is currently empty.</p>
                  <button
                    onClick={() => setActiveTab('market')}
                    className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-glow-primary hover:opacity-90"
                  >
                    View Market Board to Buy Assets
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-white/[0.02]">
                        <th className="py-4 px-6">Asset</th>
                        <th className="py-4 px-6 text-right">Holdings</th>
                        <th className="py-4 px-6 text-right">Avg Cost</th>
                        <th className="py-4 px-6 text-right">Current Price</th>
                        <th className="py-4 px-6 text-right">Net Value</th>
                        <th className="py-4 px-6 text-right">Profit / Loss</th>
                        <th className="py-4 px-6 text-center">Trade Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {portfolio.holdings.map((holding) => {
                        const isGain = holding.gainLoss >= 0;
                        return (
                          <tr key={holding._id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-100">{holding.asset.symbol}</div>
                              <div className="text-[10px] text-brand-muted">{holding.asset.name}</div>
                            </td>
                            <td className="py-4 px-6 text-right font-medium">
                              {holding.quantity} Unit(s)
                            </td>
                            <td className="py-4 px-6 text-right text-slate-300">
                              ₹{holding.averageBuyPrice.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right font-semibold text-slate-300">
                              ₹{holding.asset.currentPrice.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-white">
                              ₹{holding.currentValue.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className={`font-bold flex items-center justify-end ${isGain ? 'text-brand-success' : 'text-brand-danger'}`}>
                                {isGain ? '+' : ''}
                                {holding.roi.toFixed(1)}% (₹{holding.gainLoss.toLocaleString()})
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => openTradeModal(holding.asset, 'BUY')}
                                  className="px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-secondary hover:text-white border border-brand-primary/20 rounded-lg font-bold transition-all text-[11px] cursor-pointer"
                                >
                                  Buy
                                </button>
                                <button
                                  onClick={() => openTradeModal(holding.asset, 'SELL')}
                                  className="px-3 py-1.5 bg-brand-danger/10 hover:bg-brand-danger text-brand-danger hover:text-white border border-brand-danger/20 rounded-lg font-bold transition-all text-[11px] cursor-pointer"
                                >
                                  Sell
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: MARKET BOARD */}
          {activeTab === 'market' && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Asset filters */}
              <div className="flex flex-wrap gap-2 mb-4 bg-slate-950/50 p-1.5 border border-white/5 rounded-2xl w-fit">
                {assetTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setMarketFilter(type.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      marketFilter === type.value
                        ? 'bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-glow-primary'
                         : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Assets list */}
              <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-white/[0.02]">
                        <th className="py-4 px-6">Asset</th>
                        <th className="py-4 px-6">Type</th>
                        <th className="py-4 px-6 text-right">Price</th>
                        <th className="py-4 px-6 text-right">Price Change</th>
                        <th className="py-4 px-6 text-center">Risk Level</th>
                        <th className="py-4 px-6 text-center">Buy Order</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {filteredAssets.map((asset) => {
                        const change = asset.currentPrice - asset.previousPrice;
                        const percent = asset.previousPrice > 0 ? (change / asset.previousPrice) * 100 : 0;
                        const isUp = change >= 0;

                        return (
                          <tr key={asset._id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-100">{asset.symbol}</div>
                              <div className="text-[10px] text-brand-muted">{asset.name}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-[10px] font-semibold bg-white/5 px-2.5 py-0.5 rounded-lg text-slate-300">
                                {asset.type}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-white">
                              ₹{asset.currentPrice.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right">
                              {percent === 0 ? (
                                <span className="text-slate-400 font-semibold">-</span>
                              ) : (
                                <span className={`font-semibold flex items-center justify-end ${isUp ? 'text-brand-success' : 'text-brand-danger'}`}>
                                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                  {Math.abs(percent).toFixed(1)}%
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                asset.riskLevel === 'Low' ? 'bg-emerald-500/10 text-brand-success' :
                                asset.riskLevel === 'Moderate' ? 'bg-indigo-500/10 text-brand-secondary' :
                                asset.riskLevel === 'High' ? 'bg-amber-500/10 text-brand-warning' :
                                'bg-rose-500/10 text-brand-danger'
                              }`}>
                                {asset.riskLevel} Risk
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => openTradeModal(asset, 'BUY')}
                                className="px-4 py-2 bg-brand-primary text-white rounded-xl text-[11px] font-bold hover:opacity-90 shadow-glow-primary transition-all flex items-center mx-auto cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                                Buy Order
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: TRANSACTION LOGS */}
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-3xl border border-white/5 overflow-hidden"
            >
              {transactions.length === 0 ? (
                <div className="p-16 text-center">
                  <p className="text-brand-muted text-sm">No transaction history recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-white/[0.02]">
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-6">Order</th>
                        <th className="py-4 px-6">Asset</th>
                        <th className="py-4 px-6 text-right">Quantity</th>
                        <th className="py-4 px-6 text-right">Execution Price</th>
                        <th className="py-4 px-6 text-right">Total Flow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                      {transactions.map((t) => {
                        const isBuy = t.type === 'BUY';
                        const total = t.quantity * t.price;
                        return (
                          <tr key={t._id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-6 text-brand-muted font-medium text-[11px]">
                              {new Date(t.timestamp).toLocaleString()}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                isBuy ? 'bg-indigo-500/10 text-brand-secondary' : 'bg-rose-500/10 text-brand-danger'
                              }`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold text-white">
                              {t.assetId?.symbol || 'Unknown'}
                            </td>
                            <td className="py-4 px-6 text-right">
                              {t.quantity}
                            </td>
                            <td className="py-4 px-6 text-right font-medium">
                              ₹{t.price.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-white">
                              ₹{total.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Trade Modal Overlay */}
      <AnimatePresence>
        {tradeModal.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-bg/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full glass-card rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-primary to-brand-secondary"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-brand-secondary" />
                  <span>Execute {tradeModal.type} Order</span>
                </h3>
                <button
                  onClick={() => setTradeModal({ open: false, asset: null, type: 'BUY' })}
                  className="text-xs text-slate-500 hover:text-slate-200 font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Asset Snapshot */}
              <div className="p-4 bg-brand-bg/60 border border-white/5 rounded-2xl mb-6 space-y-2">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{tradeModal.asset.symbol}</h4>
                    <p className="text-[10px] text-brand-muted">{tradeModal.asset.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">₹{tradeModal.asset.currentPrice.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-brand-secondary uppercase">{tradeModal.asset.type}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal border-t border-white/5 pt-2">
                  {tradeModal.asset.description}
                </p>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-brand-muted font-bold block">ORDER QUANTITY</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={tradeQty}
                    onChange={(e) => setTradeQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-brand-bg/40 border border-white/10 focus:border-brand-primary rounded-xl py-3 px-4 text-sm text-slate-200 outline-none transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-brand-muted">
                    <span>Est. Transaction Cost:</span>
                    <span className="text-slate-300">₹{(tradeQty * tradeModal.asset.currentPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Available Cash Balance:</span>
                    <span className="text-slate-300">₹{cashBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Projected Remaining Cash:</span>
                    <span className={`font-bold ${cashBalance >= (tradeQty * tradeModal.asset.currentPrice) ? 'text-brand-success' : 'text-brand-danger'}`}>
                      ₹{(cashBalance - (tradeQty * tradeModal.asset.currentPrice)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {tradeError && (
                  <p className="p-3 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-xl text-[11px] font-semibold">
                    {tradeError}
                  </p>
                )}

                <button
                  disabled={tradeLoading}
                  onClick={handleExecuteTrade}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl text-xs shadow-glow-primary hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer uppercase tracking-wider"
                >
                  {tradeLoading ? 'Confirming with Exchange...' : `Confirm ${tradeModal.type} Order`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Badge Unlocked Modal overlay */}
      <AnimatePresence>
        {badgeUnlocked && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-bg/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full glass-card rounded-3xl p-8 border border-brand-warning/30 shadow-glass text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-warning"></div>
              
              <Award className="w-16 h-16 text-brand-warning fill-brand-warning mx-auto animate-bounce mb-4" />
              
              <span className="text-[10px] font-bold text-brand-warning uppercase tracking-widest block mb-1">ACHIEVEMENT UNLOCKED</span>
              <h3 className="text-xl font-black text-white mb-2">{badgeUnlocked.title}</h3>
              <p className="text-xs text-brand-muted leading-relaxed mb-6">
                {badgeUnlocked.description}
              </p>

              <div className="p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl inline-block text-xs font-bold text-brand-warning mb-6">
                +{badgeUnlocked.xpReward} XP Reward Added
              </div>

              <button
                onClick={() => setBadgeUnlocked(null)}
                className="w-full py-3 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer"
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
