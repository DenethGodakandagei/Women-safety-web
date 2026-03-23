import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

const Features = () => {
    const items = [
      { 
        icon: <Fingerprint size={28} strokeWidth={1.5} />, 
        title: "Identity Encryption", 
        desc: "End-to-end protocols ensure your path is seen only by those you explicitly trust." 
      },
      { 
        icon: <MapPin size={28} strokeWidth={1.5} />, 
        title: "Precision Response", 
        desc: "Our global response centers use spatial intelligence to reach you faster than ever." 
      },
      { 
        icon: <Sparkles size={28} strokeWidth={1.5} />, 
        title: "Predictive Safety", 
        desc: "Advanced behavioral modeling identifies potential distress before you even have to signal." 
      }
    ];

    return (
      <section className="py-24 lg:py-48 bg-bg-paper relative overflow-hidden px-6 lg:px-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 lg:gap-16 mb-20 lg:mb-32 border-b border-black/[0.03] pb-16 lg:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-[640px]"
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 mb-10">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                <span className="text-[11px] font-bold text-accent uppercase tracking-[3px]">Intelligent Safety</span>
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] leading-[0.9] tracking-[-0.07em] font-medium text-text font-display">
                Frictionless <br /> <span className="text-text-secondary/20">protection.</span>
              </h2>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-text-secondary font-light lg:max-w-[480px] leading-relaxed tracking-tight"
            >
              We've removed the noise from personal safety, creating a system that is invisible until it's vital. Engineered to be there when you aren't looking.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
            {items.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 1, ease: [0.25, 1, 0.5, 1] }}
                className="group relative"
              >
                <div className="mb-12 w-20 h-20 rounded-[32px] glass flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border-white/60">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]"></div>
                  <div className="text-accent/80 group-hover:text-accent transition-colors relative z-10">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-3xl mb-6 font-medium tracking-[-0.04em] text-text font-display">{item.title}</h3>
                <p className="text-[17px] text-text-secondary font-light leading-relaxed tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-accent/[0.02] blur-[150px] -z-10 rounded-full"></div>
      </section>
    );
};

export default Features;
