import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun } from 'lucide-react';

export default function Topbar({ rightElement }) {
  const location = useLocation();
  const path = location.pathname;

  // Helper function to handle the active link styling
  const getLinkStyle = (targetPath) => {
    const isActive = path === targetPath;
    
    return isActive 
      ? "text-zinc-100 border-b-2 border-amber-400 pb-1" 
      : "hover:text-zinc-300 transition-colors pb-1";
  };

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur-sm pt-6 pb-4 -mt-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 w-full border-b border-zinc-800/80">
      
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <Sun className="text-amber-400 w-5 h-5" />
        <Link to="/" className="text-lg font-semibold tracking-widest text-zinc-100 hover:text-white transition-colors">
          SOLARSENSE
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs font-medium tracking-widest text-zinc-500">
        <Link to="/" className={getLinkStyle('/')}>DASHBOARD</Link>
        <Link to="/analytics" className={getLinkStyle('/analytics')}>ANALYTICS</Link>
        <Link to="/ai-detect" className={getLinkStyle('/ai-detect')}>AI DETECT</Link>
        <Link to="/fault-log" className={getLinkStyle('/fault-log')}>FAULT LOG</Link>
      </nav>

      {/* Dynamic Right Side Container */}
      <div className="flex items-center justify-end gap-4 min-w-[200px]">
        {rightElement}
      </div>

    </header>
  );
}