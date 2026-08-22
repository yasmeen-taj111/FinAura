import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarDays } from 'lucide-react';

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/learn': 'Learning Hub',
  '/sandbox': 'Investment Sandbox',
  '/plan': 'Financial Plan',
  '/goals': 'My Goals',
  '/assessment': 'Assessment',
  '/profile': 'My Profile',
  '/assistant': 'AI Assistant',
};

const AppHeader = () => {
  const { user } = useAuth();
  const location = useLocation();

  const pageLabel =
    Object.entries(routeLabels).find(([path]) =>
      location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))
    )?.[1] ?? 'FinAura';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 hidden lg:flex items-center justify-between border-b border-brand-border bg-white/90 backdrop-blur-md px-6 py-3 gap-4">
      {/* Left: Page label */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">FinAura</span>
        <span className="text-brand-muted/40 text-xs">/</span>
        <span className="text-sm font-semibold text-brand-ink">{pageLabel}</span>
      </div>

      {/* Right: Date + user avatar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-brand-muted">
          <CalendarDays size={13} strokeWidth={1.8} />
          <span>{today}</span>
        </div>

        <div className="flex items-center gap-2 bg-brand-light rounded-xl px-3 py-1.5">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-primary text-[11px] font-bold text-white select-none">
            {initials}
          </div>
          <span className="text-sm font-semibold text-brand-ink">
            {user?.name?.split(' ')[0] ?? 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
