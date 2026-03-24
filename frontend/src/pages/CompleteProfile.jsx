import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, UserPlus, Trash2, Heart, Shield, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompleteProfile = () => {
    const [contacts, setContacts] = useState([]);
    const [formData, setFormData] = useState({ name: '', phone: '', relation: 'family' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchContacts = async () => {
        try {
            const res = await axios.get('/api/v1/users/me', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
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
            await axios.post('/api/v1/users/addEmergencyContact', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
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
            await axios.delete(`/api/v1/users/deleteEmergencyContact/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchContacts();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen theme-dark flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -ml-20 -mt-20"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[920px] grid lg:grid-cols-2 gap-12 items-start"
            >
                {/* Left Side: Form */}
                <div className="glass p-12 rounded-[48px] shadow-2xl bg-white/90 border-white/50">
                    <div className="mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                            <Heart className="text-accent" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Build your circle.</h1>
                        <p className="text-text-secondary text-lg">Define who gets alerted in an emergency.</p>
                    </div>

                    <form onSubmit={handleAddContact} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-text-secondary ml-4 uppercase">Contact Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-[#f5f5f7] border-none rounded-2xl px-6 py-4 text-[15px] focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                                placeholder="e.g. Mom, Dad, John"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-text-secondary ml-4 uppercase">Phone Number</label>
                            <div className="relative group">
                                <input 
                                    type="tel" 
                                    className="w-full bg-[#f5f5f7] border-none rounded-2xl px-12 py-4 text-[15px] focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                                    placeholder="+1 234 567 8900"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    required
                                />
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" size={18} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-text-secondary ml-4 uppercase">Relation</label>
                            <select 
                                className="w-full bg-[#f5f5f7] border-none rounded-2xl px-6 py-4 text-[15px] focus:ring-2 focus:ring-accent/20 transition-all outline-none appearance-none"
                                value={formData.relation}
                                onChange={(e) => setFormData({...formData, relation: e.target.value})}
                            >
                                <option value="family">Family</option>
                                <option value="partner">Partner</option>
                                <option value="friend">Friend</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {error && <p className="text-accent text-[12px] font-bold text-center mt-2">{error}</p>}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary w-full py-5 rounded-[24px] mt-4 flex items-center justify-center gap-2 group shadow-xl shadow-accent/20"
                        >
                            {loading ? 'Adding...' : 'Add to Circle'} <UserPlus size={18} />
                        </button>
                    </form>
                </div>

                {/* Right Side: List */}
                <div className="py-6">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-bold tracking-tight">Your Network</h2>
                        <span className="text-[13px] font-bold text-accent uppercase tracking-[2.5px]">{contacts.length} Connected</span>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence>
                            {contacts.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="p-10 border-2 border-dashed border-black/5 rounded-[40px] text-center"
                                >
                                    <Shield className="mx-auto text-text-secondary mb-4 opacity-20" size={48} />
                                    <p className="text-text-secondary font-medium">No contacts added yet.</p>
                                </motion.div>
                            ) : (
                                contacts.map((c) => (
                                    <motion.div 
                                        key={c._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="glass p-6 rounded-[32px] flex items-center justify-between border-white/50 bg-white shadow-sm"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center text-xl font-bold text-text-secondary">
                                                {c.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text">{c.name}</h4>
                                                <p className="text-sm text-text-secondary font-medium uppercase tracking-tight">{c.relation} • {c.phone}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(c._id)}
                                            className="p-3 text-text-secondary/30 hover:text-accent transition-colors"
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => navigate('/dashboard')}
                            className="w-full mt-12 btn bg-black text-white py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-2xl group"
                        >
                            Finalize Setup <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CompleteProfile;
