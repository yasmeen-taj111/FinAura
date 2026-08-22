import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Bot, Compass, LayoutDashboard, LogOut, Menu, Shield, Target, X, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Learn', path: '/learn', icon: BookOpen },
  { label: 'Plan', path: '/plan', icon: Target },
  { label: 'Explore', path: '/sandbox', icon: Compass },
  { label: 'My Profile', path: '/profile', icon: User },
  { label: 'AI Assistant', path: '/profile#chat', icon: Bot },
];

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = (
    <>
      <Link to="/dashboard" className="mb-9 flex items-center gap-2 px-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-primary text-white"><Shield size={19} /></span>
        <span className="text-xl font-bold tracking-tight text-brand-ink">Fin<span className="text-brand-primary">Aura</span></span>
      </Link>
      <nav className="space-y-1" aria-label="Primary navigation">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = !path.includes('#') && (location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path)));
          return <Link key={label} to={path} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'bg-brand-light text-brand-primary' : 'text-brand-muted hover:bg-brand-light hover:text-brand-primary'}`}><Icon size={18} strokeWidth={1.8} />{label}</Link>;
        })}
      </nav>
      <div className="mt-8 border-t border-brand-border pt-6"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Your journey</p><p className="px-3 pt-2 text-xs leading-5 text-brand-muted">Assess, learn, plan, then explore—at your own pace.</p></div>
      <button onClick={handleLogout} className="mt-auto flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-brand-muted transition-colors hover:bg-red-50 hover:text-brand-danger"><LogOut size={18} /> Sign out</button>
    </>
  );

  return <div className="min-h-screen bg-brand-bg">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-brand-border bg-white p-5 lg:flex">{navigation}</aside>
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand-border bg-white/95 px-5 py-3 backdrop-blur lg:hidden"><Link to="/dashboard" className="flex items-center gap-2 font-bold text-brand-ink"><Shield size={20} className="text-brand-primary" /> FinAura</Link><button onClick={() => setMobileOpen(true)} className="rounded-lg border border-brand-border p-2 text-brand-primary" aria-label="Open navigation"><Menu size={20} /></button></header>
    <AnimatePresence>{mobileOpen && <><motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-brand-ink/20 lg:hidden" aria-label="Close navigation" /><motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-white p-5 shadow-xl lg:hidden"><button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 rounded-lg p-2 text-brand-muted"><X size={20} /></button>{navigation}</motion.aside></>}</AnimatePresence>
    <main className="lg:pl-64"><div className={location.pathname === '/dashboard' || location.pathname === '/plan' ? '' : 'legacy-page'}>{children}</div></main>
  </div>;
};

export default Layout;
