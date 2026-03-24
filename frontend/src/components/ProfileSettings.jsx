import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Camera, Check, Loader2, Save, LogOut } from 'lucide-react';
import api from '../utils/api';

const ProfileSettings = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    photo: user?.photo || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        photo: user.photo || ''
      });
      setPreview(user.photo);
      setFile(null);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      if (file) formData.append('photo', file);

      const { data } = await api.patch('/users/updateMe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(true);
      onUpdate && onUpdate(data.data.user);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const labelStyle = { 
    fontSize: 11, 
    fontWeight: 700, 
    color: '#8e8e93', 
    letterSpacing: '0.1em', 
    textTransform: 'uppercase', 
    marginBottom: 10, 
    display: 'block' 
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: '16px 20px',
    color: '#f5f5f7',
    fontSize: 16,
    fontWeight: 500,
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32, padding: '20px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 500, color: '#f5f5f7', letterSpacing: '-0.04em', margin: 0 }}>Account Settings</h2>
          <p style={{ fontSize: 16, color: '#8e8e93', marginTop: 4, fontWeight: 500 }}>Manage your personal identity and security preferences.</p>
        </div>
      </div>

      <div className="responsive-grid-1-1" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: 24 }}>
        {/* Left Col: Avatar & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card-apple glass-dark" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'linear-gradient(135deg, #1c1c1e 0%, #0a0a0c 100%)', padding: 4, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                {preview ? (
                  <img src={preview} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <img src="/memoji.png" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="glass-dark" 
                style={{ position: 'absolute', bottom: 4, right: 4, width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5f5f7', cursor: 'pointer' }}
              >
                <Camera size={20} />
              </button>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 600, color: '#f5f5f7', marginBottom: 4 }}>{user?.name}</h3>
            <p style={{ fontSize: 14, color: '#30d158', fontWeight: 600, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} fill="#30d158" /> VERIFIED ACCOUNT
            </p>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', marginTop: 24, paddingTop: 24 }}>
               <button onClick={handleLogout} style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1px solid rgba(255, 59, 48, 0.2)', background: 'rgba(255, 59, 48, 0.05)', color: '#ff3b30', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: '0.3s' }}>
                <LogOut size={18} /> Sign Out Securely
               </button>
            </div>
          </div>

          <div className="card-apple glass-dark" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#8e8e93', marginBottom: 16, letterSpacing: '0.08em' }}>SECURITY HEALTH</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               {[
                 { label: '2FA Status', val: 'Active', color: '#30d158' },
                 { label: 'Encryption', val: 'AES-256', color: '#0a84ff' },
                 { label: 'Guardian Sync', val: 'Operational', color: '#30d158' }
               ].map(s => (
                 <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#d1d1d6' }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: s.color, background: `${s.color}15`, padding: '4px 8px', borderRadius: 6 }}>{s.val}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Right Col: Form */}
        <div className="card-apple glass-dark" style={{ padding: 40 }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={handleSubmit}>
            <div>
              <label style={labelStyle}>Full Display Name</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
                <input 
                  required
                  style={{ ...inputStyle, paddingLeft: 56 }} 
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Primary Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
                <input 
                  required
                  type="email"
                  style={{ ...inputStyle, paddingLeft: 56, color: '#8e8e93', cursor: 'not-allowed' }} 
                  value={form.email}
                  readOnly
                />
              </div>
              <p style={{ fontSize: 12, color: '#8e8e93', marginTop: 8 }}>Email changes require security verification via support.</p>
            </div>

            <div>
              <label style={labelStyle}>Phone Number (Alert Recipient)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
                <input 
                  required
                  type="tel"
                  style={{ ...inputStyle, paddingLeft: 56 }} 
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(255, 59, 48, 0.08)', color: '#ff3b30', fontSize: 14, fontWeight: 600, border: '1px solid rgba(255, 59, 48, 0.1)' }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium btn-premium-active" 
              style={{ 
                padding: '18px', 
                borderRadius: 18, 
                fontSize: 16, 
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                background: success ? '#30d158' : undefined
              }}
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : success ? (
                <><Check size={24} /> Changes Preserved</>
              ) : (
                <><Save size={20} /> Preserve Account Updates</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
