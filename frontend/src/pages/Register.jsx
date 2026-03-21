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
        <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] -mr-40 -mt-40 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

            <Link to="/" className="absolute top-10 left-10 text-2xl font-bold tracking-tighter flex items-center gap-2 z-[100]">
                <Shield className="text-accent" size={30} /> <span className="text-text font-bold">Guardian</span>
            </Link>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[560px] relative z-10"
            >
                <div className="glass p-12 lg:p-14 rounded-[48px] shadow-2xl bg-white/95 border-white">
                    <div className="mb-14 text-center">
                        <span className="text-[12px] font-bold text-accent uppercase tracking-[3px] mb-4 block">Identity Protection</span>
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-text">Create yours.</h1>
                        <p className="text-text-secondary text-lg font-light leading-relaxed">Secure your journey in steps.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="block">
                                        <label className="block text-[13px] font-bold text-text-secondary ml-2 uppercase tracking-widest mb-3">Full Name</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary z-20">
                                                <User size={22} />
                                            </span>
                                            <input 
                                                type="text" 
                                                className="w-full h-16 bg-[#f5f5f7] border-0 rounded-2xl pl-[60px] pr-6 text-[17px] focus:ring-2 focus:ring-accent/20 transition-all outline-none text-text placeholder:text-text-secondary/40 font-medium"
                                                placeholder="Enter your name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="block">
                                        <label className="block text-[13px] font-bold text-text-secondary ml-2 uppercase tracking-widest mb-3">Email Address</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary z-20">
                                                <Mail size={22} />
                                            </span>
                                            <input 
                                                type="email" 
                                                className="w-full h-16 bg-[#f5f5f7] border-0 rounded-2xl pl-[60px] pr-6 text-[17px] focus:ring-2 focus:ring-accent/20 transition-all outline-none text-text placeholder:text-text-secondary/40 font-medium"
                                                placeholder="email@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="block">
                                        <label className="block text-[13px] font-bold text-text-secondary ml-2 uppercase tracking-widest mb-3">Secure Password</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary z-20">
                                                <Lock size={22} />
                                            </span>
                                            <input 
                                                type="password" 
                                                className="w-full h-16 bg-[#f5f5f7] border-0 rounded-2xl pl-[60px] pr-6 text-[17px] focus:ring-2 focus:ring-accent/20 transition-all outline-none text-text placeholder:text-text-secondary/40 font-medium"
                                                placeholder="Min. 8 characters"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={handleNext}
                                        className="btn btn-primary w-full h-16 rounded-[28px] mt-4 flex items-center justify-center gap-2 group text-white font-bold text-[17px] shadow-xl shadow-accent/20"
                                    >
                                        Continue <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
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
                                    <div className="block">
                                        <label className="block text-[13px] font-bold text-text-secondary ml-2 uppercase tracking-widest mb-3">Phone Number</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary z-20">
                                                <Phone size={22} />
                                            </span>
                                            <input 
                                                type="tel" 
                                                className="w-full h-16 bg-[#f5f5f7] border-0 rounded-2xl pl-[60px] pr-6 text-[17px] focus:ring-2 focus:ring-accent/20 transition-all outline-none text-text placeholder:text-text-secondary/40 font-medium"
                                                placeholder="+1 234 567 8900"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="block">
                                        <label className="block text-[13px] font-bold text-text-secondary ml-2 uppercase tracking-widest mb-3">Residential Address</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-6 text-text-secondary z-20">
                                                <MapPin size={22} />
                                            </span>
                                            <textarea 
                                                className="w-full bg-[#f5f5f7] border-0 rounded-2xl pl-[60px] pr-6 py-5 text-[17px] focus:ring-2 focus:ring-accent/20 transition-all outline-none resize-none h-32 text-text placeholder:text-text-secondary/40 font-medium"
                                                placeholder="Street, City, Zip"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && <p className="text-accent text-[13px] font-bold text-center bg-accent/5 py-4 rounded-2xl">{error}</p>}

                                    <div className="flex gap-4">
                                        <button 
                                            type="button" 
                                            onClick={handleBack}
                                            className="btn flex-1 h-16 bg-black/5 hover:bg-black/10 py-4 rounded-[28px] text-text font-bold"
                                        >
                                            Back
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="btn btn-primary flex-[2] h-16 py-4 rounded-[28px] flex items-center justify-center gap-2 group text-white font-bold text-[17px] shadow-xl shadow-accent/20"
                                        >
                                            {loading ? 'Securing...' : 'Verify Profile'} <CheckCircle2 size={24} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                <div className="mt-12 text-center text-text-secondary text-[15px] font-medium tracking-tight">
                    Already part of the network? <Link to="/login" className="text-accent font-bold hover:underline">Sign in.</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
