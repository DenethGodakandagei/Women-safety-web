import React from 'react';
import { motion } from 'framer-motion';
import { Navigation as NavigationIcon, ShieldCheck } from 'lucide-react';

const AIPrediction = () => {
    return (
      <section className="container py-40">
        <div className="glass rounded-[64px] overflow-hidden relative border-black/5 p-16 lg:p-32 shadow-sm bg-bg-secondary/40">
          <div className="grid lg:grid-cols-2 gap-32 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass mb-12 text-[12px] font-bold tracking-[3px] uppercase text-accent">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                AI Risk Prediction
              </div>
              <h2 className="text-5xl lg:text-7xl leading-[1.05] mb-12 tracking-tighter font-bold text-text">Predictive <br /> Signal Mapping.</h2>
              <p className="text-2xl text-text-secondary/70 font-light mb-16 leading-relaxed max-w-[540px]">
                Our neural network processes historical data, real-time reports, and urban patterns to predict risk before you even start.
              </p>
              <button className="btn btn-primary px-12 py-5 text-[17px] shadow-2xl shadow-accent/20 transition-transform active:scale-95">Try Prediction Beta</button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square flex items-center justify-center"
            >
              <div className="absolute w-[120%] h-[120%] rounded-full border border-dashed border-black/5 animate-spin-slow"></div>
              <div className="absolute w-full h-full rounded-full border border-black/5"></div>
              <div className="absolute w-[80%] h-[80%] rounded-full border border-black/10"></div>
              
              <div className="relative w-32 h-32 rounded-[40px] bg-white shadow-2xl flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <NavigationIcon size={48} className="text-accent group-hover:rotate-12 transition-transform" />
              </div>
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute top-0 right-0 lg:top-12 lg:right-12 glass px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border-emerald-500/10"
              >
                 <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck size={28} />
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">AI Prediction</p>
                    <p className="text-sm font-bold text-text">Safe Route Secured</p>
                 </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    );
};

export default AIPrediction;
