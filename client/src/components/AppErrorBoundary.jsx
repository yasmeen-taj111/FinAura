import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Unhandled application error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="grid min-h-screen place-items-center bg-brand-bg px-5"><section className="surface-card max-w-md p-7 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-brand-danger"><AlertTriangle size={23} /></span><h1 className="mt-5 text-xl font-bold text-brand-ink">This page needs a fresh start</h1><p className="mt-2 text-sm leading-6 text-brand-muted">Your information is safe. Refresh the page to try again.</p><button type="button" onClick={() => window.location.reload()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white"><RefreshCw size={16} /> Refresh page</button></section></main>;
  }
}

export default AppErrorBoundary;
