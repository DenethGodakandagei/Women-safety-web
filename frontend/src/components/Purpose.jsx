import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Globe, ShieldCheck, Heart } from 'lucide-react';

const Purpose = () => {
    return (
      <section className="bg-bg-paper py-24 lg:py-48 overflow-hidden px-6 lg:px-16 border-t border-black/[0.03]">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-32 xl:gap-48 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
            className="max-w-[700px]"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-accent/5 border border-accent/10 mb-10 lg:mb-12">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <span className="text-[11px] font-bold text-accent uppercase tracking-[4px]">Our Philosophy</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] leading-[0.9] tracking-[-0.07em] font-medium text-text font-display mb-12 lg:mb-16">
               Modern <br /> <span className="text-text-secondary/20">Sentinels.</span>
            </h2>
            <p className="text-xl lg:text-3xl text-text-secondary font-light mb-12 lg:mb-20 leading-[1.3] max-w-[620px] tracking-tight border-l-2 border-accent/20 pl-6 lg:pl-10">
              We've re-engineered personal safety to focus on invisible prevention. A world where protection is a silent right, not a loud luxury.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-16 lg:gap-20">
              <div className="space-y-8 group relative">
                 <div className="w-16 h-16 rounded-[28px] glass flex items-center justify-center text-emerald-500 shadow-2xl transition-all duration-500 group-hover:bg-emerald-500/10 border-white/60">
                    <CheckCircle2 size={32} strokeWidth={1.5} />
                 </div>
                 <div>
                    <h4 className="text-2xl font-medium text-text font-display tracking-tight mb-4 uppercase">Built on Trust</h4>
                    <p className="text-[16px] text-text-secondary font-light leading-relaxed tracking-tight group-hover:opacity-100 opacity-60 transition-opacity">
                       We never monetize your movement. Our primary product is your protection.
                    </p>
                 </div>
              </div>
              <div className="space-y-8 group relative">
                 <div className="w-16 h-16 rounded-[28px] glass flex items-center justify-center text-accent shadow-2xl transition-all duration-500 group-hover:bg-accent/10 border-white/60">
                    <Heart size={32} strokeWidth={1.5} />
                 </div>
                 <div>
                    <h4 className="text-2xl font-medium text-text font-display tracking-tight mb-4 uppercase">Human-Centric</h4>
                    <p className="text-[16px] text-text-secondary font-light leading-relaxed tracking-tight group-hover:opacity-100 opacity-60 transition-opacity">
                       24/7 support across 142 countries, ensuring safety everywhere you go.
                    </p>
                 </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-[80px] overflow-hidden shadow-[0_80px_160px_-40px_rgba(255,59,48,0.15)] bg-white/40 p-12 glass border-white/60">
               <div className="aspect-[4/5] bg-gradient-to-tr from-[#f5f5f7] to-white rounded-[60px] flex items-center justify-center overflow-hidden group">
                  <div className="relative w-full h-full flex items-center justify-center">
                     <div className="absolute w-[150%] h-[150%] bg-accent/[0.05] blur-[150px] animate-pulse"></div>
                     <motion.div
                       animate={{ 
                         rotate: [0, 5, 0],
                         scale: [1, 1.05, 1]
                       }}
                       transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                     >
                        <ShieldCheck size={200} strokeWidth={0.3} className="text-accent/10 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
                     </motion.div>
                  </div>
               </div>
            </div>
            
            {/* Absolute Technical Annotations */}
            <motion.div 
              animate={{ x: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -left-12 glass px-10 py-8 rounded-[40px] shadow-2xl hidden lg:block border-emerald-500/20"
            >
               <div className="flex items-center gap-4 mb-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                  <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-[4px]">Privacy Active</p>
               </div>
               <p className="text-2xl font-medium text-text tracking-tighter font-display leading-[1] mt-4">Zero-Knowledge <br /> Mesh Protocol.</p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-16 -right-8 glass px-8 py-6 rounded-[32px] shadow-2xl hidden lg:block border-white/60"
            >
               <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">System Standard 08</p>
               <p className="text-xl font-medium text-text font-display tracking-tight">E2EE Spatial Mapping.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
};

export default Purpose;
