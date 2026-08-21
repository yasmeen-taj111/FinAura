import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Calendar, Shield, Award, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'from-red-500 to-rose-600 shadow-red-500/20';
      case 'MENTOR':
        return 'from-amber-400 to-orange-500 shadow-amber-400/20';
      default:
        return 'from-brand-secondary to-blue-500 shadow-brand-secondary/20';
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="glass-card border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-glow-primary">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Fin<span className="text-brand-secondary">Aura</span>
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-brand-danger/10 hover:text-brand-danger border border-white/10 hover:border-brand-danger/20 transition-all text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white font-sans">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-indigo-400">{user?.name}</span>!
          </h1>
          <p className="text-brand-muted mt-2 text-sm md:text-base">
            Your financial learning path is successfully configured. Ready to build your financial confidence score?
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-brand-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Your Profile</h3>
                <p className="text-brand-muted text-xs">Security Verified</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-brand-muted" />
                <span className="text-slate-300 font-medium truncate">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="w-4 h-4 text-brand-muted" />
                <span className="text-slate-300 font-medium">
                  Age: {user?.age} (DOB: {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : ''})
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="w-4 h-4 text-brand-muted" />
                <span className="flex items-center space-x-2">
                  <span className="text-slate-300 font-medium">Role:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white bg-gradient-to-r ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Integration Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 border border-white/5"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-brand-success">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Security Status</h3>
                <p className="text-brand-muted text-xs">MERN Auth Stack</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
                <span className="text-brand-muted">JWT Authentication</span>
                <span className="text-brand-success font-semibold">Active & Encrypted</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
                <span className="text-brand-muted">Password Encryption</span>
                <span className="text-brand-success font-semibold">bcrypt (10 rounds)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-muted">Stateless Session Control</span>
                <span className="text-brand-success font-semibold">Local Storage</span>
              </div>
            </div>
          </motion.div>

          {/* Gamified Next Steps Placeholder Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-2xl p-6 border border-white/5"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-brand-secondary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Next Steps</h3>
                <p className="text-brand-muted text-xs">Your FinAura Journey</p>
              </div>
            </div>

            <p className="text-brand-muted text-sm leading-relaxed mb-4">
              Secure authentication is fully verified. In the next phase, we will implement the **Financial Assessment** and compute your personalized **Financial Confidence Score**.
            </p>

            <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20 text-xs text-indigo-200 font-semibold text-center select-none">
              🚀 Ready for Phase 2 implementation
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-brand-muted border-t border-white/5">
        <p>© {new Date().getFullYear()} FinAura. Educational investment simulator. No real money involved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
