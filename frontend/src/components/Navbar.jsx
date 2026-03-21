import React from 'react';

import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="glass sticky top-0 z-[100] py-6 border-b border-black/5 bg-white/80">
      <div className="container flex justify-between items-center px-8 lg:px-16 max-w-[1280px]">
        <Link to="/" className="flex items-center gap-6 group">
          <div className="text-3xl font-bold tracking-tighter group-hover:opacity-70 transition-opacity">Guardian</div>
          {/* Subtle Live Indicator next to Logo */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live protection</span>
          </div>
        </Link>
        
        <div className="hidden lg:flex gap-10 items-center text-[15px] font-medium text-text-secondary">
          <Link to="/" className="hover:text-text transition-colors">Technology</Link>
          <Link to="/" className="hover:text-text transition-colors">The Network</Link>
          <Link to="/" className="hover:text-text transition-colors">Premium</Link>
        </div>
        
        <div className="flex items-center gap-8">
            <Link to="/login" className="text-[14px] font-bold text-text-secondary hover:text-text transition-colors">Sign In</Link>
            <Link to="/register" className="btn btn-primary px-7 py-3 text-[15px]">Get Protected</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
