import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AppFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-border bg-white/60 px-6 py-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-brand-muted">
        {/* Left: Brand */}
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-brand-primary" />
          <span className="font-semibold text-brand-ink">FinAura</span>
          <span>· © {year} All rights reserved.</span>
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-4">
          <Link
            to="/assessment"
            className="hover:text-brand-primary transition-colors"
          >
            Assessment
          </Link>
          <span className="text-brand-border">·</span>
          <Link
            to="/mentors"
            className="hover:text-brand-primary transition-colors"
          >
            Mentors
          </Link>
          <span className="text-brand-border">·</span>
          <Link
            to="/assistant"
            className="hover:text-brand-primary transition-colors"
          >
            AI Help
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
