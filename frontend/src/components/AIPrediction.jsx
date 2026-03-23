import React from 'react';
import { motion } from 'framer-motion';
import { Navigation as NavigationIcon, ShieldCheck, Activity } from 'lucide-react';

const AIPrediction = () => {
    return (
      <section className="py-24 lg:py-48 bg-bg-paper px-6 lg:px-16 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="glass rounded-[60px] lg:rounded-[80px] p-10 lg:p-32 relative overflow-hidden bg-white/40 border-white/60 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.1)]"
          >
            {/* Background Mesh - Technical Amber/Red Tones */}
            <div className="absolute top-0 right-[-10%] w-2/3 h-full bg-accent/[0.04] blur-[140px] pointer-events-none rounded-full"></div>
            
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass mb-10 lg:mb-12 text-[11px] font-bold tracking-[4px] uppercase text-accent border-accent/10">
                  <Activity size={16} className="animate-pulse" />
                  Neural Signal Mesh
                </div>
                <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] leading-[0.9] mb-10 lg:mb-14 tracking-[-0.07em] font-medium text-text font-display">
                   Predictive <br /> <span className="text-text-secondary/20">Signals.</span>
                </h2>
                <p className="text-xl lg:text-3xl text-text-secondary font-light mb-12 lg:mb-16 leading-[1.3] max-w-[540px] tracking-tight">
                  Our mesh network processes billions of data points to predict environmental shifts before they manifest.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-8 items-center">
                  <button className="btn-premium-active !px-12 !py-5 !text-[17px] !rounded-[22px] !font-bold">Initialize Beta</button>
                  <p className="text-[14px] text-text-secondary/40 font-medium tracking-tight">Active Coverage in 42 Global Hubs</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-square max-w-[600px] mx-auto flex items-center justify-center p-8 lg:p-16 group"
              >
                {/* Technical Orbital Indicators */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
                      className="absolute border border-black/[0.03] rounded-full"
                      style={{ width: `${60 + i * 20}%`, height: `${60 + i * 20}%` }}
                    />
                  ))}
                </div>

                {/* Animated Signal Waves */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ 
                        scale: [0.8, 2.5], 
                        opacity: [0.3, 0],
                      }}
                      transition={{ 
                        duration: 5, 
                        repeat: Infinity, 
                        delay: i * 1.5,
                        ease: "easeOut"
                      }}
                      className="absolute w-72 h-72 rounded-full border border-accent/20"
                    />
                  ))}
                </div>

                {/* Core Navigation Hub */}
                <motion.div 
                   whileHover={{ scale: 1.05 }}
                   className="relative w-40 h-40 rounded-[48px] glass flex items-center justify-center group shadow-[0_40px_80px_-15px_rgba(255,59,48,0.2)] border-white/60"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-accent/5 rounded-[48px]"></div>
                  <NavigationIcon 
                    size={64} 
                    className="text-accent drop-shadow-[0_8px_24px_rgba(255,59,48,0.4)] group-hover:rotate-12 transition-transform duration-700" 
                    strokeWidth={1.5}
                  />
                </motion.div>
                
                {/* Floating Meta Stats - Desktop Only */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="hidden lg:flex absolute -top-12 right-0 lg:-top-4 lg:-right-8 glass px-8 py-5 rounded-[32px] shadow-2xl items-center gap-5 border-emerald-500/10 min-w-[240px]"
                >
                   <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
                      <ShieldCheck size={32} strokeWidth={1.5} />
                   </div>
                   <div className="text-left">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary opacity-40 mb-1">Risk Buffer</p>
                      <p className="text-[20px] font-medium text-text font-display tracking-tight">Maximum Safe</p>
                   </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                  className="hidden lg:flex absolute -bottom-12 left-0 lg:-bottom-4 lg:-left-8 glass px-8 py-5 rounded-[32px] shadow-2xl items-center gap-5 border-white/60 min-w-[200px]"
                >
                   <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center">
                      <Activity size={28} className="text-text-secondary" strokeWidth={1.5} />
                   </div>
                   <div className="text-left">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary opacity-40 mb-1">Latency</p>
                      <p className="text-[20px] font-medium text-text font-display tracking-tight">12.4ms</p>
                   </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    );
};

export default AIPrediction;
