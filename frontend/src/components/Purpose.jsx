import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Globe } from 'lucide-react';
import officeImage from '../assets/office.png';

const Purpose = () => {
    return (
      <section className="bg-bg-secondary py-40 border-t border-black/5 overflow-hidden">
        <div className="container grid lg:grid-cols-2 gap-32 items-center">
          <div className="max-w-[620px]">
            <span className="text-[13px] font-bold text-text-secondary uppercase tracking-[3px] mb-12 block">Our Purpose</span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-14 tracking-tighter font-bold text-text">Security as <br /> a right.</h2>
            <p className="text-2xl text-text-secondary/70 font-light mb-16 leading-relaxed max-w-[580px]">
              Founded in 2021, Guardian was born from a simple observation: existing tools were built for emergencies, not for daily peace of mind. We re-engineered safety to focus on prevention.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-16">
              <div className="space-y-6">
                 <div className="p-3 bg-emerald-100/30 w-fit rounded-xl">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                 </div>
                 <h4 className="text-xl font-bold text-text">Built on Trust</h4>
                 <p className="text-lg text-text-secondary/60 leading-relaxed font-light">We never monetize your movement. Our business is protection.</p>
              </div>
              <div className="space-y-6">
                 <div className="p-3 bg-blue-100/30 w-fit rounded-xl">
                    <Globe size={32} className="text-blue-500" />
                 </div>
                 <h4 className="text-xl font-bold text-text">Global Scale</h4>
                 <p className="text-lg text-text-secondary/60 leading-relaxed font-light">24/7 support across 142 countries, ensuring safety everywhere.</p>
              </div>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[64px] overflow-hidden shadow-2xl bg-white p-4"
          >
            <img src={officeImage} alt="Modern Haven" className="w-full h-auto rounded-[48px] grayscale opacity-90 hover:grayscale-0 transition-all duration-1000" />
          </motion.div>
        </div>
      </section>
    );
};

export default Purpose;
