import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import BentoGrid from '../components/BentoGrid';
import AIPrediction from '../components/AIPrediction';
import Purpose from '../components/Purpose';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="bg-white min-h-screen text-text selection:bg-accent/10 selection:text-white">
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <BentoGrid />
        <AIPrediction />
        <Purpose />
      </main>

      {/* SOS Floating Action Button */}
      <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fab bottom-10 right-10 z-[150]"
      >
        <Shield size={32} strokeWidth={2.5} />
      </motion.div>

      <Footer />
    </div>
  );
};

export default Home;
