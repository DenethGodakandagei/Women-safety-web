import React, { useState, useEffect } from 'react';
import EmergencyContacts from '../components/EmergencyContacts';
import SOSTracker from '../components/SOSTracker';
import IncidentReporting from '../components/IncidentReporting';
import SafetyMap from '../components/SafetyMap';
import api from '../utils/api';

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const IconShield   = ({ size = 20, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/></svg>;
const IconHome     = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const IconContacts = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
const IconSOS      = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>;
const IconBell     = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>;
const IconSettings = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0 0 14 3h-4c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 9.27a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>;
const IconSearch   = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>;
const IconSliders  = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>;
const IconMap      = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5z"/></svg>;
const IconLock     = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="#e05a3a"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>;
const IconPin      = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="#e05a3a"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
const IconAlert    = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"/></svg>;

// ─── Nav item ─────────────────────────────────────────────────────────────────
const NavItem = ({ icon, active, onClick, badge }) => (
  <button onClick={onClick} style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#fff' : 'transparent', color: active ? '#e05a3a' : '#999', border: 'none', cursor: 'pointer', boxShadow: active ? '0 2px 12px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s ease' }}>
    {icon}
    {badge && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#e05a3a', border: '2px solid #f7f7f9' }}/>}
  </button>
);

// ─── Safety Score Ring ────────────────────────────────────────────────────────
const ScoreRing = ({ score = 92 }) => {
  const r = 38, stroke = 6, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke}/>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e05a3a" strokeWidth={stroke} strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#1d1d1f', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 8, color: '#999', fontWeight: 600, letterSpacing: '0.05em', marginTop: 2 }}>SAFETY SCORE</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, color, max = 100 }) => (
  <div style={{ background: '#f0f0f0', borderRadius: 99, height: 6, overflow: 'hidden' }}>
    <div style={{ width: `${(value/max)*100}%`, height: '100%', borderRadius: 99, background: color, transition: 'width 0.6s ease' }}/>
  </div>
);

// ─── Overview tab (original dashboard cards) ──────────────────────────────────
const OverviewTab = ({ user, contacts }) => {
  const card = { background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' };
  const badge = (color) => ({ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color, background: color + '18', padding: '3px 8px', borderRadius: 99 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ROW 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 18 }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c759', display: 'inline-block', boxShadow: '0 0 6px rgba(52,199,89,0.6)' }}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#34c759', letterSpacing: '0.06em' }}>LIVE STATUS: SECURE</span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1d1d1f', marginBottom: 8, letterSpacing: '-0.03em' }}>Your location is safe.</h2>
              <p style={{ fontSize: 14, color: '#86868b', lineHeight: 1.5 }}>We've scanned a 12 block radius in your area.<br/>No unusual activity detected in the last 4 hours.</p>
            </div>
            <ScoreRing score={92}/>
          </div>
        </div>
        <div style={{ ...card, background: 'linear-gradient(145deg, #e05a3a 0%, #c73e20 100%)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 12, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🆘</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Quick SOS</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Go to SOS tab for full controls</p>
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
        {/* Tracking */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eef4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconPin size={16}/></div>
            <span style={badge('#34a8f5')}>ACTIVE</span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>Real-time Tracking</h3>
          <p style={{ fontSize: 13, color: '#86868b', marginBottom: 14 }}>GPS monitoring active</p>
          <div style={{ background: 'linear-gradient(135deg,#e8f0e8,#c8dfc8)', borderRadius: 12, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 12 }}>🗺️</div>
          <p style={{ fontSize: 12, color: '#86868b' }}>Go to SOS tab for live map</p>
        </div>
        {/* Risk */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fff8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔥</div>
            <span style={badge('#e09a2a')}>PREDICTIVE</span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>Risk Prediction</h3>
          <p style={{ fontSize: 13, color: '#86868b', marginBottom: 20 }}>Next 2 hours forecast</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['Traffic Congestion','Low','#34c759',28],['Crowd Density','Moderate','#e09a2a',55],['Incident Reports','None','#34c759',5]].map(([label,val,color,pct]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#555' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
                </div>
                <ProgressBar value={pct} color={color}/>
              </div>
            ))}
          </div>
        </div>
        {/* Contacts summary */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#ffeef0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconShield size={16} color="#e05a3a"/></div>
            <span style={badge('#86868b')}>{contacts.length} CONTACTS</span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>Emergency Contacts</h3>
          <p style={{ fontSize: 13, color: '#86868b', marginBottom: 18 }}>{contacts.length > 0 ? 'Ready to receive SOS alerts' : 'No contacts added yet'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {contacts.slice(0, 3).map((c, i) => (
              <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e05a3a18', border: '2px solid #e05a3a30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#e05a3a', flexShrink: 0 }}>{c.name.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: '#86868b' }}>{c.phone}</p>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c759', flexShrink: 0 }}/>
              </div>
            ))}
            {contacts.length === 0 && <p style={{ fontSize: 13, color: '#86868b', textAlign: 'center', padding: '10px 0' }}>Add contacts in the Contacts tab →</p>}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: 40 }}>
          {[['TOTAL SAFE TRIPS','1,284'],['COMMUNITY ALERTS','0 Active'],['EMERGENCY CONTACTS', contacts.length || '0']].map(([label, val]) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: '#999', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.03em' }}>{val}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconLock size={14}/>
          <span style={{ fontSize: 12, color: '#86868b', fontWeight: 500 }}>Encryption: Active (AES-256)</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [tab, setTab] = useState('overview'); // overview | contacts | sos | incidents | map
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  // pick-location bridge: incident form → safety map
  const [pickMode, setPickMode]         = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/users/me');
        setUser(data.data.user);
        setContacts(data.data.user.emergencyContacts || []);
      } catch {}
    };
    fetchUser();
  }, []);

  // Tabs definition
  const tabs = [
    { id: 'overview',  label: 'Overview',   icon: <IconHome size={20}/> },
    { id: 'contacts',  label: 'Contacts',   icon: <IconContacts size={20}/>, badge: contacts.length === 0 },
    { id: 'sos',       label: 'SOS & Map',  icon: <IconSOS size={20}/> },
    { id: 'incidents', label: 'Incidents',  icon: <IconAlert size={20}/> },
    { id: 'safetymap', label: 'Safety Map', icon: <IconMap size={20}/> },
    { id: 'alerts',    label: 'Alerts',     icon: <IconBell size={20}/> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f2f2f7', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside style={{ width: 68, minHeight: '100vh', background: '#f7f7f9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8, borderRight: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e05a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, flexShrink: 0, boxShadow: '0 4px 14px rgba(224,90,58,0.4)' }}>
          <IconShield size={20} color="#fff"/>
        </div>
        {tabs.map(t => <NavItem key={t.id} icon={t.icon} active={tab === t.id} onClick={() => setTab(t.id)} badge={t.badge}/>)}
        <div style={{ flex: 1 }}/>
        <NavItem icon={<IconSettings size={20}/>} active={false} onClick={() => {}}/>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#e05a3a,#c04030)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', background: '#f2f2f7', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <p style={{ fontSize: 12, color: '#999', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 2 }}>SHESHIELD PREMIUM MEMBER</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.03em' }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}{user ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '9px 14px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <IconSearch size={16}/>
              <input placeholder="Search safety zones…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#1d1d1f', width: 180, fontFamily: 'inherit' }}/>
            </div>
            <button style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <IconSliders size={16}/>
            </button>
          </div>
        </header>

        {/* Tab pills */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 28px 0', background: '#f2f2f7' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 12, border: 'none',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
              background: tab === t.id ? '#e05a3a' : '#fff',
              color: tab === t.id ? '#fff' : '#86868b',
              boxShadow: tab === t.id ? '0 4px 14px rgba(224,90,58,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {t.icon} {t.label}
              {t.badge && <span style={{ width: 7, height: 7, borderRadius: '50%', background: tab === t.id ? '#fff' : '#e05a3a', flexShrink: 0 }}/>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>
          {tab === 'overview'  && <OverviewTab user={user} contacts={contacts}/>}
          {tab === 'contacts'  && <EmergencyContacts/>}
          {tab === 'sos'       && <SOSTracker contacts={contacts}/>}
          {tab === 'incidents' && null /* rendered below, always mounted */}
          {tab === 'safetymap' && null /* rendered below, always mounted */}
          {/* Always-mounted: preserve state when switching between incidents ↔ safety map */}
          <div style={{ display: tab === 'incidents' ? 'block' : 'none' }}>
            <IncidentReporting
              currentUserId={user?._id}
              onPickLocationMode={(active) => {
                setPickMode(active);
                if (active) setTab('safetymap');
              }}
              pickedLocation={pickedLocation}
              onPickConsumed={() => setPickedLocation(null)}
            />
          </div>
          <div style={{ display: tab === 'safetymap' ? 'block' : 'none' }}>
            <SafetyMap
              isPickMode={pickMode}
              onMapClick={(loc) => {
                if (pickMode) {
                  setPickedLocation(loc);
                  setPickMode(false);
                  setTab('incidents');
                }
              }}
            />
          </div>
          {tab === 'alerts'    && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, color: '#86868b' }}>
              <span style={{ fontSize: 48, marginBottom: 12 }}>🔔</span>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f' }}>No alerts yet</p>
              <p style={{ fontSize: 14 }}>Community safety alerts will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
