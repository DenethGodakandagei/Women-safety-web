import React from 'react';
import { motion } from 'framer-motion';
import { Play, Shield, CheckCircle2, Navigation, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <header className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-paper">
      {/* Background Mesh Gradient - Warmer for Golden Hour */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="container relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center pt-40 lg:pt-32 pb-20 lg:pb-24 px-6 lg:px-16 max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            <span className="text-[11px] font-bold text-accent uppercase tracking-[3px]">Next-Gen Personal Defense</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] leading-[0.95] mb-12 tracking-[-0.06em] font-medium text-text font-display">
            Confidence <br />
            <span className="text-text-secondary/30">is a right,</span> <br />
            not a luxury.
          </h1>

          <p className="text-xl md:text-[24px] text-text-secondary max-w-[540px] mb-16 font-light leading-relaxed tracking-tight">
            SheShield provides the invisible layer of protection every woman deserves. Military-grade intelligence for the modern world.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 items-center">
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn-premium-active !px-12 !py-5 !text-[17px] !rounded-[20px] !font-bold">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn-premium-active !px-12 !py-5 !text-[17px] !rounded-[20px] !font-bold">
                Get SheShield Now
              </Link>
            )}
            <button className="flex items-center gap-3 group hover:opacity-70 transition-opacity text-[17px] font-bold text-text-secondary">
              View Technology <div className="p-2.5 rounded-full border border-black/10 group-hover:bg-black/5 transition-colors"><Navigation size={20} className="rotate-45" /></div>
            </button>
          </div>

          <div className="mt-24 grid grid-cols-3 gap-12 border-t border-black/[0.03] pt-12 max-w-[500px]">
            {[
              { label: 'Active Users', val: '2.4M' },
              { label: 'Trust Score', val: '99.9%' },
              { label: 'Latency', val: '12ms' }
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[2px] opacity-40 mb-2">{stat.label}</p>
                <p className="text-2xl font-medium tracking-tighter text-text">{stat.val}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-[60px] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.15)] border border-white/60 aspect-[4/5]">
            <img
              src="/sheshield_hero_v2.jpg"
              alt="SheShield Modern Concept"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>

          {/* Overlaid Modern Widgets - Desktop Only */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="hidden lg:flex absolute top-20 -right-8 lg:-right-16 glass py-5 px-6 rounded-[32px] flex-col gap-4 shadow-2xl border-white/50 min-w-[200px]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Global Status</p>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Shield size={24} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[16px] font-bold text-text tracking-tight">System Secured</p>
                <p className="text-[12px] text-text-secondary">Ready for Departure</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="hidden lg:flex absolute bottom-20 -left-8 lg:-left-16 glass py-5 px-6 rounded-[32px] flex-col gap-4 shadow-2xl border-white/50 min-w-[260px]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Live Danger Index</p>
              <AlertTriangle size={14} className="text-accent animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[28px] font-medium tracking-tighter text-text">0.02</p>
                <p className="text-[12px] text-emerald-500 font-bold uppercase pb-1">Ultra Low</p>
              </div>
              <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "12%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="h-full bg-emerald-500"
                />
              </div>
              <p className="text-[11px] text-text-secondary/60">Based on real-time neural mesh analysis.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 w-full flex justify-center gap-16 px-8 pointer-events-none opacity-30">
        {['ISO 27001 Certified', 'GDPR Compliant', 'WSA Award Winning 2024'].map(badge => (
          <span key={badge} className="text-[10px] font-bold text-text-secondary uppercase tracking-[4px]">{badge}</span>
        ))}
      </div>
    </header>
  );
};

export default Hero;
