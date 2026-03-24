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
    <div className="theme-dark min-h-screen text-text selection:bg-accent/10 selection:text-white">
      <Navbar />
      
      <main>
        <div id="home"><Hero /></div>
        <div id="intelligence"><Features /></div>
        <div id="network"><BentoGrid /></div>
        <div id="technology"><AIPrediction /></div>
        <div id="trust"><Purpose /></div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
