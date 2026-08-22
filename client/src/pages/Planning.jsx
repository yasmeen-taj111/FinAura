import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calculator, CircleHelp, Landmark, SlidersHorizontal, Target, Wallet } from 'lucide-react';

const currency = value => `₹${Math.round(value || 0).toLocaleString('en-IN')}`;
const inputClass = 'mt-2 w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-ink outline-none transition focus:border-brand-primary';

const Field = ({ label, value, onChange, min = 0, max, step = 500 }) => <label className="block text-sm font-medium text-brand-ink">{label}<input className={inputClass} type="number" min={min} max={max} step={step} value={value} onChange={event => onChange(Math.max(min, Number(event.target.value) || 0))} /></label>;

const Planning = () => {
  const [income, setIncome] = useState(50000);
  const [essential, setEssential] = useState(22000);
  const [discretionary, setDiscretionary] = useState(7000);
  const [emi, setEmi] = useState(4000);
  const [emergencyMonths, setEmergencyMonths] = useState(3);
  const [sip, setSip] = useState(5000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(1);

  const plan = useMemo(() => {
    const committed = essential + discretionary + emi;
    const available = Math.max(0, income - committed);
    const essentialRatio = income ? essential / income : 1;
    const debtRatio = income ? emi / income : 1;
    const emergencyWeight = emergencyMonths < 3 ? 0.45 : essentialRatio > 0.55 ? 0.35 : 0.2;
    const debtWeight = debtRatio > 0.2 ? 0.25 : 0.1;
    const goalWeight = 0.25;
    const investingWeight = Math.max(0.15, 1 - emergencyWeight - debtWeight - goalWeight);
    return {
      available,
      emergency: Math.round(available * emergencyWeight),
      debt: Math.round(available * debtWeight),
      goals: Math.round(available * goalWeight),
      investing: Math.round(available * investingWeight),
      emergencyTarget: essential * emergencyMonths,
      reason: emergencyMonths < 3 ? 'Your emergency reserve is below three months of essentials, so the plan prioritizes a cash buffer first.' : debtRatio > 0.2 ? 'Your EMI takes more than 20% of income, so the plan directs more free cash toward debt resilience.' : 'Your core expenses are manageable, so the plan balances goals, emergency savings and long-term investing.',
    };
  }, [income, essential, discretionary, emi, emergencyMonths]);

  const projection = useMemo(() => {
    const monthlyRate = rate / 1200;
    let value = 0;
    return Array.from({ length: years + 1 }, (_, year) => {
      if (year) for (let month = 0; month < 12; month += 1) value = value * (1 + monthlyRate) + sip;
      return { year: `Year ${year}`, value: Math.round(value), invested: year * 12 * sip };
    });
  }, [sip, rate, years]);
  const finalValue = projection.at(-1)?.value || 0;
  const totalInvested = sip * 12 * years;

  return <div className="page-shell px-5 py-8 md:px-8 lg:px-12 lg:py-10"><div className="mx-auto max-w-6xl"><header><p className="eyebrow">Plan</p><h1 className="mt-2 font-serif text-4xl text-brand-ink md:text-5xl">Make your money plan feel realistic.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">Try scenarios safely. These calculations are separate from your saved financial profile and are meant for planning, not financial advice.</p></header>
    <section className="mt-8 grid gap-5 lg:grid-cols-5"><article className="surface-card p-6 lg:col-span-2"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand-primary"><SlidersHorizontal size={20} /></span><div><p className="eyebrow">What if?</p><h2 className="font-semibold text-brand-ink">Salary simulator</h2></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><Field label="Monthly income" value={income} onChange={setIncome} /><Field label="Essential expenses" value={essential} onChange={setEssential} /><Field label="Discretionary spending" value={discretionary} onChange={setDiscretionary} /><Field label="EMI / loan payments" value={emi} onChange={setEmi} /><label className="block text-sm font-medium text-brand-ink">Emergency reserve goal <span className="font-normal text-brand-muted">({emergencyMonths} months)</span><input className="mt-3 w-full accent-brand-primary" type="range" min="1" max="6" value={emergencyMonths} onChange={event => setEmergencyMonths(Number(event.target.value))} /></label></div></article>
      <article className="surface-card p-6 lg:col-span-3"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Suggested monthly allocation</p><h2 className="mt-1 text-xl font-semibold text-brand-ink">You have {currency(plan.available)} to direct with intention.</h2></div><Wallet className="text-brand-primary" size={22} /></div><p className="mt-3 rounded-xl bg-brand-light p-3 text-sm leading-6 text-brand-primary">{plan.reason}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Allocation label="Emergency savings" value={plan.emergency} description={`Build toward ${currency(plan.emergencyTarget)}`} /><Allocation label="Goal contributions" value={plan.goals} description="For near- and medium-term goals" /><Allocation label="Long-term investing" value={plan.investing} description="Only after your basics are covered" /><Allocation label="Debt buffer" value={plan.debt} description="Extra breathing room around EMIs" /></div><div className="mt-5 border-t border-brand-border pt-4 text-xs leading-5 text-brand-muted"><CircleHelp size={14} className="mr-1 inline" /> This adapts to your income, spending, loan load and emergency goal. It is not a fixed percentage rule.</div></article></section>
    <section className="mt-8 grid gap-5 lg:grid-cols-5"><article className="surface-card p-6 lg:col-span-2"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand-primary"><Calculator size={20} /></span><div><p className="eyebrow">Estimate</p><h2 className="font-semibold text-brand-ink">SIP calculator</h2></div></div><div className="mt-6 space-y-4"><Field label="Monthly contribution" value={sip} onChange={setSip} /><label className="block text-sm font-medium text-brand-ink">Expected annual return <span className="float-right text-brand-primary">{rate}%</span><input className="mt-3 w-full accent-brand-primary" type="range" min="1" max="18" value={rate} onChange={event => setRate(Number(event.target.value))} /></label><label className="block text-sm font-medium text-brand-ink">Duration <span className="float-right text-brand-primary">{years} years</span><input className="mt-3 w-full accent-brand-primary" type="range" min="1" max="30" value={years} onChange={event => setYears(Number(event.target.value))} /></label></div></article>
      <article className="surface-card p-6 lg:col-span-3"><p className="eyebrow">Projected value</p><div className="mt-1 flex flex-wrap items-end justify-between gap-3"><div><span className="font-serif text-4xl text-brand-primary">{currency(finalValue)}</span><p className="mt-1 text-sm text-brand-muted">Estimated value after {years} years</p></div><div className="text-right text-sm"><p className="text-brand-muted">Total invested</p><p className="font-semibold text-brand-ink">{currency(totalInvested)}</p><p className="mt-1 text-brand-muted">Estimated growth: <span className="font-semibold text-brand-success">{currency(finalValue - totalInvested)}</span></p></div></div><div className="mt-6 h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={projection}><defs><linearGradient id="sipFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8FAF9A" stopOpacity={0.55} /><stop offset="100%" stopColor="#8FAF9A" stopOpacity={0.05} /></linearGradient></defs><XAxis dataKey="year" tick={{ fontSize: 10, fill: '#65736D' }} axisLine={false} tickLine={false} interval="preserveStartEnd" /><YAxis tickFormatter={value => `₹${Math.round(value / 1000)}k`} tick={{ fontSize: 10, fill: '#65736D' }} axisLine={false} tickLine={false} width={45} /><Tooltip formatter={value => currency(value)} /><Area type="monotone" dataKey="value" stroke="#064E3B" strokeWidth={2} fill="url(#sipFill)" /></AreaChart></ResponsiveContainer></div><p className="mt-4 text-xs leading-5 text-brand-muted">Projected returns are estimates based on a constant assumed rate. Market returns are not guaranteed and can fluctuate.</p></article></section>
    <div className="mt-8 grid gap-4 sm:grid-cols-2"><Link to="/goals" className="surface-card flex items-center gap-3 p-5 transition hover:border-brand-sage"><Target className="text-brand-primary" /><span><span className="block font-semibold text-brand-ink">Set and track goals</span><span className="text-sm text-brand-muted">Turn this plan into milestones.</span></span></Link><Link to="/sandbox" className="surface-card flex items-center gap-3 p-5 transition hover:border-brand-sage"><Landmark className="text-brand-primary" /><span><span className="block font-semibold text-brand-ink">Try the virtual lab</span><span className="text-sm text-brand-muted">Explore investments with virtual money.</span></span></Link></div>
  </div></div>;
};

const Allocation = ({ label, value, description }) => <div className="rounded-xl border border-brand-border p-4"><p className="text-sm font-semibold text-brand-ink">{label}</p><p className="mt-2 text-xl font-bold text-brand-primary">{currency(value)}</p><p className="mt-1 text-xs leading-5 text-brand-muted">{description}</p></div>;

export default Planning;
