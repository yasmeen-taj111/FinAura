import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Calendar, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { name, email, password, dateOfBirth } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formError) setFormError('');
  };

  const getNameErrorMessage = () => {
    if (!name) return '';
    const trimmed = name.trim();
    if (trimmed.length < 2) return 'Name must be at least 2 characters';
    if (trimmed.length > 50) return 'Name cannot exceed 50 characters';
    if (!/^[a-zA-Z\s'\-\.]+$/.test(trimmed)) return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
    return '';
  };

  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[@$!%*?&#]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordRequirements).every(Boolean);

  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !dateOfBirth) {
      setFormError('Please fill in all fields');
      return;
    }

    // Verify name constraints
    const nameErrorMsg = getNameErrorMessage();
    if (nameErrorMsg) {
      setFormError(nameErrorMsg);
      return;
    }

    // Verify password strength
    if (!isPasswordStrong) {
      setFormError('Please make sure your password meets all strength requirements.');
      return;
    }

    // Verify age client side
    const age = calculateAge(dateOfBirth);
    if (age < 13) {
      setFormError('You must be at least 13 years old to join FinAura');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await register(name, email, password, dateOfBirth);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-primary/10 rounded-full filter blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-secondary/10 rounded-full filter blur-[100px] animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo Container */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-glow-primary mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-brand-ink">
            Fin<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-indigo-400">Aura</span>
          </h1>
          <p className="text-brand-muted text-sm mt-1.5 font-medium">
            Learn • Explore • Simulate • Gain Confidence
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-card rounded-3xl p-8 shadow-glass border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary"></div>
          
          <h2 className="text-xl font-bold text-brand-ink mb-6">Create Account</h2>

          {formError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-sm rounded-xl p-3 mb-6"
            >
              {formError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full pl-11 pr-4 py-3 bg-brand-bg/50 border rounded-xl text-slate-900 placeholder-brand-muted/60 focus:outline-none focus:ring-1 transition-all ${
                    getNameErrorMessage()
                      ? 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger'
                      : 'border-brand-border focus:border-brand-secondary focus:ring-brand-secondary'
                  }`}
                  required
                />
              </div>
              {getNameErrorMessage() && (
                <p className="text-[11px] text-brand-danger font-medium mt-1">
                  {getNameErrorMessage()}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-border rounded-xl text-slate-900 placeholder-brand-muted/60 focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all"
                  required
                />
              </div>
            </div>

            {/* Date of Birth Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-brand-border rounded-xl text-slate-900 placeholder-brand-muted/60 focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-brand-muted leading-relaxed">
                * Note: Users must be 13+ years old. We strictly prohibit any real-money transaction.
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-brand-bg/50 border border-brand-border rounded-xl text-slate-900 placeholder-brand-muted/60 focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-muted hover:text-brand-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2.5 p-3.5 bg-brand-light/30 border border-brand-border/50 rounded-xl space-y-1.5 text-xs text-brand-muted font-medium transition-all duration-300">
                  <p className="font-semibold text-brand-ink mb-1 uppercase tracking-wider text-[10px]">
                    Password Requirements:
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.length ? 'bg-brand-success' : 'bg-brand-muted/40'}`} />
                    <span className={passwordRequirements.length ? 'text-brand-success' : ''}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.uppercase ? 'bg-brand-success' : 'bg-brand-muted/40'}`} />
                    <span className={passwordRequirements.uppercase ? 'text-brand-success' : ''}>At least one uppercase letter (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.lowercase ? 'bg-brand-success' : 'bg-brand-muted/40'}`} />
                    <span className={passwordRequirements.lowercase ? 'text-brand-success' : ''}>At least one lowercase letter (a-z)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.number ? 'bg-brand-success' : 'bg-brand-muted/40'}`} />
                    <span className={passwordRequirements.number ? 'text-brand-success' : ''}>At least one number (0-9)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.specialChar ? 'bg-brand-success' : 'bg-brand-muted/40'}`} />
                    <span className={passwordRequirements.specialChar ? 'text-brand-success' : ''}>At least one special character (@$!%*?&#)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center shadow-glow-primary group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Redirect to Login */}
          <div className="mt-8 text-center text-sm">
            <span className="text-brand-muted">Already have an account? </span>
            <Link
              to="/login"
              className="text-brand-secondary hover:text-indigo-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
