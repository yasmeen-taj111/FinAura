import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, ArrowLeft, Loader2, Landmark, Wallet, Percent, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Assessment = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Assessment answers state
  const [financials, setFinancials] = useState({
    income: '',
    expenses: '',
    savings: '',
  });
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { Q1: optionIndex }
  const [currentStep, setCurrentStep] = useState(0); // Step 0 = financials, Step 1+ = questions

  const { income, expenses, savings } = financials;

  // Fetch questions from the backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get('/profile/questions');
        setQuestions(response.data);
      } catch (err) {
        console.error('Failed to load questions', err);
        setError('Failed to fetch assessment questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleFinancialsChange = (e) => {
    setFinancials({
      ...financials,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleOptionSelect = (qId, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: optionIndex,
    });
    if (error) setError('');
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (!income || isNaN(income) || Number(income) < 0) {
        setError('Please enter a valid monthly income.');
        return;
      }
      if (!expenses || isNaN(expenses) || Number(expenses) < 0) {
        setError('Please enter valid monthly expenses.');
        return;
      }
      if (!savings || isNaN(savings) || Number(savings) < 0) {
        setError('Please enter valid monthly savings.');
        return;
      }
    } else {
      const activeQuestion = questions[currentStep - 1];
      if (selectedAnswers[activeQuestion.id] === undefined) {
        setError('Please select an option to continue.');
        return;
      }
    }
    setError('');
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    // Format answers array: [ { questionId, selectedOption } ]
    const answersPayload = Object.keys(selectedAnswers).map((qId) => ({
      questionId: qId,
      selectedOption: selectedAnswers[qId],
    }));

    try {
      await api.post('/profile/assessment', {
        monthlyIncome: Number(income),
        monthlyExpenses: Number(expenses),
        monthlySavings: Number(savings),
        answers: answersPayload,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-secondary animate-spin" />
        <p className="mt-4 text-brand-muted text-sm font-medium tracking-wide">
          Loading FinAura Assessment questionnaire...
        </p>
      </div>
    );
  }

  // Calculate progress percentage
  const totalSteps = questions.length + 1; // financial info + questions
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="min-h-screen flex flex-col justify-between py-12 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-primary/10 rounded-full filter blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-secondary/10 rounded-full filter blur-[100px] pointer-events-none animate-pulse-slow"></div>

      {/* Header */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between mb-6 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-sm" style={{ color: '#ffffff' }}>
            <Shield className="w-4.5 h-4.5" color="#ffffff" />
          </div>
          <span className="text-lg font-bold text-brand-ink">FinAura</span>
        </div>
        <div className="text-xs text-brand-muted font-bold tracking-wide uppercase">
          Step {currentStep} of {totalSteps - 1}
        </div>
      </header>

      {/* Central Content */}
      <main className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center z-10 relative">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
          ></motion.div>
        </div>

        {error && (
          <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-sm rounded-xl p-3.5 mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 0: Monthly Financial Input */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-3xl p-8 border border-white/10 shadow-glass"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Basic Financial Metrics</h2>
              <p className="text-brand-muted text-sm mb-6 leading-relaxed">
                Provide estimates of your current monthly cash flow. This information helps us gauge your savings rate and budget structure.
              </p>

              <div className="space-y-5">
                {/* Monthly Income */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                    Monthly Income (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <input
                      type="number"
                      name="income"
                      value={income}
                      onChange={handleFinancialsChange}
                      placeholder="e.g. 50000"
                      className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-white/10 rounded-xl text-slate-100 placeholder-brand-muted/50 focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Monthly Expenses */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                    Monthly Expenses (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <input
                      type="number"
                      name="expenses"
                      value={expenses}
                      onChange={handleFinancialsChange}
                      placeholder="e.g. 30000"
                      className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-white/10 rounded-xl text-slate-100 placeholder-brand-muted/50 focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Monthly Savings */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                    Monthly Savings (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                      <Percent className="w-5 h-5" />
                    </div>
                    <input
                      type="number"
                      name="savings"
                      value={savings}
                      onChange={handleFinancialsChange}
                      placeholder="e.g. 20000"
                      className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-white/10 rounded-xl text-slate-100 placeholder-brand-muted/50 focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dynamic Questionnaire Steps */}
          {currentStep > 0 && currentStep <= questions.length && (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-3xl p-8 border border-white/10 shadow-glass"
            >
              {/* Category Indicator */}
              <div className="mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-brand-primary/10 border border-brand-primary/20 text-indigo-300">
                  {questions[currentStep - 1].category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-xl font-bold text-white mb-6 leading-snug">
                {questions[currentStep - 1].text}
              </h3>

              {/* Option List */}
              <div className="space-y-4">
                {questions[currentStep - 1].options.map((option, index) => {
                  const qId = questions[currentStep - 1].id;
                  const isSelected = selectedAnswers[qId] === index;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleOptionSelect(qId, index)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-primary/15 border-brand-secondary text-white shadow-glow-secondary'
                          : 'bg-brand-bg/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-brand-secondary shadow-glow-secondary"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Final Submission Card */}
          {currentStep > questions.length && (
            <motion.div
              key="step-final"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card rounded-3xl p-8 border border-white/10 shadow-glass text-center"
            >
              <div className="w-16 h-16 rounded-full bg-brand-secondary/15 flex items-center justify-center text-brand-secondary mx-auto mb-6 shadow-glow-secondary animate-pulse">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">All Done!</h2>
              <p className="text-brand-muted text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                Your questionnaire outputs are ready for analysis. We’ll calculate your financial confidence and an educational investment risk profile from your tolerance, capacity, and goals.
              </p>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center shadow-glow-primary cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Analyzing responses...
                    </>
                  ) : (
                    'Calculate My Profile'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Nav Controls */}
      <footer className="max-w-xl w-full mx-auto flex items-center justify-between mt-8 z-10">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 0 || submitting}
          className={`flex items-center text-sm font-semibold transition-all px-4 py-2 rounded-xl bg-white/5 border border-white/10 ${
            currentStep === 0 || submitting
              ? 'opacity-30 cursor-not-allowed text-brand-muted'
              : 'hover:bg-white/10 text-white cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {currentStep <= questions.length && (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center text-sm font-semibold transition-all px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-glow-primary hover:opacity-95 cursor-pointer"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}
      </footer>
    </div>
  );
};

export default Assessment;
