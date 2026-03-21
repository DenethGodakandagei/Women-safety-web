import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const RELATIONS = ['family', 'friend', 'colleague', 'partner', 'other'];

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      await api.post('/users/addEmergencyContact', form);
      flash('success', `${form.name} added successfully!`);
      setForm({ name: '', phone: '', email: '', relation: 'family' });
      setShowForm(false);
      fetchContacts();
    } catch (e) {
      flash('error', e.response?.data?.message || 'Failed to add contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from emergency contacts?`)) return;
    try {
      await api.delete(`/users/deleteEmergencyContact/${id}`);
      flash('success', `${name} removed.`);
      setContacts(prev => prev.filter(c => c._id !== id));
    } catch (e) {
      flash('error', e.response?.data?.message || 'Failed to delete.');
    }
  };

  const relationColor = (rel) => {
    const map = { family: '#e05a3a', friend: '#34a8f5', colleague: '#a855f7', partner: '#ec4899', other: '#86868b' };
    return map[rel] || '#86868b';
  };

  const s = {
    card: { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e5e5e7', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fafafa', transition: 'border 0.2s' },
    btn: (bg, color = '#fff') => ({ background: bg, color, border: 'none', borderRadius: 12, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: 'inherit' }),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.03em' }}>Emergency Contacts</h2>
          <p style={{ fontSize: 13, color: '#86868b', marginTop: 4 }}>People notified when you trigger SOS</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={s.btn(showForm ? '#f0f0f0' : '#e05a3a', showForm ? '#1d1d1f' : '#fff')}
        >
          {showForm ? '✕ Cancel' : '+ Add Contact'}
        </button>
      </div>

      {/* Alerts */}
      {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500 }}>✓ {success}</div>}
      {error   && <div style={{ background: '#fff1f0', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500 }}>⚠ {error}</div>}

      {/* Add Form */}
      {showForm && (
        <div style={s.card}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: '#1d1d1f' }}>New Emergency Contact</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#86868b', letterSpacing: '0.04em' }}>CONTACT NAME *</label>
              <input required style={s.input} placeholder="e.g. Mom" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#e05a3a'}
                onBlur={e => e.target.style.borderColor = '#e5e5e7'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#86868b', letterSpacing: '0.04em' }}>PHONE NUMBER *</label>
              <input required style={s.input} placeholder="07XXXXXXXX" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#e05a3a'}
                onBlur={e => e.target.style.borderColor = '#e5e5e7'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#86868b', letterSpacing: '0.04em' }}>EMAIL (OPTIONAL)</label>
              <input style={s.input} placeholder="email@example.com" type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#e05a3a'}
                onBlur={e => e.target.style.borderColor = '#e5e5e7'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#86868b', letterSpacing: '0.04em' }}>RELATION</label>
              <select style={{ ...s.input, cursor: 'pointer' }} value={form.relation}
                onChange={e => setForm(p => ({ ...p, relation: e.target.value }))}>
                {RELATIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button type="button" onClick={() => setShowForm(false)} style={s.btn('#f0f0f0', '#1d1d1f')}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ ...s.btn('#e05a3a'), opacity: submitting ? 0.7 : 1, minWidth: 120 }}>
                {submitting ? 'Adding…' : 'Add Contact'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contact List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#86868b' }}>Loading contacts…</div>
      ) : contacts.length === 0 ? (
        <div style={{ ...s.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>No contacts yet</p>
          <p style={{ fontSize: 14, color: '#86868b' }}>Add someone who should be notified in an emergency.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {contacts.map((c, i) => (
            <div key={c._id} style={{ ...s.card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Avatar */}
              <div style={{
                width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                background: `${relationColor(c.relation)}18`,
                border: `2px solid ${relationColor(c.relation)}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: relationColor(c.relation)
              }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1d1d1f' }}>{c.name}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                    padding: '2px 8px', borderRadius: 99,
                    background: `${relationColor(c.relation)}18`,
                    color: relationColor(c.relation)
                  }}>{c.relation?.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: 13, color: '#86868b' }}>📞 {c.phone}{c.email ? ` · ✉ ${c.email}` : ''}</p>
              </div>
              {/* Priority badge */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#f5f5f7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#86868b', flexShrink: 0
              }}>#{i + 1}</div>
              {/* Delete */}
              <button onClick={() => handleDelete(c._id, c.name)} style={{
                background: '#fff1f0', color: '#dc2626', border: '1px solid #fecaca',
                borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff1f0'}
              >Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
