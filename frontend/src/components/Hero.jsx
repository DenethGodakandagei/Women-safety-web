import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <header className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-bg-secondary">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#f5f5f7] to-white pointer-events-none opacity-40"></div>
      
      <div className="container relative z-10 text-center py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
        >
          <span className="text-[12px] font-bold text-text-secondary uppercase tracking-[3px] mb-10 block">
             Quietly Intelligent
          </span>
          
          <h1 className="text-6xl md:text-8xl lg:text-[100px] leading-[1.05] mb-12 tracking-[-0.05em] font-bold text-text">
             Security that feels <br className="hidden md:block" />
             like <span className="text-text-secondary font-medium">peace of mind.</span>
          </h1>

          <p className="text-xl md:text-[23px] text-text-secondary max-w-[800px] mx-auto mb-16 font-light leading-relaxed">
             Premium safety engineered for the modern journey. Experience the presence of a dedicated sentinel, without the noise.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
             <Link to="/register" className="btn btn-primary px-10 py-4 text-[17px] shadow-2xl shadow-accent/20">
               Start Protection
             </Link>
             <button className="flex items-center gap-2 group hover:opacity-70 transition-opacity text-[18px] font-semibold">
               Learn more <div className="p-2.5 rounded-full border border-black/5 group-hover:bg-black/5"><Play size={20} fill="currentColor" /></div>
             </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-16 w-full text-center">
         <p className="text-[11px] font-bold text-text-secondary/30 uppercase tracking-[2px]">Encrypted & Global Signal</p>
      </div>
    </header>
  );
};

export default Hero;
