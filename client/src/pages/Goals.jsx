import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Plus, Calendar, Coins, Sparkles, Trash2, ArrowUpRight,
  TrendingUp, HelpCircle, Edit2, ShieldAlert, Award, ChevronRight, CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Add Goal Form State
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newTimeline, setNewTimeline] = useState('');
  const [newSavings, setNewSavings] = useState('');
  const [newCategory, setNewCategory] = useState('Short-Term');
  const [addError, setAddError] = useState('');

  // Update Savings State
  const [editGoal, setEditGoal] = useState(null);
  const [editSavings, setEditSavings] = useState('');

  // Simulator Modal State
  const [simGoal, setSimGoal] = useState(null);
  const [simContribution, setSimContribution] = useState(2000);
  const [simRate, setSimRate] = useState(10); // 10% expected return rate
  const [simResults, setSimResults] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [badgeUnlocked, setBadgeUnlocked] = useState(null);

  // SIP Risk Profiler States
  const [sipFundCategory, setSipFundCategory] = useState('SMALL_CAP');
  const [sipAmount, setSipAmount] = useState(2000);
  const [sipHorizon, setSipHorizon] = useState(5); // years

  const fetchGoalsAndProfile = async () => {
    try {
      const [goalsRes, profileRes] = await Promise.allSettled([
        api.get('/goals'),
        api.get('/profile')
      ]);
      if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data);
      if (profileRes.status === 'fulfilled' && profileRes.value.data?.assessmentCompleted) {
        setProfile(profileRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching goals and profile diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndProfile();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newName || !newTarget || !newTimeline) {
      setAddError('Goal Name, Target Amount, and Timeline are required.');
      return;
    }
    setAddError('');
    try {
      const res = await api.post('/goals', {
        name: newName,
        targetAmount: Number(newTarget),
        timeline: Number(newTimeline),
        currentSavings: Number(newSavings) || 0,
        category: newCategory,
      });

      if (res.data.badgeUnlocked) {
        setBadgeUnlocked(res.data.badgeUnlocked);
        window.dispatchEvent(new Event('update-progress'));
      }

      setAddOpen(false);
      setNewName('');
      setNewTarget('');
      setNewTimeline('');
      setNewSavings('');
      setNewCategory('Short-Term');
      
      await fetchGoalsAndProfile();
    } catch (err) {
      console.error('Create goal failed:', err);
      setAddError(err.response?.data?.message || 'Could not create goal.');
    }
  };

  const handleUpdateSavings = async () => {
    if (editSavings === '' || Number(editSavings) < 0) return;
    try {
      await api.put(`/goals/${editGoal._id}`, {
        currentSavings: Number(editSavings),
      });
      setEditGoal(null);
      setEditSavings('');
      await fetchGoalsAndProfile();
    } catch (err) {
      console.error('Update savings failed:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this simulated goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      await fetchGoalsAndProfile();
    } catch (err) {
      console.error('Delete goal failed:', err);
    }
  };

  const runSimulation = async () => {
    if (!simGoal) return;
    setSimLoading(true);
    try {
      const res = await api.post(`/goals/${simGoal._id}/simulate`, {
        monthlyContribution: Number(simContribution),
        annualReturnRate: Number(simRate),
      });
      setSimResults(res.data);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (simGoal) {
      runSimulation();
    }
  }, [simGoal, simContribution, simRate]);

  const openSimulator = (goal) => {
    setSimGoal(goal);
    const remaining = goal.targetAmount - goal.currentSavings;
    const suggested = remaining > 0 ? Math.round(remaining / goal.timeline) : 1000;
    setSimContribution(Math.max(500, Math.min(50000, suggested)));
    setSimRate(10);
    setSimResults(null);
  };

  // SIP Risk Real-time Assessment Logic
  const sipRiskAssessment = useMemo(() => {
    const riskScore = profile?.scores?.riskUnderstanding || 0;
    const knowledgeScore = profile?.scores?.investingKnowledge || 0;
    const totalScore = (riskScore + knowledgeScore) / 2;

    let fundRisk = 'Moderate';
    let stdDeviation = '12% - 15%';
    let maxDrawdown = '-15%';
    let description = '';

    switch (sipFundCategory) {
      case 'SMALL_CAP':
        fundRisk = 'Very High';
        stdDeviation = '22% - 28%';
        maxDrawdown = '-35%';
        description = 'Small-Cap funds invest in emerging companies. They have massive compounding power but experience heavy short-term valuation crashes.';
        break;
      case 'SECTORAL':
        fundRisk = 'Very High';
        stdDeviation = '25% - 32%';
        maxDrawdown = '-42%';
        description = 'Sectoral funds focus on a single industry (e.g. IT, Pharma). If that specific sector corrections, your portfolio suffers heavy losses without stock cushions.';
        break;
      case 'MID_CAP':
        fundRisk = 'High';
        stdDeviation = '18% - 22%';
        maxDrawdown = '-25%';
        description = 'Mid-cap funds invest in mid-sized enterprises. They offer a strong balance of moderate stability and aggressive long-term growth.';
        break;
      case 'LARGE_CAP':
        fundRisk = 'Moderate';
        stdDeviation = '11% - 14%';
        maxDrawdown = '-18%';
        description = 'Large-cap funds track stable index equities (Nifty 50). They represent the solid anchor for first-time beginner investors.';
        break;
      case 'HYBRID':
        fundRisk = 'Low';
        stdDeviation = '6% - 9%';
        maxDrawdown = '-10%';
        description = 'Hybrid plans blend debt bonds and equities. Gold or bond components offset equity shocks, keeping return volatility very low.';
        break;
      default:
        break;
    }

    // Determine compatibility alignment
    let alignmentStatus = 'ALIGNED'; // ALIGNED, CAUTION, MISMATCH
    let alignmentAdvice = '';
    
    if (fundRisk === 'Very High') {
      if (totalScore < 45) {
        alignmentStatus = 'MISMATCH';
        alignmentAdvice = `🔴 Critical Mismatch Alert: Your diagnostic scores show a low risk capability (${Math.round(totalScore)}/100). If you start a high-risk ${sipFundCategory.replace('_', ' ')} SIP, a sudden market flash crash could trigger panic selling. I advise allocating 75% into Large-Cap Index plans and only 25% into this fund.`;
      } else if (totalScore < 70) {
        alignmentStatus = 'CAUTION';
        alignmentAdvice = `⚠️ Caution Recommended: Your investment profile is moderate. A systematic small-cap exposure is acceptable, but ensure your horizon is strictly over 7 years to smooth out volatility curves.`;
      } else {
        alignmentStatus = 'ALIGNED';
        alignmentAdvice = `🟢 Portfolio Aligned: Your risk awareness handles this volatility. Maintain systematic monthly allocations and avoid timing the market.`;
      }
    } else if (fundRisk === 'High') {
      if (totalScore < 35) {
        alignmentStatus = 'MISMATCH';
        alignmentAdvice = `🔴 Volatility Mismatch: Your baseline understanding is low. Consider a Hybrid or Large-Cap fund first until you complete sandbox simulation exercises.`;
      } else if (totalScore < 60) {
        alignmentStatus = 'CAUTION';
        alignmentAdvice = `⚠️ Allocate Carefully: Monitor your cash flow. Keep a solid emergency fund in place so you never have to redeem mid-cap holdings prematurely during bear cycles.`;
      } else {
        alignmentStatus = 'ALIGNED';
        alignmentAdvice = `🟢 Position Aligned: Safe compatibility. Suitable for a 5-10 year horizon.`;
      }
    } else {
      alignmentStatus = 'ALIGNED';
      alignmentAdvice = `🟢 Asset Aligned: Excellent foundational choice. Very stable, matches first-time investor requirements perfectly.`;
    }

    // Projected SIP value
    const pRate = sipFundCategory === 'SMALL_CAP' || sipFundCategory === 'SECTORAL' ? 14 :
                  sipFundCategory === 'MID_CAP' ? 12 :
                  sipFundCategory === 'LARGE_CAP' ? 10.5 : 7.5;
    
    const monthlyRate = pRate / 1200;
    const months = sipHorizon * 12;
    let projectedValue = 0;
    for (let i = 0; i < months; i++) {
      projectedValue = (projectedValue + sipAmount) * (1 + monthlyRate);
    }
    const totalInvested = sipAmount * months;
    const estimatedGrowth = projectedValue - totalInvested;

    return {
      fundRisk,
      stdDeviation,
      maxDrawdown,
      description,
      alignmentStatus,
      alignmentAdvice,
      projectedValue,
      totalInvested,
      estimatedGrowth,
      rate: pRate
    };
  }, [sipFundCategory, sipAmount, sipHorizon, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-brand-ink">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-brand-sage/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary animate-spin"></div>
        </div>
        <p className="mt-4 text-brand-muted text-xs font-semibold">Calibrating goals simulator modules...</p>
      </div>
    );
  }

  return (
    <div className="page-shell px-5 py-8 md:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest block mb-2">FINANCIAL GOALS SIMULATOR</span>
            <h1 className="text-3xl md:text-4xl font-serif text-brand-ink mb-2">Goal Planning Terminal</h1>
            <p className="text-brand-muted text-xs md:text-sm max-w-2xl leading-relaxed">
              Create simulated financial goals, forecast compounding interest rates, and analyze Systematic Investment Plan (SIP) risk metrics aligned against your diagnostics scores.
            </p>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-card hover:opacity-90 transition-all text-xs cursor-pointer border-0 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Goal</span>
          </button>
        </div>

        {/* SIP RISK PROFILER & ALIGNMENT WIDGET (Hackathon Feature) */}
        <section className="mb-8 surface-card p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-brand-primary"></div>
          
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="text-brand-primary" size={20} />
            <div>
              <h2 className="text-sm font-bold text-brand-ink uppercase tracking-wider">SIP Risk Profiler & Asset Alignment</h2>
              <p className="text-[10px] text-brand-muted">Understand equity risk and compatibility before you commit capital</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            {/* Form Inputs (Left) */}
            <div className="md:col-span-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Mutual Fund Category</label>
                <select
                  value={sipFundCategory}
                  onChange={(e) => setSipFundCategory(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                >
                  <option value="SMALL_CAP">Small-Cap Mutual Fund (High Risk)</option>
                  <option value="SECTORAL">Sectoral Equity Fund (High Volatility)</option>
                  <option value="MID_CAP">Mid-Cap Mutual Fund (Moderate-High)</option>
                  <option value="LARGE_CAP">Large-Cap Index Fund (Moderate)</option>
                  <option value="HYBRID">Hybrid Equity-Debt Fund (Low-Moderate)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Monthly SIP (₹)</label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={sipAmount}
                    onChange={(e) => setSipAmount(Math.max(500, Number(e.target.value) || 500))}
                    className="w-full text-xs p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={sipHorizon}
                    onChange={(e) => setSipHorizon(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                    className="w-full text-xs p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-ink focus:outline-brand-primary"
                  />
                </div>
              </div>

              {/* Fund Factsheet Summary */}
              <div className="p-3.5 bg-brand-light/40 border border-brand-border rounded-xl text-xs space-y-2">
                <div className="flex justify-between font-bold text-[11px] text-brand-ink">
                  <span>Standard Deviation (Volatility)</span>
                  <span className="text-brand-warning">{sipRiskAssessment.stdDeviation}</span>
                </div>
                <div className="flex justify-between font-bold text-[11px] text-brand-ink">
                  <span>Max Drawdown Potential</span>
                  <span className="text-brand-danger">{sipRiskAssessment.maxDrawdown}</span>
                </div>
                <p className="text-[10px] text-brand-muted leading-relaxed border-t border-brand-border pt-1.5">
                  {sipRiskAssessment.description}
                </p>
              </div>
            </div>

            {/* Results & Compatibility Dashboard (Right) */}
            <div className="md:col-span-7 bg-brand-light/20 border border-brand-border p-5 rounded-2xl flex flex-col justify-between gap-4">
              
              {/* Profile Risk Awareness Metres */}
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <div>
                  <span className="text-[10px] font-bold text-brand-muted block uppercase">Your Risk Capability</span>
                  <strong className="text-brand-ink text-sm">
                    {profile ? `${profile.scores.riskUnderstanding} / 100` : 'No diagnostics score recorded'}
                  </strong>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                  sipRiskAssessment.alignmentStatus === 'ALIGNED' ? 'bg-emerald-50 text-brand-success border-emerald-100' :
                  sipRiskAssessment.alignmentStatus === 'CAUTION' ? 'bg-amber-50 text-brand-warning border-amber-100' :
                  'bg-red-50 text-brand-danger border-red-100'
                }`}>
                  {sipRiskAssessment.alignmentStatus}
                </span>
              </div>

              {/* Compatibility Advice Box */}
              <p className="text-xs font-semibold leading-relaxed text-brand-ink bg-white p-3.5 border border-brand-border rounded-xl">
                {sipRiskAssessment.alignmentAdvice}
              </p>

              {/* Compounding Projections summary */}
              <div className="grid grid-cols-3 gap-3 text-center bg-white border border-brand-border p-3 rounded-xl text-[10px] font-bold text-brand-muted">
                <div>
                  <span className="block mb-1">Total Capital</span>
                  <strong className="text-brand-ink text-xs">₹{sipRiskAssessment.totalInvested.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="block mb-1">Projected Yield</span>
                  <strong className="text-brand-success text-xs">₹{Math.round(sipRiskAssessment.estimatedGrowth).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="block mb-1">Estimated Value ({sipRiskAssessment.rate}%)</span>
                  <strong className="text-brand-primary text-xs">₹{Math.round(sipRiskAssessment.projectedValue).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="text-[9px] text-brand-muted leading-relaxed flex gap-1">
                <Info size={11} className="flex-shrink-0 mt-0.5" />
                <span>Yield calculations assume regular daily interest compounding at constant values. Mutual fund valuations fluctuate. Past performance doesn't guarantee future yields.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Goals Display Grid */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Simulated Savings Goals</h2>
            <span className="text-[10px] text-brand-muted font-bold">{goals.length} active target milestones</span>
          </div>

          {goals.length === 0 ? (
            <div className="p-16 text-center surface-card space-y-4 max-w-2xl mx-auto">
              <Target className="w-12 h-12 text-brand-sage mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-brand-ink">No active financial goals</h3>
              <p className="text-brand-muted text-xs leading-relaxed max-w-xs mx-auto">
                Setting specific goals helps structure your savings rules. Create your first simulated goal to baseline your progress.
              </p>
              <button
                onClick={() => setAddOpen(true)}
                className="px-5 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl border-0 cursor-pointer"
              >
                Configure Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100));
                return (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-card p-6 flex flex-col justify-between hover:border-brand-sage transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                        goal.category === 'Short-Term' ? 'bg-emerald-50 text-brand-success border-emerald-100' :
                        goal.category === 'Medium-Term' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-red-50 text-brand-danger border-red-100'
                      }`}>
                        {goal.category}
                      </span>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="text-brand-muted hover:text-brand-danger p-1 rounded transition-colors bg-transparent border-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-base font-bold text-brand-ink mb-1.5">{goal.name}</h3>
                      <div className="flex items-center justify-between text-xs text-brand-muted mb-4">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-brand-primary" />
                          {goal.timeline} Months Timeline
                        </span>
                        <span className="font-bold text-brand-ink">
                          ₹{goal.currentSavings.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className="text-brand-muted">Target Completion</span>
                          <span className="text-brand-primary">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-brand-light rounded-full overflow-hidden border border-brand-border">
                          <div
                            className="h-full bg-brand-primary rounded-full"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-brand-border">
                      <button
                        onClick={() => {
                          setEditGoal(goal);
                          setEditSavings(goal.currentSavings);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-brand-border hover:bg-brand-light/50 text-brand-primary font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Adjust Savings</span>
                      </button>

                      <button
                        onClick={() => openSimulator(goal)}
                        className="flex-1 px-3 py-2 bg-brand-primary text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 hover:opacity-90 transition-all border-0 cursor-pointer shadow-card"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Simulate growth</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* CREATE GOAL MODAL */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-ink/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[4px] bg-brand-primary"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider flex items-center">
                  <Target className="w-5 h-5 mr-2 text-brand-primary" />
                  <span>Configure Financial Goal</span>
                </h3>
                <button
                  onClick={() => setAddOpen(false)}
                  className="text-xs text-brand-muted hover:text-brand-ink font-bold border-0 bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4 text-brand-ink">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Goal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Higher Studies, Emergency Fund"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase">Target Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      placeholder="e.g. 50000"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase">Timeline (Months)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 12"
                      value={newTimeline}
                      onChange={(e) => setNewTimeline(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase">Initial Savings (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      value={newSavings}
                      onChange={(e) => setNewSavings(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl py-2.5 px-4 text-xs outline-none transition-all font-semibold"
                    >
                      <option value="Short-Term">Short-Term (&lt; 1 yr)</option>
                      <option value="Medium-Term">Medium-Term (1-3 yrs)</option>
                      <option value="Long-Term">Long-Term (&gt; 3 yrs)</option>
                    </select>
                  </div>
                </div>

                {addError && (
                  <p className="p-3 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-xl text-[10px] font-semibold text-center">
                    {addError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl text-xs hover:opacity-95 transition-all uppercase tracking-wider border-0 cursor-pointer shadow-card"
                >
                  Create Simulated Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADJUST SAVINGS MODAL */}
      <AnimatePresence>
        {editGoal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-ink/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-white rounded-3xl p-6 border border-brand-border shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[4px] bg-brand-primary"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider flex items-center">
                  <Coins className="w-5 h-5 mr-2 text-brand-primary" />
                  <span>Update Goal Progress</span>
                </h3>
                <button
                  onClick={() => setEditGoal(null)}
                  className="text-xs text-brand-muted hover:text-brand-ink font-bold border-0 bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-brand-muted">Adjust total accumulated savings for the goal <strong className="text-brand-ink">{editGoal.name}</strong>.</p>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Current Savings Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={editGoal.targetAmount}
                    value={editSavings}
                    onChange={(e) => setEditSavings(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl py-2.5 px-4 text-xs text-brand-ink outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleUpdateSavings}
                  className="w-full py-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all uppercase tracking-wider border-0 cursor-pointer shadow-card"
                >
                  Save Adjustments
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPOUNDING INTERACTIVE CALCULATOR MODAL */}
      <AnimatePresence>
        {simGoal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-ink/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="max-w-4xl w-full bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[4px] bg-brand-primary"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-brand-ink uppercase tracking-wider flex items-center">
                  <TrendingUp className="w-5.5 h-5.5 mr-2 text-brand-primary" />
                  <span>Growth Simulator: {simGoal.name}</span>
                </h3>
                <button
                  onClick={() => setSimGoal(null)}
                  className="text-xs text-brand-muted hover:text-brand-ink font-bold cursor-pointer border-0 bg-transparent"
                >
                  Close Simulator
                </button>
              </div>

              {/* Split layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-brand-ink">
                
                {/* Inputs & Coach recommendation */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-brand-muted">MONTHLY SAVINGS CONTRIBUTION</span>
                      <span className="text-brand-primary font-bold">₹{Number(simContribution).toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="50000"
                      step="500"
                      value={simContribution}
                      onChange={(e) => setSimContribution(e.target.value)}
                      className="w-full accent-brand-primary h-1 bg-brand-light rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-brand-muted font-semibold">
                      <span>₹500</span>
                      <span>₹50,000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-brand-muted">EXPECTED ANNUAL RETURN RATE</span>
                      <span className="text-brand-primary font-bold">{simRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="20"
                      step="0.5"
                      value={simRate}
                      onChange={(e) => setSimRate(e.target.value)}
                      className="w-full accent-brand-primary h-1 bg-brand-light rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-brand-muted font-semibold">
                      <span>4% (Risk-free yield)</span>
                      <span>20% (Aggressive stocks)</span>
                    </div>
                  </div>

                  {simResults && (
                    <div className="p-4 bg-brand-light/50 border border-brand-border rounded-2xl space-y-2.5">
                      <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-brand-primary" />
                        Savings Coach Projections
                      </h4>
                      <p className="text-xs text-brand-ink leading-relaxed font-semibold">
                        {simResults.recommendation.replace(/⚠️/g, '⚠️').replace(/🟢/g, '🟢')}
                      </p>

                      <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs font-bold">
                        <span className="text-brand-muted">Target: ₹{simGoal.targetAmount.toLocaleString()}</span>
                        <span className={simResults.metTarget ? 'text-brand-success' : 'text-brand-danger'}>
                          Projected: ₹{simResults.finalSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Line Chart */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-brand-muted">
                    <span>Compounding Growth Chart Curve</span>
                    <span className="text-brand-primary">Simulated Forecasting</span>
                  </div>

                  {simResults ? (
                    <div className="h-[240px] w-full bg-brand-bg border border-brand-border p-2 rounded-2xl">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simResults.projections} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#DDE5DE" />
                          <XAxis
                            dataKey="month"
                            name="Month"
                            tick={{ fill: '#65736D', fontSize: 10 }}
                            tickFormatter={(m) => `M${m}`}
                          />
                          <YAxis
                            tick={{ fill: '#65736D', fontSize: 10 }}
                            tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000) + 'k' : val}`}
                          />
                          <Tooltip
                            contentStyle={{ background: '#FFFFFF', border: '1px solid #DDE5DE', borderRadius: '12px' }}
                            labelStyle={{ color: '#65736D', fontSize: 10, fontWeight: 'bold' }}
                            itemStyle={{ fontSize: 11, color: '#12332C' }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Projected Savings']}
                          />
                          <Line
                            type="monotone"
                            dataKey="savings"
                            stroke="#064E3B"
                            strokeWidth={3}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#C64A4A"
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[240px] bg-brand-bg rounded-2xl flex items-center justify-center text-brand-muted text-xs">
                      Simulating compound matrix...
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Badge Unlocked Celebration */}
      <AnimatePresence>
        {badgeUnlocked && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-ink/50 backdrop-blur-xs">
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

export default Goals;
