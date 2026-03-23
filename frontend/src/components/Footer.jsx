import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Twitter, Instagram, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-bg-paper relative overflow-hidden pt-24 lg:pt-32">
      {/* High-Impact Red CTA Section */}
      <div className="mx-6 lg:mx-16 mb-16 lg:mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[40px] lg:rounded-[60px] bg-gradient-to-br from-[#FF3B30] to-[#FF2D55] p-10 lg:p-24 relative overflow-hidden group shadow-2xl shadow-accent/20"
        >
          {/* Subtle Technical Pattern */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:40px_40px] opacity-[0.08] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
             <div className="max-w-[700px] text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8 backdrop-blur-md">
                   <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                   <span className="text-[10px] font-bold text-white uppercase tracking-[4px]">Global Sentinel Protocol</span>
                </div>
                <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] font-medium font-display text-white tracking-[-0.07em] mb-10 leading-[0.9]">
                   Ready to step <br /> <span className="text-white/30 tracking-tighter">out without fear?</span>
                </h2>
                <p className="text-xl lg:text-2xl text-white/70 font-light leading-relaxed tracking-tight max-w-[500px]">
                   Join the million-strong network of women re-defining what it means to be safe in the modern world.
                </p>
             </div>
             
             <motion.div 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="relative"
             >
                {localStorage.getItem('token') ? (
                  <Link to="/dashboard" className="bg-white text-accent px-10 lg:px-16 py-6 lg:py-8 rounded-[24px] lg:rounded-[32px] font-bold text-xl lg:text-2xl shadow-2xl transition-all flex items-center gap-4 group/btn text-center justify-center">
                     Go to Dashboard <ShieldCheck size={28} className="group-hover/btn:rotate-12 transition-transform hidden sm:block" />
                  </Link>
                ) : (
                  <Link to="/register" className="bg-white text-accent px-10 lg:px-16 py-6 lg:py-8 rounded-[24px] lg:rounded-[32px] font-bold text-xl lg:text-2xl shadow-2xl transition-all flex items-center gap-4 group/btn text-center justify-center">
                     Activate SheShield <ShieldCheck size={28} className="group-hover/btn:rotate-12 transition-transform hidden sm:block" />
                  </Link>
                )}
                <div className="absolute -inset-4 bg-white/20 blur-3xl -z-10 group-hover:bg-white/30 transition-colors"></div>
             </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Main Footer Links */}
      <div className="px-6 lg:px-16 pb-16 lg:pb-24 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-12 lg:gap-24 mb-20 lg:mb-32">
          <div className="lg:col-span-5">
            <h4 className="text-5xl font-medium font-display mb-12 tracking-[-0.07em] text-text">SheShield.</h4>
            <p className="text-xl text-text-secondary font-light leading-relaxed tracking-tight max-w-[400px] opacity-60 mb-14">
               The quiet presence of a dedicated sentinel. <br /> Engineered for the modern journey.
            </p>
            <div className="flex gap-6">
               {[Globe, Twitter, Instagram].map((Icon, i) => (
                 <a key={i} href="#" className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/30 transition-all border-white/60 shadow-inner group">
                   <Icon size={22} className="group-hover:scale-110 transition-transform" />
                 </a>
               ))}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h5 className="text-[11px] font-bold text-text mb-10 uppercase tracking-[4px] opacity-40">System</h5>
            <ul className="space-y-6">
              {['Neural Mesh', 'Spatial Sync', 'Haptic Signal', 'AI Prediction'].map(item => (
                <li key={item}><a href="#" className="text-text-secondary font-light hover:text-text transition-colors tracking-tight text-[17px]">{item}</a></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h5 className="text-[11px] font-bold text-text mb-10 uppercase tracking-[4px] opacity-40">Ecosystem</h5>
            <ul className="space-y-6">
              {['The Network', 'Trust Center', 'Privacy Deck', 'Community'].map(item => (
                <li key={item}><a href="#" className="text-text-secondary font-light hover:text-text transition-colors tracking-tight text-[17px]">{item}</a></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h5 className="text-[11px] font-bold text-text mb-10 uppercase tracking-[4px] opacity-40">Global Status</h5>
            <div className="glass p-8 rounded-[32px] border-emerald-500/10 shadow-inner">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                  <p className="text-[13px] font-bold text-emerald-500 uppercase tracking-widest">Active Ready</p>
               </div>
               <p className="text-[14px] text-text-secondary font-light leading-relaxed">
                  All 14 response centers are operational with 12ms global median response time.
               </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-black/[0.03] pt-16">
           <div className="flex items-center gap-8">
              <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[4px] opacity-30">
                 © 2024 SheShield Safety.
              </p>
              <div className="h-4 w-px bg-black/[0.05]"></div>
              <p className="text-[11px] font-medium text-text-secondary tracking-[1px] opacity-40">
                 Cupertino, CA.
              </p>
           </div>
           <div className="flex gap-12 text-[11px] font-bold text-text-secondary uppercase tracking-[4px] opacity-30">
              <a href="#" className="hover:text-text transition-colors">Privacy</a>
              <a href="#" className="hover:text-text transition-colors">Legal</a>
              <a href="#" className="hover:text-text transition-colors">Sitemap</a>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
