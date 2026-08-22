import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, HelpCircle, CheckCircle, XCircle, Award, Zap, 
  ChevronRight, Calculator, FileText, Check, Edit3, Search
} from 'lucide-react';
import api from '../services/api';

const LessonViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab State: 'material', 'tools', 'glossary', 'notes'
  const [activeTab, setActiveTab] = useState('material');

  // Scroll Progress State
  const [scrollPercent, setScrollPercent] = useState(0);

  // User Notes State
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  // Quiz states
  const [quizOpen, setQuizOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: selectedOptionString }
  const [quizResult, setQuizResult] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Glossary search state
  const [glossarySearch, setGlossarySearch] = useState('');

  // Interactive Calculators state
  // 1. SIP Calculator
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);
  
  // 2. Compound Interest
  const [ciPrincipal, setCiPrincipal] = useState(10000);
  const [ciRate, setCiRate] = useState(10);
  const [ciYears, setCiYears] = useState(5);
  const [ciFreq, setCiFreq] = useState(12); // monthly compounding default

  // 3. 50/30/20 Budget Calculator
  const [budgetIncome, setBudgetIncome] = useState(50000);

  // 4. Inflation Calculator
  const [infPrincipal, setInfPrincipal] = useState(100000);
  const [infRate, setInfRate] = useState(6);
  const [infYears, setInfYears] = useState(10);

  // 5. Mock Chart state
  const [chartTrend, setChartTrend] = useState('uptrend');
  const [selectedCandle, setSelectedCandle] = useState(null);

  // Fetch lesson data
  const fetchLesson = async () => {
    try {
      const response = await api.get(`/learning/lessons/${id}`);
      setData(response.data);
      setQuizOpen(false);
      setSelectedAnswers({});
      setQuizResult(null);
      setCurrentQuestionIdx(0);
      setActiveTab('material');
      
      // Load saved notes
      const savedNotes = localStorage.getItem(`finaura_notes_${id}`);
      setNotes(savedNotes || '');
    } catch (err) {
      console.error('Error fetching lesson data', err);
      setError('Could not fetch lesson content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [id]);

  // Scroll Progress handler
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercent((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Notes persistence
  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem(`finaura_notes_${id}`, val);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleSelectOption = (qIdx, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: option
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([idx, opt]) => ({
        index: parseInt(idx, 10),
        selectedOption: opt
      }));

      if (formattedAnswers.length < data.quiz.questions.length) {
        alert('Please answer all quiz questions before submitting.');
        return;
      }

      setLoading(true);
      const res = await api.post(`/learning/lessons/${id}/quiz`, {
        answers: formattedAnswers
      });
      setQuizResult(res.data);
      window.dispatchEvent(new Event('update-progress'));
    } catch (err) {
      console.error('Error submitting quiz', err);
      alert('Could not grade quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-brand-ink">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary animate-spin"></div>
        </div>
        <p className="mt-4 text-brand-muted text-xs font-semibold">Opening Study Material...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen py-10 px-6 max-w-2xl mx-auto text-center flex flex-col items-center justify-center bg-brand-bg text-brand-ink">
        <h2 className="text-xl font-bold text-brand-danger mb-2">Access Error</h2>
        <p className="text-brand-muted text-sm mb-6">{error || 'Lesson not found'}</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2 bg-brand-primary rounded-xl font-bold text-sm text-white hover:opacity-90">
          Go Back
        </button>
      </div>
    );
  }

  const { lesson, quiz } = data;

  // Calculators dynamic detection
  const showSipCalc = lesson.title.toLowerCase().includes('sip') || lesson.title.toLowerCase().includes('mutual fund');
  const showCompoundingCalc = lesson.title.toLowerCase().includes('compound') || lesson.title.toLowerCase().includes('interest');
  const showBudgetCalc = lesson.title.toLowerCase().includes('budget') || lesson.title.toLowerCase().includes('need') || lesson.title.toLowerCase().includes('want');
  const showInflationCalc = lesson.title.toLowerCase().includes('inflation') || lesson.title.toLowerCase().includes('retirement');
  const showChartCalc = lesson.title.toLowerCase().includes('chart') || lesson.title.toLowerCase().includes('technical') || lesson.title.toLowerCase().includes('candlestick') || lesson.title.toLowerCase().includes('trend') || lesson.title.toLowerCase().includes('indicator');

  // Perform Calculations
  const sipMonths = sipYears * 12;
  const monthlyRate = sipRate / 12 / 100;
  const sipInvested = sipMonthly * sipMonths;
  const sipFutureValue = monthlyRate > 0 
    ? Math.round(sipMonthly * ((Math.pow(1 + monthlyRate, sipMonths) - 1) / monthlyRate) * (1 + monthlyRate))
    : sipInvested;
  const sipGain = sipFutureValue - sipInvested;

  const ciN = ciFreq;
  const ciRateDecimal = ciRate / 100;
  const ciAccumulated = Math.round(ciPrincipal * Math.pow(1 + ciRateDecimal / ciN, ciN * ciYears));
  const ciInterest = ciAccumulated - ciPrincipal;

  const needsAmount = Math.round(budgetIncome * 0.5);
  const wantsAmount = Math.round(budgetIncome * 0.3);
  const savingsAmount = Math.round(budgetIncome * 0.2);

  const infEroded = Math.round(infPrincipal / Math.pow(1 + infRate / 100, infYears));
  const infLoss = infPrincipal - infEroded;
  const infEquivalent = Math.round(infPrincipal * Math.pow(1 + infRate / 100, infYears));

  const glossaryTerms = [
    { name: 'Compounding', definition: 'The financial process where an investment earns interest or dividends, which are then reinvested to earn even more interest in subsequent periods.' },
    { name: 'Inflation', definition: 'The rate at which the general level of prices for goods and services is rising, subsequently eroding the purchasing power of your money.' },
    { name: 'SIP (Systematic Investment Plan)', definition: 'An investment channel that allows you to contribute a fixed sum regularly into a mutual fund scheme, promoting rupee-cost averaging.' },
    { name: 'NAV (Net Asset Value)', definition: 'The net value of an entity (e.g. mutual fund unit), calculated as total assets minus total liabilities, divided by outstanding units.' },
    { name: 'Expense Ratio', definition: 'The annual fee charged by a mutual fund company to cover its management, administration, and marketing costs, deducted from fund assets.' },
    { name: 'Asset Allocation', definition: 'An investment strategy that aims to balance risk and reward by dividing a portfolio\'s assets among equities, fixed-income, and cash.' },
    { name: 'P/E (Price-to-Earnings) Ratio', definition: 'A valuation ratio of a company\'s current share price compared to its per-share earnings (EPS), showing what the market pays for earnings.' },
    { name: 'Economic Moat', definition: 'A business\'s ability to maintain a competitive advantage over its competitors in order to protect its long-term profits and market share.' },
    { name: 'UPI (Unified Payments Interface)', definition: 'An instant real-time payment system developed by NPCI in India that facilitates inter-bank peer-to-peer transactions.' },
    { name: 'Demat Account', definition: 'An electronic account used to hold shares, bonds, and government securities in a dematerialized (digitized) form rather than physical papers.' },
    { name: 'LTCG (Long-Term Capital Gains)', definition: 'Tax levied on the profits earned from selling capital assets held for longer than a specified duration (e.g., 1 year for equities).' },
    { name: 'STCG (Short-Term Capital Gains)', definition: 'Tax levied on profits earned from selling capital assets held for a short period (e.g., less than 1 year for equities).' },
    { name: 'Volatility', definition: 'A statistical measure of the dispersion of returns for a given security or market index, representing the rate and magnitude of price swings.' },
    { name: 'Support and Resistance', definition: 'Horizontal chart levels where prices historically tend to bounce or fail, representing concentrations of buying demand and selling supply.' }
  ];

  const filteredGlossary = glossaryTerms.filter(term => 
    term.name.toLowerCase().includes(glossarySearch.toLowerCase()) || 
    term.definition.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const generateCandles = () => {
    if (chartTrend === 'uptrend') {
      return [
        { open: 100, close: 105, high: 108, low: 98, date: 'Day 1' },
        { open: 104, close: 102, high: 106, low: 101, date: 'Day 2' },
        { open: 102, close: 112, high: 114, low: 100, date: 'Day 3' },
        { open: 111, close: 118, high: 120, low: 109, date: 'Day 4' },
        { open: 118, close: 116, high: 122, low: 115, date: 'Day 5' },
        { open: 116, close: 125, high: 128, low: 113, date: 'Day 6' },
        { open: 125, close: 135, high: 138, low: 124, date: 'Day 7' }
      ];
    } else if (chartTrend === 'downtrend') {
      return [
        { open: 130, close: 124, high: 132, low: 122, date: 'Day 1' },
        { open: 124, close: 126, high: 128, low: 121, date: 'Day 2' },
        { open: 126, close: 118, high: 127, low: 116, date: 'Day 3' },
        { open: 118, close: 110, high: 120, low: 108, date: 'Day 4' },
        { open: 110, close: 113, high: 115, low: 109, date: 'Day 5' },
        { open: 113, close: 105, high: 114, low: 103, date: 'Day 6' },
        { open: 105, close: 95, high: 107, low: 92, date: 'Day 7' }
      ];
    } else {
      return [
        { open: 110, close: 114, high: 117, low: 108, date: 'Day 1' },
        { open: 114, close: 111, high: 115, low: 109, date: 'Day 2' },
        { open: 111, close: 109, high: 113, low: 106, date: 'Day 3' },
        { open: 109, close: 115, high: 118, low: 108, date: 'Day 4' },
        { open: 115, close: 112, high: 116, low: 110, date: 'Day 5' },
        { open: 112, close: 114, high: 117, low: 111, date: 'Day 6' },
        { open: 114, close: 110, high: 115, low: 107, date: 'Day 7' }
      ];
    }
  };

  const candles = generateCandles();
  const maxPrice = Math.max(...candles.map(c => c.high));
  const minPrice = Math.min(...candles.map(c => c.low));

  return (
    <div className="min-h-screen py-10 px-4 md:px-12 relative overflow-hidden bg-brand-bg text-brand-ink">
      <div className="fixed top-0 left-0 w-full h-1 bg-brand-light z-50">
        <div 
          className="h-full bg-brand-primary transition-all duration-100" 
          style={{ width: `${scrollPercent}%` }}
        ></div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-sage/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto z-10 relative">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Curriculum Map</span>
        </button>

        <div className="surface-card rounded-3xl p-6 md:p-8 border border-brand-border shadow-card mb-8">
          <div className="flex items-center space-x-2 text-brand-primary text-xs font-bold uppercase tracking-widest mb-3">
            <BookOpen className="w-4.5 h-4.5" />
            <span>Academic Study Material</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-ink mb-2">
            {lesson.title}
          </h1>
          <p className="text-brand-muted text-xs md:text-sm">
            Read carefully, test ideas in the calculator, take notes, and complete the quiz to earn XP rewards.
          </p>

          <div className="flex flex-wrap border-b border-brand-border mt-6 gap-2">
            <button
              onClick={() => setActiveTab('material')}
              className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all border-b-2 ${
                activeTab === 'material' 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-brand-muted hover:text-brand-primary'
              }`}
            >
              <FileText className="w-4 h-4" />
              Syllabus Study Material
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all border-b-2 ${
                activeTab === 'tools' 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-brand-muted hover:text-brand-primary'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Interactive Tools
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all border-b-2 ${
                activeTab === 'glossary' 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-brand-muted hover:text-brand-primary'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Glossary & Terms
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-3 px-4 text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all border-b-2 relative ${
                activeTab === 'notes' 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-brand-muted hover:text-brand-primary'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              My Study Notes
              {notes.trim().length > 0 && (
                <span className="absolute top-0 right-1 w-2.5 h-2.5 rounded-full bg-brand-primary"></span>
              )}
            </button>
          </div>

          <div className="py-6">
            <AnimatePresence mode="wait">
              {activeTab === 'material' && (
                <motion.div
                  key="material"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div 
                    className="prose max-w-none text-brand-ink text-sm md:text-base leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />

                  {lesson.videoUrl && (
                    <div className="rounded-2xl border border-brand-border bg-brand-light p-5 mt-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-brand-primary" />
                        Companion Lesson Video
                      </p>
                      <h3 className="mt-1.5 text-sm font-bold text-brand-ink">{lesson.videoTitle || 'Watch the companion lecture'}</h3>
                      <p className="mt-1 text-xs text-brand-muted">Explore structured audio-visual lectures mapped to Indian Varsity lessons.</p>
                      <a 
                        href={lesson.videoUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-all shadow-card"
                      >
                        Watch companion video
                      </a>
                    </div>
                  )}

                  <div className="p-5 bg-brand-light/40 border border-brand-border rounded-2xl mt-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center">
                      <Zap className="w-4 h-4 mr-1 text-brand-primary fill-brand-primary" />
                      FinAura Academy Insight
                    </h4>
                    <p className="text-xs leading-relaxed text-brand-muted mt-1.5">
                      Understanding definitions is the first level. Practice allocating your portfolio and mapping goals in the sandbox features, then run simulation stress tests. Always verify guidelines before committing real-world capital.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'tools' && (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-bold text-brand-ink flex items-center gap-1.5">
                    <Calculator className="w-5 h-5 text-brand-primary" />
                    Topic Interactive Calculator
                  </h3>
                  <p className="text-xs text-brand-muted mb-4">
                    Modify the parameters to see the immediate financial output calculations for this module.
                  </p>

                  {showSipCalc && (
                    <div className="bg-brand-light/35 p-5 rounded-2xl border border-brand-border space-y-5">
                      <h4 className="font-bold text-sm text-brand-primary">SIP Wealth Accumulator</h4>
                      
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Monthly SIP Amount (₹)</label>
                          <input 
                            type="number" 
                            value={sipMonthly} 
                            onChange={(e) => setSipMonthly(Math.max(100, parseInt(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                          <input 
                            type="range" min="500" max="100000" step="500" value={sipMonthly}
                            onChange={(e) => setSipMonthly(parseInt(e.target.value))}
                            className="w-full mt-2 accent-brand-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Expected Annual Return (%)</label>
                          <input 
                            type="number" 
                            value={sipRate} 
                            onChange={(e) => setSipRate(Math.max(1, parseFloat(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                          <input 
                            type="range" min="1" max="30" step="0.5" value={sipRate}
                            onChange={(e) => setSipRate(parseFloat(e.target.value))}
                            className="w-full mt-2 accent-brand-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Time Period (Years)</label>
                          <input 
                            type="number" 
                            value={sipYears} 
                            onChange={(e) => setSipYears(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                          <input 
                            type="range" min="1" max="40" step="1" value={sipYears}
                            onChange={(e) => setSipYears(parseInt(e.target.value))}
                            className="w-full mt-2 accent-brand-primary"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-brand-border text-center">
                        <div className="p-3 bg-white rounded-xl border border-brand-border">
                          <span className="text-[10px] uppercase font-bold text-brand-muted">Invested Capital</span>
                          <p className="text-base font-bold text-brand-ink mt-1">₹{sipInvested.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-brand-border">
                          <span className="text-[10px] uppercase font-bold text-brand-muted">Estimated Returns</span>
                          <p className="text-base font-bold text-brand-success mt-1">₹{sipGain.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 bg-brand-primary rounded-xl text-white">
                          <span className="text-[10px] uppercase font-bold text-brand-sage">Total Future Value</span>
                          <p className="text-base font-bold mt-1">₹{sipFutureValue.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showCompoundingCalc && (
                    <div className="bg-brand-light/35 p-5 rounded-2xl border border-brand-border space-y-5">
                      <h4 className="font-bold text-sm text-brand-primary">Compound Growth Modeling</h4>
                      
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Principal Amount (₹)</label>
                          <input 
                            type="number" value={ciPrincipal} 
                            onChange={(e) => setCiPrincipal(Math.max(100, parseInt(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Interest Rate (%)</label>
                          <input 
                            type="number" value={ciRate} 
                            onChange={(e) => setCiRate(Math.max(0.1, parseFloat(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Duration (Years)</label>
                          <input 
                            type="number" value={ciYears} 
                            onChange={(e) => setCiYears(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Compounding</label>
                          <select 
                            value={ciFreq} 
                            onChange={(e) => setCiFreq(parseInt(e.target.value))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          >
                            <option value={1}>Annually</option>
                            <option value={2}>Half-Yearly</option>
                            <option value={4}>Quarterly</option>
                            <option value={12}>Monthly</option>
                            <option value={365}>Daily</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-brand-border text-center">
                        <div className="p-3 bg-white rounded-xl border border-brand-border">
                          <span className="text-[10px] uppercase font-bold text-brand-muted">Initial Principal</span>
                          <p className="text-base font-bold text-brand-ink mt-1">₹{ciPrincipal.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-brand-border">
                          <span className="text-[10px] uppercase font-bold text-brand-muted">Interest Earned</span>
                          <p className="text-base font-bold text-brand-success mt-1">₹{ciInterest.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 bg-brand-primary rounded-xl text-white">
                          <span className="text-[10px] uppercase font-bold text-brand-sage">Total Accumulated Value</span>
                          <p className="text-base font-bold mt-1">₹{ciAccumulated.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showBudgetCalc && (
                    <div className="bg-brand-light/35 p-5 rounded-2xl border border-brand-border space-y-5">
                      <h4 className="font-bold text-sm text-brand-primary">The 50/30/20 Budget Planner</h4>
                      
                      <div className="max-w-md">
                        <label className="block text-xs font-bold text-brand-muted mb-1">Monthly Net Income (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2 text-sm text-brand-muted font-bold">₹</span>
                          <input 
                            type="number" value={budgetIncome} 
                            onChange={(e) => setBudgetIncome(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl pl-8 pr-3 py-2 text-sm text-brand-ink focus:outline-brand-primary font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 pt-2">
                        <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-brand-muted">Needs (50%)</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-brand-success">₹{needsAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-brand-muted">
                            Rent, basic home groceries, electric/water utilities, medicines, basic internet, minimum debt obligations.
                          </p>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-brand-muted">Wants (30%)</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-brand-secondary">₹{wantsAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-brand-muted">
                            Dining out, café visits, subscriptions (Netflix/Spotify), leisure shopping, gadgets, weekend travels.
                          </p>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-brand-muted">Savings (20%)</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-brand-warning">₹{savingsAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-brand-muted">
                            Emergency funds deposits, mutual funds SIP investments, PPF, Sovereign Gold, additional loan pre-payments.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showInflationCalc && (
                    <div className="bg-brand-light/35 p-5 rounded-2xl border border-brand-border space-y-5">
                      <h4 className="font-bold text-sm text-brand-primary">Inflation Purchasing Power Impact</h4>
                      
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Initial Cash Amount (₹)</label>
                          <input 
                            type="number" value={infPrincipal} 
                            onChange={(e) => setInfPrincipal(Math.max(100, parseInt(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Expected Inflation (%)</label>
                          <input 
                            type="number" value={infRate} 
                            onChange={(e) => setInfRate(Math.max(0.1, parseFloat(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Duration (Years)</label>
                          <input 
                            type="number" value={infYears} 
                            onChange={(e) => setInfYears(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-brand-border text-center">
                        <div className="p-4 bg-white rounded-xl border border-brand-border">
                          <span className="text-[10px] uppercase font-bold text-brand-muted">Future Value (Purchasing Power)</span>
                          <p className="text-base font-bold text-brand-danger mt-1">₹{infEroded.toLocaleString('en-IN')}</p>
                          <span className="text-[9px] text-brand-muted">Your cash buys this much equivalent today</span>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-brand-border">
                          <span className="text-[10px] uppercase font-bold text-brand-muted">Lost Value (Erosion)</span>
                          <p className="text-base font-bold text-brand-danger mt-1">₹{infLoss.toLocaleString('en-IN')}</p>
                          <span className="text-[9px] text-brand-muted">Purchasing power lost to inflation</span>
                        </div>
                        <div className="p-4 bg-brand-primary rounded-xl text-white">
                          <span className="text-[10px] uppercase font-bold text-brand-sage font-semibold">Equivalent Capital Needed</span>
                          <p className="text-base font-bold mt-1">₹{infEquivalent.toLocaleString('en-IN')}</p>
                          <span className="text-[9px] text-brand-sage">To buy what ₹{infPrincipal.toLocaleString('en-IN')} buys today</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {showChartCalc && (
                    <div className="bg-brand-light/35 p-5 rounded-2xl border border-brand-border space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-brand-primary">Technical Chart Mockup Workspace</h4>
                        <div className="flex gap-2">
                          {['uptrend', 'downtrend', 'sideways'].map((t) => (
                            <button
                              key={t}
                              onClick={() => { setChartTrend(t); setSelectedCandle(null); }}
                              className={`px-3 py-1 rounded-xl text-[10px] font-bold capitalize transition-all ${
                                chartTrend === t 
                                  ? 'bg-brand-primary text-white' 
                                  : 'bg-white border border-brand-border text-brand-muted hover:text-brand-primary'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-brand-border rounded-2xl p-4 flex flex-col items-center">
                        <p className="text-[10px] font-bold text-brand-muted mb-2 text-center uppercase">
                          Interact with candles to see OHLC values and Support/Resistance lines
                        </p>
                        
                        <div className="relative w-full h-44 flex items-center justify-around border-b border-brand-border pb-2 pt-4">
                          {chartTrend === 'uptrend' && (
                            <>
                              <div className="absolute w-full border-t border-dashed border-brand-success/40 top-[20%] left-0 pointer-events-none">
                                <span className="absolute right-2 top-0.5 text-[9px] font-bold text-brand-success/60 bg-white px-1">Resistance</span>
                              </div>
                              <div className="absolute w-full border-t border-dashed border-brand-warning/40 bottom-[20%] left-0 pointer-events-none">
                                <span className="absolute right-2 top-0.5 text-[9px] font-bold text-brand-warning/60 bg-white px-1">Support</span>
                              </div>
                            </>
                          )}
                          {chartTrend === 'downtrend' && (
                            <>
                              <div className="absolute w-full border-t border-dashed border-brand-success/40 top-[25%] left-0 pointer-events-none">
                                <span className="absolute right-2 top-0.5 text-[9px] font-bold text-brand-success/60 bg-white px-1">Resistance</span>
                              </div>
                              <div className="absolute w-full border-t border-dashed border-brand-warning/40 bottom-[15%] left-0 pointer-events-none">
                                <span className="absolute right-2 top-0.5 text-[9px] font-bold text-brand-warning/60 bg-white px-1">Support</span>
                              </div>
                            </>
                          )}
                          {chartTrend === 'sideways' && (
                            <>
                              <div className="absolute w-full border-t border-dashed border-brand-success/40 top-[30%] left-0 pointer-events-none">
                                <span className="absolute right-2 top-0.5 text-[9px] font-bold text-brand-success/60 bg-white px-1">Resistance</span>
                              </div>
                              <div className="absolute w-full border-t border-dashed border-brand-warning/40 bottom-[30%] left-0 pointer-events-none">
                                <span className="absolute right-2 top-0.5 text-[9px] font-bold text-brand-warning/60 bg-white px-1">Support</span>
                              </div>
                            </>
                          )}

                          {candles.map((candle, idx) => {
                            const isGreen = candle.close >= candle.open;
                            const top = ((maxPrice - Math.max(candle.open, candle.close)) / (maxPrice - minPrice)) * 100;
                            const bottom = ((maxPrice - Math.min(candle.open, candle.close)) / (maxPrice - minPrice)) * 100;
                            const bodyHeight = Math.max(4, bottom - top);
                            const wickTop = ((maxPrice - candle.high) / (maxPrice - minPrice)) * 100;
                            const wickBottom = ((maxPrice - candle.low) / (maxPrice - minPrice)) * 100;
                            
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedCandle({ ...candle, index: idx })}
                                className="relative flex flex-col items-center w-8 group h-full focus:outline-none"
                              >
                                <div 
                                  className="absolute w-0.5 bg-brand-muted/70 z-0"
                                  style={{
                                    top: `${wickTop}%`,
                                    height: `${wickBottom - wickTop}%`
                                  }}
                                ></div>
                                <div
                                  className={`absolute w-4 rounded-xs cursor-pointer z-10 transition-all group-hover:ring-2 ring-brand-primary ${
                                    isGreen ? 'bg-brand-success' : 'bg-brand-danger'
                                  }`}
                                  style={{
                                    top: `${top}%`,
                                    height: `${bodyHeight}%`
                                  }}
                                ></div>
                                <span className="absolute bottom-0 text-[8px] font-semibold text-brand-muted">{candle.date}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="w-full mt-4 p-3 bg-brand-light/35 rounded-xl text-center text-xs text-brand-ink">
                          {selectedCandle ? (
                            <div className="grid grid-cols-4 gap-2">
                              <div><span className="text-[9px] block uppercase font-bold text-brand-muted">Open</span><strong>₹{selectedCandle.open}</strong></div>
                              <div><span className="text-[9px] block uppercase font-bold text-brand-muted">High</span><strong>₹{selectedCandle.high}</strong></div>
                              <div><span className="text-[9px] block uppercase font-bold text-brand-muted">Low</span><strong>₹{selectedCandle.low}</strong></div>
                              <div><span className="text-[9px] block uppercase font-bold text-brand-muted">Close</span><strong className={selectedCandle.close >= selectedCandle.open ? 'text-brand-success' : 'text-brand-danger'}>₹{selectedCandle.close}</strong></div>
                            </div>
                          ) : (
                            <span className="text-brand-muted font-medium">Click on any candle in the chart to display OHLC pricing values.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!showSipCalc && !showCompoundingCalc && !showBudgetCalc && !showInflationCalc && !showChartCalc && (
                    <div className="bg-brand-light/35 p-5 rounded-2xl border border-brand-border space-y-5">
                      <h4 className="font-bold text-sm text-brand-primary">Compound Growth Modeling</h4>
                      
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Principal Amount (₹)</label>
                          <input 
                            type="number" value={ciPrincipal} 
                            onChange={(e) => setCiPrincipal(Math.max(100, parseInt(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Interest Rate (%)</label>
                          <input 
                            type="number" value={ciRate} 
                            onChange={(e) => setCiRate(Math.max(0.1, parseFloat(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Duration (Years)</label>
                          <input 
                            type="number" value={ciYears} 
                            onChange={(e) => setCiYears(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-brand-muted mb-1">Compounding</label>
                          <select 
                            value={ciFreq} 
                            onChange={(e) => setCiFreq(parseInt(e.target.value))}
                            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-brand-primary"
                          >
                            <option value={1}>Annually</option>
                            <option value={2}>Half-Yearly</option>
                            <option value={4}>Quarterly</option>
                            <option value={12}>Monthly</option>
                            <option value={365}>Daily</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-brand-border text-center">
                        <div className="p-3 bg-white rounded-xl border border-brand-border">
                          <span className="text-[10px] uppercase font-bold text-brand-muted">Initial Principal</span>
                          <p className="text-base font-bold text-brand-ink mt-1">₹{ciPrincipal.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-brand-border">
                          <span className="text-[10px] uppercase font-bold text-brand-muted">Interest Earned</span>
                          <p className="text-base font-bold text-brand-success mt-1">₹{ciInterest.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 bg-brand-primary rounded-xl text-white">
                          <span className="text-[10px] uppercase font-bold text-brand-sage">Total Accumulated Value</span>
                          <p className="text-base font-bold mt-1">₹{ciAccumulated.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'glossary' && (
                <motion.div
                  key="glossary"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-brand-ink">Academic Reference Glossary</h3>
                      <p className="text-xs text-brand-muted">Quick access dictionary for financial vocabulary and regulatory concepts.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-brand-muted">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search financial terms..."
                      value={glossarySearch}
                      onChange={(e) => setGlossarySearch(e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs md:text-sm text-brand-ink focus:outline-brand-primary"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredGlossary.map((term) => (
                      <div key={term.name} className="p-4 bg-brand-light/35 border border-brand-border rounded-2xl space-y-1">
                        <h4 className="font-bold text-xs md:text-sm text-brand-primary">{term.name}</h4>
                        <p className="text-xs text-brand-muted leading-relaxed">{term.definition}</p>
                      </div>
                    ))}
                    {filteredGlossary.length === 0 && (
                      <p className="text-center text-xs text-brand-muted col-span-2 py-4 font-semibold">
                        No dictionary definitions match your search query.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-brand-ink">My Classroom Notebook</h3>
                      <p className="text-xs text-brand-muted">Type key takeaways, formulas, or reminders below. They save dynamically in this browser.</p>
                    </div>
                    
                    <AnimatePresence>
                      {notesSaved && (
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-[9px] uppercase font-bold text-brand-success flex items-center bg-emerald-50 px-2 py-0.5 rounded border border-brand-border"
                        >
                          <Check className="w-3 h-3 mr-0.5 text-brand-success" /> Auto-Saved
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <textarea
                    rows={12}
                    value={notes}
                    onChange={handleNotesChange}
                    placeholder="Write your personal notes for this lesson here... (e.g. Formula for compound interest, target FD interest rate, rules of asset correlations)"
                    className="w-full bg-white border border-brand-border rounded-2xl p-4 text-xs md:text-sm text-brand-ink focus:outline-brand-primary shadow-inner font-sans leading-relaxed focus:ring-1 focus:ring-brand-primary"
                  ></textarea>

                  <div className="text-[10px] text-brand-muted text-right">
                    Notes are stored locally in your browser storage and remain visible only to you.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-warning flex items-center bg-amber-50 px-2.5 py-1.5 rounded-xl border border-brand-border">
              <Zap className="w-3.5 h-3.5 mr-1 fill-brand-warning text-brand-warning" />
              +{lesson.xpReward} Lesson XP
            </span>

            {quiz ? (
              <button
                onClick={() => setQuizOpen(true)}
                className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-card hover:opacity-95 transition-all text-xs md:text-sm cursor-pointer border-0"
              >
                Launch Assessment Quiz
              </button>
            ) : (
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-brand-light text-brand-primary hover:bg-brand-light/80 border border-brand-border rounded-xl text-xs md:text-sm font-semibold transition-all"
              >
                Complete Lesson
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {quizOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-ink/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-xl w-full bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-card relative overflow-hidden text-brand-ink"
            >
              <div className="absolute top-0 left-0 w-full h-[4px] bg-brand-primary"></div>

              {!quizResult ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-1.5 text-brand-primary text-[10px] font-bold uppercase tracking-widest bg-brand-light px-2.5 py-1 rounded-xl border border-brand-border">
                      <HelpCircle className="w-4 h-4" />
                      <span>Question {currentQuestionIdx + 1} of {quiz.questions.length}</span>
                    </div>
                    <button
                      onClick={() => setQuizOpen(false)}
                      className="text-xs text-brand-muted hover:text-brand-ink font-bold border-0 bg-transparent cursor-pointer"
                    >
                      Close Quiz
                    </button>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm md:text-base font-bold text-brand-ink leading-relaxed">
                      {quiz.questions[currentQuestionIdx].question}
                    </h3>

                    <div className="space-y-3">
                      {quiz.questions[currentQuestionIdx].options.map((option) => {
                        const isSelected = selectedAnswers[currentQuestionIdx] === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleSelectOption(currentQuestionIdx, option)}
                            className={`w-full text-left p-4 rounded-2xl border text-xs md:text-sm font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-brand-light border-brand-primary text-brand-primary font-bold'
                                : 'bg-white hover:bg-brand-bg/40 border-brand-border text-brand-muted'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-brand-border">
                    <button
                      type="button"
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-light text-brand-primary hover:bg-brand-light/80 border border-brand-border disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      Previous
                    </button>

                    {currentQuestionIdx < quiz.questions.length - 1 ? (
                      <button
                        type="button"
                        disabled={!selectedAnswers[currentQuestionIdx]}
                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                        className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center cursor-pointer border-0"
                      >
                        Next Question
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs hover:opacity-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer border-0 shadow-card"
                      >
                        Submit Assessment
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-brand-light border border-brand-border flex items-center justify-center mx-auto">
                      {quizResult.passed ? (
                        <CheckCircle className="w-8 h-8 text-brand-success" />
                      ) : (
                        <XCircle className="w-8 h-8 text-brand-danger" />
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold font-serif text-brand-ink">
                      {quizResult.passed ? 'Assessment Passed!' : 'Assessment Failed'}
                    </h2>
                    <p className="text-brand-muted text-xs">
                      You scored <strong className="text-brand-primary">{quizResult.score}%</strong> (Passing requirement: {quiz.passingScore}%)
                    </p>
                  </div>

                  {(quizResult.badgeUnlocked || quizResult.leveledUp) && (
                    <div className="p-4 bg-brand-light border border-brand-border rounded-2xl text-center space-y-3 shadow-card">
                      {quizResult.badgeUnlocked && (
                        <div className="space-y-1">
                          <Award className="w-8 h-8 text-brand-warning mx-auto fill-brand-warning" />
                          <h4 className="text-xs font-extrabold text-brand-ink">BADGE UNLOCKED: {quizResult.badgeUnlocked.title}</h4>
                          <p className="text-[10px] text-brand-muted">{quizResult.badgeUnlocked.description}</p>
                        </div>
                      )}
                      
                      {quizResult.leveledUp && (
                        <div className="text-xs text-brand-primary font-bold">
                          🎉 Level Up! You reached Level {quizResult.newLevel}! 🎉
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 pt-4 border-t border-brand-border text-left">
                    <h4 className="text-xs font-bold text-brand-ink uppercase tracking-wider">Evaluation & Answer Keys</h4>
                    {quizResult.evaluation.map((evalItem, idx) => (
                      <div key={idx} className="p-4 bg-brand-light/35 border border-brand-border rounded-xl space-y-2">
                        <div className="flex items-start justify-between gap-3 text-xs font-bold">
                          <span className="text-brand-ink">Q{idx + 1}: {evalItem.question}</span>
                          {evalItem.isCorrect ? (
                            <span className="text-brand-success text-[10px] font-bold flex-shrink-0 flex items-center bg-emerald-50 px-2 py-0.5 rounded border border-brand-border">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Correct
                            </span>
                          ) : (
                            <span className="text-brand-danger text-[10px] font-bold flex-shrink-0 flex items-center bg-red-50 px-2 py-0.5 rounded border border-brand-border">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Incorrect
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-[11px] leading-relaxed">
                          <p className="text-brand-muted">
                            Your answer: <span className={evalItem.isCorrect ? 'text-brand-success font-bold' : 'text-brand-danger font-bold'}>{evalItem.selectedOption || 'Not answered'}</span>
                          </p>
                          {!evalItem.isCorrect && (
                            <p className="text-brand-ink font-semibold">
                              Correct answer: <span className="text-brand-success font-bold">{evalItem.correctAnswer}</span>
                            </p>
                          )}
                          <p className="text-brand-muted leading-normal pt-1.5 border-t border-brand-border text-[10px]">
                            <strong>Explanation:</strong> {evalItem.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-brand-border justify-end">
                    {quizResult.passed ? (
                      <button
                        onClick={() => {
                          setQuizOpen(false);
                          navigate('/learn');
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs cursor-pointer shadow-card hover:opacity-90 transition-all text-center border-0"
                      >
                        Return to Curriculum
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setQuizResult(null);
                            setSelectedAnswers({});
                            setCurrentQuestionIdx(0);
                          }}
                          className="w-full sm:w-auto px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs cursor-pointer shadow-card hover:opacity-90 transition-all text-center border-0"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => setQuizOpen(false)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-brand-light hover:bg-brand-light/80 text-brand-primary border border-brand-border rounded-xl text-xs font-semibold text-center cursor-pointer"
                        >
                          Close Quiz
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonViewer;
