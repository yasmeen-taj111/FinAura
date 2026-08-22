import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Plus, Calendar, Coins, Sparkles, Trash2, ArrowUpRight,
  TrendingUp, HelpCircle, Edit2, ShieldAlert, Award, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
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

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (err) {
      console.error('Error fetching goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
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
        // Trigger Layout update
        window.dispatchEvent(new Event('update-progress'));
      }

      setAddOpen(false);
      // Reset form
      setNewName('');
      setNewTarget('');
      setNewTimeline('');
      setNewSavings('');
      setNewCategory('Short-Term');
      
      await fetchGoals();
    } catch (err) {
      console.error('Create goal failed', err);
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
      await fetchGoals();
    } catch (err) {
      console.error('Update savings failed', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this simulated goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      await fetchGoals();
    } catch (err) {
      console.error('Delete goal failed', err);
    }
  };

  // Run compounding simulation
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
      console.error('Simulation failed', err);
    } finally {
      setSimLoading(false);
    }
  };

  // Run simulation whenever sliders change
  useEffect(() => {
    if (simGoal) {
      runSimulation();
    }
  }, [simGoal, simContribution, simRate]);

  const openSimulator = (goal) => {
    setSimGoal(goal);
    // Set default initial contribution relative to remaining target
    const remaining = goal.targetAmount - goal.currentSavings;
    const suggested = remaining > 0 ? Math.round(remaining / goal.timeline) : 1000;
    setSimContribution(Math.max(500, Math.min(50000, suggested)));
    setSimRate(10);
    setSimResults(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-slate-100">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-secondary animate-spin"></div>
        </div>
        <p className="mt-4 text-brand-muted text-xs font-medium">Calibrating goals simulator modules...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 md:px-12 relative overflow-hidden bg-brand-bg text-slate-100">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 z-10 relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest block mb-2">FINANCIAL GOALS SIMULATOR</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Goal Planning Terminal</h1>
          <p className="text-brand-muted text-xs md:text-sm max-w-xl leading-relaxed">
            Create simulated financial goals and plan savings allocations. Use the compounding simulator to forecast growth rates based on variable interest yields and monthly systematic deposits.
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-tr from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-glow-primary hover:opacity-95 transition-all text-xs cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Goals Display Grid */}
      <div className="max-w-7xl mx-auto z-10 relative">
        {goals.length === 0 ? (
          <div className="p-16 text-center glass-card rounded-3xl border border-white/5 space-y-4 max-w-2xl mx-auto">
            <Target className="w-12 h-12 text-brand-secondary mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-white">No active financial goals</h3>
            <p className="text-brand-muted text-xs leading-relaxed max-w-xs mx-auto">
              Setting specific goals helps structure your savings rules. Create your first simulated goal to baseline your progress.
            </p>
            <button
              onClick={() => setAddOpen(true)}
              className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl"
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
                  className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between hover:border-brand-primary/20 hover:shadow-glow-primary transition-all relative overflow-hidden"
                >
                  {/* Category tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
                      goal.category === 'Short-Term' ? 'bg-emerald-500/10 text-brand-success' :
                      goal.category === 'Medium-Term' ? 'bg-indigo-500/10 text-brand-secondary' :
                      'bg-rose-500/10 text-brand-danger'
                    }`}>
                      {goal.category}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="text-slate-500 hover:text-brand-danger p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-100 mb-1.5">{goal.name}</h3>
                    <div className="flex items-center justify-between text-xs text-brand-muted mb-4">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {goal.timeline} Months Timeline
                      </span>
                      <span className="font-bold text-slate-200">
                        ₹{goal.currentSavings.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-semibold">
                        <span className="text-brand-muted">Target Completion</span>
                        <span className="text-brand-secondary">{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        setEditGoal(goal);
                        setEditSavings(goal.currentSavings);
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Adjust Savings</span>
                    </button>

                    <button
                      onClick={() => openSimulator(goal)}
                      className="flex-1 px-3 py-2 bg-brand-primary text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-glow-primary hover:opacity-90 transition-all cursor-pointer"
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
      </div>

      {/* CREATE GOAL MODAL */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-bg/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full glass-card rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-primary to-brand-secondary"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-brand-secondary" />
                  <span>Configure Financial Goal</span>
                </h3>
                <button
                  onClick={() => setAddOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-200 font-bold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-muted uppercase">Goal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Higher Studies, emergency fund, Laptop"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-brand-bg/40 border border-white/10 focus:border-brand-primary rounded-xl py-3 px-4 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-muted uppercase">Target Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      placeholder="e.g. 50000"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-full bg-brand-bg/40 border border-white/10 focus:border-brand-primary rounded-xl py-3 px-4 text-xs text-slate-200 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-muted uppercase">Timeline (Months)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 12"
                      value={newTimeline}
                      onChange={(e) => setNewTimeline(e.target.value)}
                      className="w-full bg-brand-bg/40 border border-white/10 focus:border-brand-primary rounded-xl py-3 px-4 text-xs text-slate-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-muted uppercase">Initial Savings (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      value={newSavings}
                      onChange={(e) => setNewSavings(e.target.value)}
                      className="w-full bg-brand-bg/40 border border-white/10 focus:border-brand-primary rounded-xl py-3 px-4 text-xs text-slate-200 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-muted uppercase">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-brand-bg/40 border border-white/10 focus:border-brand-primary rounded-xl py-3 px-4 text-xs text-slate-200 outline-none transition-all"
                    >
                      <option value="Short-Term">Short-Term (&lt; 1 yr)</option>
                      <option value="Medium-Term">Medium-Term (1-3 yrs)</option>
                      <option value="Long-Term">Long-Term (&gt; 3 yrs)</option>
                    </select>
                  </div>
                </div>

                {addError && (
                  <p className="p-3 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-xl text-[10px] font-semibold">
                    {addError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl text-xs shadow-glow-primary hover:opacity-95 transition-all uppercase tracking-wider"
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
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-bg/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full glass-card rounded-3xl p-6 border border-white/10 shadow-glass relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-primary to-brand-secondary"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white flex items-center">
                  <Coins className="w-5 h-5 mr-2 text-brand-secondary" />
                  <span>Update Current Savings</span>
                </h3>
                <button
                  onClick={() => setEditGoal(null)}
                  className="text-xs text-slate-500 hover:text-slate-200 font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-brand-muted">Adjust total accumulated savings for the goal <strong className="text-slate-300">{editGoal.name}</strong>.</p>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Current Savings Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={editGoal.targetAmount}
                    value={editSavings}
                    onChange={(e) => setEditSavings(e.target.value)}
                    className="w-full bg-brand-bg/40 border border-white/10 focus:border-brand-primary rounded-xl py-3 px-4 text-sm text-slate-200 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleUpdateSavings}
                  className="w-full py-3 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-glow-primary hover:opacity-95 transition-all uppercase tracking-wider"
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
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-bg/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="max-w-4xl w-full glass-card rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-brand-primary to-brand-secondary"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <TrendingUp className="w-5.5 h-5.5 mr-2 text-brand-secondary" />
                  <span>Growth Simulator: {simGoal.name}</span>
                </h3>
                <button
                  onClick={() => setSimGoal(null)}
                  className="text-xs text-slate-500 hover:text-slate-200 font-bold cursor-pointer"
                >
                  Close Terminal
                </button>
              </div>

              {/* Split layout: Inputs left, Charts right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Inputs & Coach recommendation */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Monthly contribution slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-brand-muted">MONTHLY SAVINGS SIP</span>
                      <span className="text-white font-extrabold text-sm">₹{Number(simContribution).toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="50000"
                      step="500"
                      value={simContribution}
                      onChange={(e) => setSimContribution(e.target.value)}
                      className="w-full accent-brand-secondary h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>₹500</span>
                      <span>₹50,000</span>
                    </div>
                  </div>

                  {/* Return rate slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-brand-muted">EXPECTED ANNUAL RETURN RATE</span>
                      <span className="text-white font-extrabold text-sm">{simRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="20"
                      step="0.5"
                      value={simRate}
                      onChange={(e) => setSimRate(e.target.value)}
                      className="w-full accent-brand-secondary h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>4% (Liquid/FD yield)</span>
                      <span>20% (Aggressive stocks)</span>
                    </div>
                  </div>

                  {/* AI Recommendations advice card */}
                  {simResults && (
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2.5">
                      <h4 className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest flex items-center">
                        <Sparkles className="w-4 h-4 mr-1 text-brand-secondary fill-brand-secondary" />
                        Savings Coach Projections
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {simResults.recommendation}
                      </p>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-brand-muted">Target: ₹{simGoal.targetAmount.toLocaleString()}</span>
                        <span className={simResults.metTarget ? 'text-brand-success' : 'text-brand-danger'}>
                          Projected: ₹{simResults.finalSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Compound Growth Line Chart */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Compound Interest Savings Projection Curve</span>
                    <span className="text-brand-secondary">SIP Simulation Terminal</span>
                  </div>

                  {simResults ? (
                    <div className="h-[240px] w-full bg-slate-950/40 border border-white/5 p-2 rounded-2xl">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simResults.projections} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis
                            dataKey="month"
                            name="Month"
                            tick={{ fill: '#475569', fontSize: 10 }}
                            tickFormatter={(m) => `M${m}`}
                          />
                          <YAxis
                            tick={{ fill: '#475569', fontSize: 10 }}
                            tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000) + 'k' : val}`}
                          />
                          <Tooltip
                            contentStyle={{ background: '#131520', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                            labelStyle={{ color: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                            itemStyle={{ fontSize: 11, color: '#f8fafc' }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Projected Savings']}
                          />
                          <Line
                            type="monotone"
                            dataKey="savings"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#ef4444"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[240px] bg-slate-900/50 rounded-2xl flex items-center justify-center text-brand-muted text-xs">
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
                className="w-full py-3 bg-brand-primary text-white text-xs font-bold rounded-xl"
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
