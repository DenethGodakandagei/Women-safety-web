import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  const navLinks = [
    { name: 'Technology', id: 'technology' },
    { name: 'The Network', id: 'network' },
    { name: 'Intelligence', id: 'intelligence' },
    { name: 'Trust Center', id: 'trust' }
  ];

  return (
    <nav className="glass fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[94%] lg:w-[96%] max-w-[1200px] rounded-[24px] py-1.5 px-3 lg:py-3 lg:px-8 transition-all duration-300">
      <div className="flex justify-between items-center max-w-[1280px] mx-auto">
        <Link to="/" className="flex items-center gap-4 group px-3 lg:px-0">
          <div className="text-xl font-medium tracking-[-0.05em] group-hover:opacity-70 transition-opacity font-display">SheShield</div>
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-0.5  border border-emerald-100/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active Sentinel</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((item) => (
            <a
              key={item.name}
              href={`#${item.id}`}
              className="text-[13px] font-medium text-text-secondary hover:text-accent transition-colors tracking-tight"
            >
              {item.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn-premium-active !py-2 !px-5 !text-[13px] !rounded-xl">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-[13px] font-bold text-text-secondary hover:text-text transition-colors">Sign In</Link>
                <Link to="/register" className="btn-premium-active !py-2 !px-5 !text-[13px] !rounded-xl">Get Started</Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 rounded-2xl glass border-white/40"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="md:hidden overflow-hidden bg-white/40 rounded-2xl border-t border-black/[0.03]"
          >
            <div className="p-6 flex flex-col gap-6">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex justify-between items-center p-4 hover:bg-white/40 rounded-xl transition-colors text-base font-medium text-text-secondary"
                >
                  {item.name}
                  <ChevronRight size={16} />
                </a>
              ))}
              <div className="h-px w-full bg-black/[0.05] my-2"></div>
              <div className="flex flex-col gap-4">
                {isLoggedIn ? (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="mx-auto w-full text-center py-4 bg-accent text-white rounded-xl text-sm font-bold shadow-xl shadow-accent/20">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-4 text-sm font-bold text-text-secondary">Sign In</Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="mx-auto w-full text-center py-4 bg-accent text-white rounded-xl text-sm font-bold shadow-xl shadow-accent/20">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
