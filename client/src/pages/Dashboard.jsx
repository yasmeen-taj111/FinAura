import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BrainCircuit, ChartNoAxesCombined, CircleAlert, Landmark, Sparkles, Target } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const scoreMeta = [
  { key: 'moneyManagement', label: 'Money basics' },
  { key: 'investingKnowledge', label: 'Investing' },
  { key: 'riskUnderstanding', label: 'Risk' },
  { key: 'goalPlanning', label: 'Goal planning' },
  { key: 'financialBehavior', label: 'Financial habits' },
];

const money = (value = 0) => `₹${Number(value).toLocaleString('en-IN')}`;

const greetingForHour = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const goalStatus = (goal) => {
  const progress = goal.targetAmount ? goal.currentSavings / goal.targetAmount : 0;
  if (progress >= 1) return { label: 'Completed', className: 'bg-emerald-50 text-brand-success' };
  const expected = Math.min(1, 1 / Math.max(goal.timeline, 1));
  if (progress < expected * 0.5) return { label: 'At risk', className: 'bg-red-50 text-brand-danger' };
  if (progress < expected) return { label: 'Needs attention', className: 'bg-amber-50 text-brand-warning' };
  return { label: 'On track', className: 'bg-brand-light text-brand-primary' };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.get('/profile'), api.get('/goals'), api.get('/portfolio')]).then(([profileResult, goalsResult, portfolioResult]) => {
      if (profileResult.status === 'fulfilled') setProfile(profileResult.value.data);
      if (goalsResult.status === 'fulfilled') setGoals(goalsResult.value.data);
      if (portfolioResult.status === 'fulfilled') setPortfolio(portfolioResult.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const weakest = useMemo(() => {
    if (!profile?.scores) return null;
    return scoreMeta.reduce((lowest, item) => profile.scores[item.key] < profile.scores[lowest.key] ? item : lowest, scoreMeta[0]);
  }, [profile]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-brand-bg text-sm text-brand-muted">Preparing your financial journey…</div>;

  if (!profile?.assessmentCompleted) return <div className="page-shell px-6 py-12 lg:px-12"><div className="mx-auto max-w-2xl pt-12"><p className="eyebrow">Start here</p><h1 className="mt-3 font-serif text-4xl text-brand-ink md:text-5xl">Build your financial confidence, one clear step at a time.</h1><p className="mt-5 max-w-xl leading-7 text-brand-muted">Take a short assessment so FinAura can suggest learning that fits where you are today.</p><div className="surface-card mt-8 p-6"><div className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-primary"><BrainCircuit size={21} /></span><div><h2 className="font-semibold text-brand-ink">Your first step: Financial Confidence Assessment</h2><p className="mt-1 text-sm leading-6 text-brand-muted">It covers money habits, planning, investing and risk, there are no right financial circumstances required.</p><Link to="/assessment" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white">Begin assessment <ArrowRight size={16} /></Link></div></div></div></div></div>;

  const firstName = user?.name?.trim().split(/\s+/)[0] || profile?.userId?.name?.trim().split(/\s+/)[0] || 'User';
  const greeting = greetingForHour(new Date().getHours());
  const nextTitle = weakest ? `Understand ${weakest.label.toLowerCase()}` : 'Continue your learning path';
  return <div className="page-shell px-5 py-8 md:px-8 lg:px-12 lg:py-10">
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Your financial journey</p><h1 className="mt-2 font-serif text-4xl text-brand-ink md:text-5xl">{greeting}, {firstName}.</h1><p className="mt-3 text-sm leading-6 text-brand-muted">Small, informed decisions add up. Here is your clearest next step.</p></div><Link to="/plan" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline">View your plan <ArrowRight size={16} /></Link></header>
      <section className="grid gap-5 lg:grid-cols-3">
        <article className="surface-card p-6 lg:col-span-2"><div className="flex items-start justify-between gap-5"><div><p className="eyebrow">Financial confidence</p><div className="mt-2 flex items-baseline gap-2"><span className="font-serif text-5xl text-brand-primary">{profile.scores.overall}</span><span className="text-sm text-brand-muted">/ 100</span></div><p className="mt-3 max-w-md text-sm leading-6 text-brand-muted">Your score reflects what you understand today. Use it to choose your next learning step—not as a judgment.</p></div><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-light text-brand-primary"><Sparkles size={21} /></span></div><div className="mt-6 grid gap-3 sm:grid-cols-5">{scoreMeta.map(({ key, label }) => <div key={key}><div className="mb-1.5 flex justify-between text-[11px] font-medium text-brand-muted"><span>{label}</span><span>{profile.scores[key]}</span></div><div className="h-1.5 rounded-full bg-brand-light"><div className="h-full rounded-full bg-brand-primary" style={{ width: `${profile.scores[key]}%` }} /></div></div>)}</div></article>
        <article className="rounded-2xl bg-brand-primary p-6 text-white"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-sage">Your next step</p><h2 className="mt-3 font-serif text-3xl">{nextTitle}</h2><p className="mt-3 text-sm leading-6 text-white/75">{weakest ? `${weakest.label} is the area with the most room to grow. Start with a focused lesson and build from there.` : 'Keep building your financial foundation.'}</p><Link to="/learn" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-primary">Go to learning path <ArrowRight size={16} /></Link></article>
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <article className="surface-card p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><p className="eyebrow">Goals</p><h2 className="mt-1 text-xl font-semibold text-brand-ink">Keep your plans in view</h2></div><Target className="text-brand-primary" size={21} /></div>{goals.length ? <div className="mt-5 divide-y divide-brand-border">{goals.slice(0, 3).map(goal => { const pct = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100)); const status = goalStatus(goal); return <div key={goal._id} className="py-4 first:pt-0"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-brand-ink">{goal.name}</p><p className="mt-1 text-xs text-brand-muted">{money(goal.currentSavings)} of {money(goal.targetAmount)} · {goal.timeline} months</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span></div><div className="mt-3 h-1.5 rounded-full bg-brand-light"><div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} /></div></div>; })}</div> : <div className="mt-5 rounded-xl bg-brand-light p-4 text-sm leading-6 text-brand-muted">A goal turns a good intention into a plan. Add your first one when you are ready.</div>}<Link to="/goals" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">Manage goals <ArrowRight size={16} /></Link></article>
        <article className="surface-card p-6"><p className="eyebrow">Financial snapshot</p><div className="mt-4 space-y-4"><div className="flex justify-between border-b border-brand-border pb-3 text-sm"><span className="text-brand-muted">Monthly income</span><strong>{money(profile.monthlyIncome)}</strong></div><div className="flex justify-between border-b border-brand-border pb-3 text-sm"><span className="text-brand-muted">Essential spending</span><strong>{money(profile.monthlyExpenses)}</strong></div><div className="flex justify-between text-sm"><span className="text-brand-muted">Monthly savings</span><strong className="text-brand-success">{money(profile.monthlySavings)}</strong></div></div><Link to="/plan" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">Plan your money <ArrowRight size={16} /></Link></article>
      </section>
      <section className="mt-5 grid gap-5 md:grid-cols-2" id="assistant"><article className="surface-card p-6"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-primary"><Landmark size={20} /></span><div><p className="eyebrow">Virtual portfolio</p><h2 className="mt-1 text-lg font-semibold text-brand-ink">Practice before you invest</h2><p className="mt-2 text-sm leading-6 text-brand-muted">{portfolio ? `${money(portfolio.totalPortfolioValue)} in virtual funds, clearly separate from real-world investing.` : 'Explore investing with virtual money—never real funds.'}</p><Link to="/sandbox" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">Open virtual lab <ArrowRight size={16} /></Link></div></div></article><article className="surface-card p-6"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-primary"><CircleAlert size={20} /></span><div><p className="eyebrow">Today’s learning insight</p><h2 className="mt-1 text-lg font-semibold text-brand-ink">Diversification is about balance</h2><p className="mt-2 text-sm leading-6 text-brand-muted">Spreading money across asset types can reduce the impact of any one investment performing poorly. It does not remove risk.</p><Link to="/learn" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">Explore this topic <BookOpen size={16} /></Link></div></div></article></section>
      <p className="mt-8 flex items-center gap-2 text-xs leading-5 text-brand-muted"><ChartNoAxesCombined size={15} /> FinAura is for education and planning. Projections and virtual investments are estimates, not investment advice.</p>
    </div>
  </div>;
};

export default Dashboard;
