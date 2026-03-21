import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, MapPin, Sparkles } from 'lucide-react';

const Features = () => {
    const items = [
      { icon: <Fingerprint size={32} />, title: "Identity Encryption", desc: "End-to-end protocols ensure your path is seen only by those you explicitly trust." },
      { icon: <MapPin size={32} />, title: "Precision Response", desc: "Our global response centers use spatial intelligence to reach you faster." },
      { icon: <Sparkles size={32} />, title: "Predictive Safety", desc: "Advanced behavioral modeling identifies distress before you even have to signal." }
    ];

    return (
      <section className="container py-32 border-t border-black/5">
        <div className="grid lg:grid-cols-2 gap-20 items-end mb-32">
          <div>
            <span className="text-[13px] font-bold text-text-secondary uppercase tracking-[2.5px] mb-8 block font-semibold">The Standard</span>
            <h2 className="text-5xl md:text-7xl tracking-tighter font-bold text-text">Frictionless <br /> protection.</h2>
          </div>
          <p className="text-xl md:text-2xl text-text-secondary font-light md:max-w-[480px] mb-6 leading-relaxed">
            We've removed the noise from personal safety, creating a system that is invisible until it's vital.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {items.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="mb-10 w-16 h-16 rounded-3xl bg-[#f5f5f7] flex items-center justify-center group-hover:bg-accent/5 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-2xl mb-5 font-bold tracking-tight text-text">{item.title}</h3>
              <p className="text-lg text-text-secondary/70 leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    );
};

export default Features;
