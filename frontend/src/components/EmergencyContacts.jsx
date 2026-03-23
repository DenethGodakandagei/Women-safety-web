import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Trash2, Edit2, Plus, AlertCircle, CheckCircle, X, Shield, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const RELATIONS = ['family', 'friend', 'colleague', 'partner', 'other'];

// ─── GUARDIAN MODAL ──────────────────────────────────────────────────────────
const GuardianModal = ({ isOpen, onClose, onSave, submitting, form, setForm, isEdit }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(129, 129, 129, 0.4)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card-apple" style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 32, width: '100%', maxWidth: 540, border: '1px solid rgba(255,255,255,0.5)', padding: 0, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '40px 40px 24px', position: 'relative' }}>
          <div className="glass-dark" style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Shield size={32} color="#007aff" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 500, color: '#1d1d1f', letterSpacing: '-0.04em', margin: 0 }}>{isEdit ? 'Update Details' : 'Add Guardian'}</h2>
          <p style={{ fontSize: 15, color: '#636366', marginTop: 6, fontWeight: 500 }}>Expand your trusted circle for instant SOS alerts.</p>
          <button onClick={onClose} style={{ position: 'absolute', top: 32, right: 32, width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSave} style={{ padding: '0 40px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <Users size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="glass-dark" style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 16, border: 'none', background: 'rgba(0,0,0,0.03)', fontSize: 16, fontWeight: 600, outline: 'none' }} placeholder="e.g. Sarah Johnson" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>🇱🇰 +94</span>
                <input required type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="glass-dark" style={{ width: '100%', padding: '16px 16px 16px 78px', borderRadius: 16, border: 'none', background: 'rgba(0,0,0,0.03)', fontSize: 16, fontWeight: 600, outline: 'none' }} placeholder="7X XXX XXXX" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Relationship</label>
              <select value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))} className="glass-dark" style={{ width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: 'rgba(0,0,0,0.03)', fontSize: 16, fontWeight: 600, outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                {RELATIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Email (Optional)</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="glass-dark" style={{ width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: 'rgba(0,0,0,0.03)', fontSize: 16, fontWeight: 600, outline: 'none' }} placeholder="guardian@example.com" />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-premium btn-premium-active" style={{ padding: '18px', borderRadius: 18, fontSize: 16, marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {submitting ? 'Processing...' : <><Users size={20} /> {isEdit ? 'Securely Update Guardian' : 'Securely Add to Circle'}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', relation: 'family' });

  const flash = (type, msg) => {
    if (type === 'success') setSuccess(msg); else setError(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/getEmergencyContacts');
      setContacts(data.data.contacts || []);
    } catch (e) {
      flash('error', e.response?.data?.message || 'Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const cleanPhone = form.phone.replace(/[\s-]/g, '').replace(/^0/, '');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : (cleanPhone ? `+94${cleanPhone}` : '');

      if (editingId) {
        await api.patch(`/users/updateEmergencyContact/${editingId}`, { ...form, phone: formattedPhone });
        flash('success', `${form.name} updated.`);
      } else {
        await api.post('/users/addEmergencyContact', { ...form, phone: formattedPhone });
        flash('success', `${form.name} added to your trusted circle.`);
      }

      setForm({ name: '', phone: '', email: '', relation: 'family' });
      setShowModal(false);
      setEditingId(null);
      fetchContacts();
    } catch (e) {
      flash('error', e.response?.data?.message || 'Failed to add contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await api.delete(`/users/deleteEmergencyContact/${id}`);
      flash('success', `${name} has been removed.`);
      setContacts(prev => prev.filter(c => c._id !== id));
    } catch (e) {
      flash('error', e.response?.data?.message || 'Failed to delete.');
    }
  };

  const openAddModal = () => {
    setForm({ name: '', phone: '', email: '', relation: 'family' });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (c) => {
    // If number starts with +94, strip it for the input which has the prefix display
    const rawPhone = c.phone.replace('+94', '');
    setForm({ name: c.name, phone: rawPhone, email: c.email || '', relation: c.relation });
    setEditingId(c._id);
    setShowModal(true);
  };

  const relationColor = (rel) => {
    const map = { family: '#ff3b30', friend: '#007aff', colleague: '#5856d6', partner: '#ff2d55', other: '#8e8e93' };
    return map[rel] || '#8e8e93';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div className="responsive-flex-column" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 36, fontWeight: 500, color: '#1d1d1f', letterSpacing: '-0.04em', margin: 0 }}>Trusted Circle</h2>
          <p style={{ fontSize: 16, color: '#636366', marginTop: 6, fontWeight: 500 }}>Individuals who will receive your real-time GPS signal in an emergency.</p>
        </div>
        <button onClick={openAddModal} className="btn-premium btn-premium-active animate-pulse-subtle" style={{ padding: '14px 28px', borderRadius: 18, fontSize: 15 }}>
          <Plus size={20} /> Add Guardian
        </button>
      </div>

      <GuardianModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingId(null); }}
        onSave={handleAdd}
        submitting={submitting}
        form={form}
        setForm={setForm}
        isEdit={!!editingId}
      />

      {/* Pop-up Alerts */}
      {(success || error) && (
        <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 1000, animation: 'float 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <div className="glass" style={{ padding: '20px 28px', borderRadius: 24, background: success ? 'rgba(52, 199, 89, 0.95)' : 'rgba(255, 59, 48, 0.95)', color: '#fff', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            {success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span style={{ fontWeight: 600, fontSize: 16 }}>{success || error}</span>
          </div>
        </div>
      )}

      {/* List Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 120, color: '#8e8e93', fontWeight: 600 }}>
          <Shield size={48} className="animate-pulse-subtle" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          Verifying network...
        </div>
      ) : contacts.length === 0 ? (
        <div className="card-apple" style={{ textAlign: 'center', padding: '120px 48px', border: 'none', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)' }}>
          <div className="glass-dark" style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)' }}>
            <Users size={56} color="#8e8e93" strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: 28, fontWeight: 500, color: '#1d1d1f', marginBottom: 12, letterSpacing: '-0.04em' }}>Your circle is empty</h3>
          <p style={{ fontSize: 17, color: '#636366', maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6 }}>Add trusted partners who will act as your live security team. They'll receive instant alerts if you trigger SOS.</p>
          <button onClick={openAddModal} className="btn-premium" style={{ padding: '14px 32px', background: '#1d1d1f', color: '#fff' }}>Enable Guard Tracking</button>
        </div>
      ) : (
        <div className="responsive-grid-1-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
          {contacts.map((c, i) => (
            <div key={c._id} className="card-apple" style={{
              display: 'flex', gap: 24, alignItems: 'center', padding: '24px',
              transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
              border: '1px solid rgba(0,0,0,0.02)',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: `linear-gradient(135deg, ${relationColor(c.relation)}, ${relationColor(c.relation)}aa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 32, fontWeight: 600, flexShrink: 0,
                boxShadow: `0 12px 32px ${relationColor(c.relation)}30`
              }}>
                {c.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h4 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: '#1d1d1f', letterSpacing: '-0.03em' }}>{c.name}</h4>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: relationColor(c.relation),
                    background: `${relationColor(c.relation)}10`, padding: '4px 10px', borderRadius: 8,
                    letterSpacing: '0.06em'
                  }}>{c.relation?.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#636366', fontSize: 14, fontWeight: 600 }}>
                    <Phone size={14} color={relationColor(c.relation)} strokeWidth={2.5} /> {c.phone}
                  </div>
                  {c.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8e8e93', fontSize: 13, fontWeight: 500 }}>
                      <Mail size={14} strokeWidth={2} /> {c.email}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#d1d1d6', opacity: 0.5 }}>ACTIVE RECIPIENT</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleEdit(c)}
                    className="glass-dark"
                    style={{
                      width: 40, height: 40, borderRadius: 14, border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#007aff', background: 'rgba(0,122,255,0.05)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(0,122,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(0,122,255,0.05)'; }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id, c.name)}
                    className="glass-dark"
                    style={{
                      width: 40, height: 40, borderRadius: 14, border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ff3b30', background: 'rgba(255,59,48,0.05)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(255,59,48,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,59,48,0.05)'; }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
