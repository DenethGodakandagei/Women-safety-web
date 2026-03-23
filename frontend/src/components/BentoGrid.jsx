import React from 'react';
import { motion } from 'framer-motion';
import { Users, Navigation, Zap, Globe, Shield } from 'lucide-react';

const BentoGrid = () => {
  return (
    <section className="py-24 lg:py-48 bg-bg-paper px-6 lg:px-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 lg:gap-16 mb-16 lg:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-[640px]"
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 mb-10">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                <span className="text-[11px] font-bold text-accent uppercase tracking-[3px]">The Mesh Economy</span>
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] leading-[0.9] tracking-[-0.07em] font-medium text-text font-display">
                A network that <br /> <span className="text-text-secondary/20">breathes with you.</span>
              </h2>
            </motion.div>
            <motion.p 
              className="text-xl md:text-2xl text-text-secondary font-light lg:max-w-[480px] leading-relaxed tracking-tight"
            >
              Every SheShield user contributes to a silent, global safety mesh. True security is found in the collective presence of those who care.
            </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-8 h-auto md:h-[900px]">
          {/* Main Network Visualizer - Large Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-8 md:row-span-2 glass rounded-[60px] p-16 flex flex-col justify-between relative overflow-hidden group border-white/40 bg-white/70 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none transform translate-x-20 -translate-y-20 scale-150 group-hover:scale-[1.55] transition-transform duration-1000">
               <Globe size={800} strokeWidth={0.5} />
            </div>
            
            <div className="relative z-10 max-w-[480px]">
               <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white mb-10 shadow-lg shadow-accent/20">
                  <Navigation size={28} />
               </div>
               <h3 className="text-4xl md:text-7xl font-medium font-display tracking-[-0.05em] mb-10 leading-[0.95]">
                  Spatial <br /> Intelligence.
               </h3>
               <p className="text-xl text-text-secondary font-light leading-relaxed tracking-tight max-w-[380px]">
                  Discrete protocols create a continuous, silent heartbeat between you and your trusted circle. Aware, without being intrusive.
               </p>
            </div>

            <div className="mt-20 flex gap-12 items-end relative z-10 border-t border-black/[0.03] pt-12">
               <div>
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[3px] opacity-40 mb-4">Precision</p>
                  <p className="text-4xl font-medium font-display tracking-tight">0.8m</p>
               </div>
               <div>
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[3px] opacity-40 mb-4">Uptime</p>
                  <p className="text-4xl font-medium font-display tracking-tight text-emerald-500">100%</p>
               </div>
            </div>
          </motion.div>

          {/* Safety Circles - Tall Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-4 md:row-span-1 glass rounded-[60px] p-12 flex flex-col justify-between group border-white shadow-xl bg-accent/5"
          >
             <div className="flex justify-between items-start">
               <div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-widest block mb-4">Ecosystem</span>
                <h3 className="text-4xl font-medium font-display tracking-tighter mb-4">Safety Circles</h3>
               </div>
               <div className="p-3 rounded-2xl bg-white/50 border border-white">
                  <Users size={20} className="text-accent" />
               </div>
             </div>
             
             <div className="flex -space-x-4 mb-8">
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-20 h-20 rounded-full border-[6px] border-white shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500 hover:z-30">
                   <img src={`/avatars/avatar${i}.png`} alt="Member" className="w-full h-full object-cover" />
                 </div>
               ))}
               <div className="w-20 h-20 rounded-full border-[6px] border-white shadow-2xl bg-[#1d1d1f] flex items-center justify-center text-white font-bold text-xl relative group-hover:scale-105 transition-transform duration-500">
                  +12
               </div>
             </div>

             <p className="text-[15px] text-text-secondary/70 leading-relaxed font-light">
                Your inner network receives end-to-end encrypted spatial presence updates instantly.
             </p>
          </motion.div>

          {/* Silent SOS - Small Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 md:row-span-1 glass rounded-[60px] p-12 flex flex-col justify-between group border-white shadow-xl bg-white/40"
          >
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-[20px] bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap size={24} className="text-accent" />
              </div>
              <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                 <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Haptic Ready</span>
              </div>
            </div>
            
            <div className="mt-8">
               <h3 className="text-3xl font-medium font-display tracking-tight mb-4 leading-tight">Silent <br /> Haptics.</h3>
               <p className="text-[14px] text-text-secondary/60 font-light leading-relaxed">
                  Triggers discreet emergency protocols without a visual trace on your device.
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
