import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, UserPlus, Trash2, Heart, Shield, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CompleteProfile = () => {
    const [contacts, setContacts] = useState([]);
    const [formData, setFormData] = useState({ name: '', phone: '', relation: 'family' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchContacts = async () => {
        try {
            const res = await api.get('/users/me');
            setContacts(res.data.data.user.emergencyContacts || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleAddContact = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/users/addEmergencyContact', formData);
            setFormData({ name: '', phone: '', relation: 'family' });
            fetchContacts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add contact');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/users/deleteEmergencyContact/${id}`);
            fetchContacts();
        } catch (err) {
            console.error(err);
        }
    };

    const inputClasses = "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[15px] text-[#f5f5f7] placeholder:text-[#8e8e93] focus:ring-2 focus:ring-accent/20 transition-all outline-none";
    const selectClasses = "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[15px] text-[#f5f5f7] focus:ring-2 focus:ring-accent/20 transition-all outline-none appearance-none cursor-pointer";

    return (
        <div className="min-h-screen theme-dark bg-[#0a0a0c] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] -ml-40 -mt-40"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -mr-20 -mb-20"></div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-12 items-start relative z-10"
            >
                {/* Left Side: Form */}
                <div className="glass-dark p-8 lg:p-12 rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
                    <div className="mb-10">
                        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                            <Heart className="text-accent" size={28} />
                        </div>
                        <h1 className="text-4xl font-semibold tracking-tight text-[#f5f5f7] mb-3">Build your circle.</h1>
                        <p className="text-[#8e8e93] text-lg font-medium">Define who gets alerted in an emergency.</p>
                    </div>

                    <form onSubmit={handleAddContact} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[12px] font-bold text-[#8e8e93] ml-4 uppercase tracking-widest">Contact Name</label>
                            <input 
                                type="text" 
                                className={inputClasses}
                                placeholder="e.g. Mom, Dad, John"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[12px] font-bold text-[#8e8e93] ml-4 uppercase tracking-widest">Phone Number</label>
                            <div className="relative group">
                                <input 
                                    type="tel" 
                                    className={`${inputClasses} pl-14`}
                                    placeholder="+94 7X XXX XXXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    required
                                />
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8e8e93] group-focus-within:text-accent transition-colors" size={20} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[12px] font-bold text-[#8e8e93] ml-4 uppercase tracking-widest">Relation</label>
                            <div className="relative">
                                <select 
                                    className={selectClasses}
                                    value={formData.relation}
                                    onChange={(e) => setFormData({...formData, relation: e.target.value})}
                                >
                                    <option value="family" style={{ background: '#1c1c1e' }}>Family Member</option>
                                    <option value="partner" style={{ background: '#1c1c1e' }}>Partner / Spouse</option>
                                    <option value="friend" style={{ background: '#1c1c1e' }}>Close Friend</option>
                                    <option value="other" style={{ background: '#1c1c1e' }}>Other</option>
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8e8e93] pointer-events-none rotate-90" size={18} />
                            </div>
                        </div>

                        {error && <p className="text-accent text-[13px] font-semibold text-center bg-accent/10 py-2 rounded-xl border border-accent/20 animate-shake">{error}</p>}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-premium-active w-full py-5 rounded-[24px] mt-4 flex items-center justify-center gap-2 group shadow-2xl shadow-accent/40 text-lg"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Add to Circle <UserPlus size={20} /></>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Side: List */}
                <div className="lg:py-6">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-semibold tracking-tight text-[#f5f5f7]">Your Network</h2>
                        <div className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                            <span className="text-[11px] font-bold text-accent uppercase tracking-widest">{contacts.length} Active Guardians</span>
                        </div>
                    </div>

                    <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {contacts.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="p-16 border-2 border-dashed border-white/5 rounded-[40px] text-center"
                                >
                                    <Shield className="mx-auto text-[#8e8e93] mb-6 opacity-20" size={64} strokeWidth={1} />
                                    <p className="text-[#8e8e93] font-medium text-lg">No guardians added yet.</p>
                                    <p className="text-[#48484a] text-sm mt-2">Connect at least one person you trust.</p>
                                </motion.div>
                            ) : (
                                contacts.map((c) => (
                                    <motion.div 
                                        key={c._id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="glass-dark p-6 rounded-[32px] flex items-center justify-between border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-accent group-hover:scale-110 transition-transform">
                                                {c.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#f5f5f7] text-lg">{c.name}</h4>
                                                <p className="text-sm text-[#8e8e93] font-medium uppercase tracking-tight">
                                                    <span className="text-accent">{c.relation}</span> • {c.phone}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(c._id)}
                                            className="w-11 h-11 rounded-14 flex items-center justify-center text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all opacity-40 hover:opacity-100"
                                            title="Remove guardian"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {contacts.length > 0 && (
                        <motion.button 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => navigate('/dashboard')}
                            className="w-full mt-12 py-5 bg-[#f5f5f7] text-[#0a0a0c] rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 shadow-2xl hover:bg-white transition-all group"
                        >
                            Complete Intelligence Setup <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CompleteProfile;
