import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import waveImage from '../assets/waves.png';

const BentoGrid = () => {
    return (
      <section className="container pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Large Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-8 rounded-[56px] bg-[#f5f5f7] relative overflow-hidden group min-h-[640px]"
          >
            <img 
              src={waveImage} 
              alt="Waves" 
              className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-[2.5s] ease-[0.16, 1, 0.3, 1]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-16 left-16 lg:w-[420px] glass p-12 rounded-[48px] border-white/20 shadow-2xl">
              <h3 className="text-3xl font-bold mb-6 tracking-tight text-text">Spatial Awareness</h3>
              <p className="text-lg font-light text-text-secondary leading-relaxed mb-10">
                Precision GPS that creates a silent connection with your inner circle. Awareness without intrusion.
              </p>
              <button className="flex items-center gap-2 text-[15px] font-bold hover:gap-3 transition-all text-text group/btn">
                Explore Technology <ChevronRight size={20} className="text-accent group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          <div className="lg:col-span-4 grid grid-rows-2 gap-10">
            {/* Safety Circles Card */}
            <motion.div 
              className="rounded-[56px] bg-[#1d1d1f] text-white p-14 flex flex-col justify-between shadow-xl"
            >
              <div>
                <h3 className="text-3xl font-bold mb-6 tracking-tight">Safety Circles</h3>
                <p className="text-lg font-light opacity-60 leading-relaxed">
                  Trusted individuals who receive alerts instantly.
                </p>
              </div>
              <div className="flex -space-x-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-14 h-14 rounded-full border-[5px] border-[#1d1d1f] bg-white/10 backdrop-blur-md"></div>
                ))}
              </div>
            </motion.div>

            {/* Silent SOS Card */}
            <motion.div 
              className="rounded-[56px] bg-[#f5f5f7] p-14 flex flex-col justify-center shadow-lg"
            >
              <h3 className="text-3xl font-bold mb-6 tracking-tight text-text">Silent SOS</h3>
              <p className="text-lg font-light text-text-secondary leading-relaxed">
                Discrete haptic triggers that alert the authorities without a sound.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    );
};

export default BentoGrid;
