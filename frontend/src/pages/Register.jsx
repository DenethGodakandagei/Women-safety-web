import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, ChevronRight, CheckCircle2, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/v1/users/signup', formData);
            if (res.data.status === 'success') {
                localStorage.setItem('token', res.data.token);
                navigate('/complete-profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fbfbfd] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Premium Background Meshes */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <Link to="/" className="fixed top-10 left-10 text-2xl font-medium tracking-[-0.05em] flex items-center gap-3 z-[100] font-display text-text group">
                <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center border-white/60 group-hover:scale-110 transition-transform shadow-inner">
                   <Shield className="text-accent" size={20} strokeWidth={2} />
                </div>
                SheShield.
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                className="w-full max-w-[560px] relative z-10 py-12"
            >
                <div className="glass rounded-[60px] p-12 lg:p-16 border-white/80 bg-white/70 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.1)]">
                    <div className="mb-14 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 border border-accent/10 mb-8">
                           <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                           <span className="text-[10px] font-bold text-accent uppercase tracking-[3px]">Identity Provisioning</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-medium tracking-[-0.06em] mb-4 text-text font-display">Create <br /> <span className="opacity-20 font-light tracking-tighter italic">profile.</span></h1>
                        <p className="text-text-secondary text-xl font-light leading-relaxed tracking-tight">Step {step} of 2: Secure your identity.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="group">
                                        <label className="block text-[11px] font-bold text-text mb-4 uppercase tracking-[4px] opacity-40 ml-1">Full Identity</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity">
                                                <User size={22} strokeWidth={1.5} />
                                            </span>
                                            <input 
                                                type="text" 
                                                className="w-full h-18 bg-white/50 border border-black/[0.03] rounded-3xl pl-[68px] pr-8 text-[18px] focus:bg-white focus:ring-4 focus:ring-accent/10 focus:border-accent/20 transition-all outline-none text-text placeholder:text-text-secondary/20 font-light"
                                                placeholder="Enter your name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[11px] font-bold text-text mb-4 uppercase tracking-[4px] opacity-40 ml-1">Email Terminal</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity">
                                                <Mail size={22} strokeWidth={1.5} />
                                            </span>
                                            <input 
                                                type="email" 
                                                className="w-full h-18 bg-white/50 border border-black/[0.03] rounded-3xl pl-[68px] pr-8 text-[18px] focus:bg-white focus:ring-4 focus:ring-accent/10 focus:border-accent/20 transition-all outline-none text-text placeholder:text-text-secondary/20 font-light"
                                                placeholder="id@shield.protocol"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[11px] font-bold text-text mb-4 uppercase tracking-[4px] opacity-40 ml-1">Encryption Key</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity">
                                                <Lock size={22} strokeWidth={1.5} />
                                            </span>
                                            <input 
                                                type="password" 
                                                className="w-full h-18 bg-white/50 border border-black/[0.03] rounded-3xl pl-[68px] pr-8 text-[18px] focus:bg-white focus:ring-4 focus:ring-accent/10 focus:border-accent/20 transition-all outline-none text-text placeholder:text-text-secondary/20 font-light"
                                                placeholder="Min. 8 characters"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button" 
                                            onClick={handleNext}
                                            className="w-full h-20 bg-accent text-white rounded-[32px] flex items-center justify-between px-10 shadow-2xl shadow-accent/20 group relative overflow-hidden active:scale-95 transition-all duration-300"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            <span className="text-[20px] font-bold tracking-tight">Configuration Mode</span>
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                                <ChevronRight size={24} strokeWidth={2.5} />
                                            </div>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="group">
                                        <label className="block text-[11px] font-bold text-text mb-4 uppercase tracking-[4px] opacity-40 ml-1">Contact Signal</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity">
                                                <Phone size={22} strokeWidth={1.5} />
                                            </span>
                                            <input 
                                                type="tel" 
                                                className="w-full h-18 bg-white/50 border border-black/[0.03] rounded-3xl pl-[68px] pr-8 text-[18px] focus:bg-white focus:ring-4 focus:ring-accent/10 focus:border-accent/20 transition-all outline-none text-text placeholder:text-text-secondary/20 font-light"
                                                placeholder="+1 234 567 8900"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[11px] font-bold text-text mb-4 uppercase tracking-[4px] opacity-40 ml-1">Spatial Home</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-6 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity">
                                                <MapPin size={22} strokeWidth={1.5} />
                                            </span>
                                            <textarea 
                                                className="w-full bg-white/50 border border-black/[0.03] rounded-3xl pl-[68px] pr-8 py-5 text-[18px] focus:bg-white focus:ring-4 focus:ring-accent/10 focus:border-accent/20 transition-all outline-none resize-none h-32 text-text placeholder:text-text-secondary/20 font-light"
                                                placeholder="Street, City, Zip"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div 
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="text-accent text-[13px] font-bold text-center bg-accent/5 py-5 rounded-3xl border border-accent/10"
                                        >
                                           {error}
                                        </motion.div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            type="button" 
                                            onClick={handleBack}
                                            className="flex-1 h-20 glass rounded-[32px] text-text font-bold hover:bg-black/5 transition-all text-[17px] tracking-tight"
                                        >
                                            Previous
                                        </button>
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit" 
                                            disabled={loading}
                                            className="flex-[2] h-20 bg-accent text-white rounded-[32px] flex items-center justify-between px-10 shadow-2xl shadow-accent/20 group relative overflow-hidden active:scale-95 transition-all duration-300"
                                        >
                                            <span className="text-[19px] font-bold tracking-tight">
                                               {loading ? 'Securing...' : 'Deploy Sentinel'}
                                            </span>
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                                <CheckCircle2 size={24} strokeWidth={2.5} />
                                            </div>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-text-secondary text-[16px] font-medium tracking-tight opacity-40 mb-4">Already registered?</p>
                    <Link to="/login" className="glass px-8 py-3 rounded-2xl text-accent font-bold hover:bg-accent hover:text-white transition-all border-accent/10 hover:border-accent shadow-lg shadow-accent/5">
                       Sign in Protocol.
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
