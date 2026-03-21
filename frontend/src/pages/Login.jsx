import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ChevronRight, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/v1/users/login', formData);
            if (res.data.status === 'success') {
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
                className="w-full max-w-[480px] relative z-10"
            >
                <div className="glass p-12 lg:p-14 rounded-[48px] shadow-2xl bg-white/95 border-white">
                    <div className="mb-14 text-center">
                        <span className="text-[12px] font-bold text-accent uppercase tracking-[3px] mb-4 block">Security Authentication</span>
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-text">Welcome back.</h1>
                        <p className="text-text-secondary text-lg font-light leading-relaxed">Secure access to your shield.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Email Input Group */}
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

                        {/* Password Input Group */}
                        <div className="block">
                            <div className="flex justify-between items-center px-2 mb-3">
                                <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-widest">Password</label>
                                <a href="#" className="text-[11px] font-bold text-accent hover:underline">Forgot?</a>
                            </div>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary z-20">
                                    <Lock size={22} />
                                </span>
                                <input 
                                    type="password" 
                                    className="w-full h-16 bg-[#f5f5f7] border-0 rounded-2xl pl-[60px] pr-6 text-[17px] focus:ring-2 focus:ring-accent/20 transition-all outline-none text-text placeholder:text-text-secondary/40 font-medium"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="text-accent text-[13px] font-bold text-center bg-accent/5 py-4 rounded-2xl">{error}</p>}

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="btn btn-primary w-full h-16 rounded-[28px] flex items-center justify-center gap-3 group shadow-xl shadow-accent/20 text-white font-bold text-[17px]"
                            >
                                {loading ? 'Authenticating...' : 'Sign In'} <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-12 text-center text-text-secondary text-[15px] font-medium tracking-tight">
                    New with Guardian? <Link to="/register" className="text-accent font-bold hover:underline">Create account.</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
