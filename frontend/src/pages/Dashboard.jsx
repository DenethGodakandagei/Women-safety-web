import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import EmergencyContacts from '../components/EmergencyContacts';
import SOSTracker from '../components/SOSTracker';
import IncidentReporting from '../components/IncidentReporting';
import SafetyMap from '../components/SafetyMap';
import RiskAnalysisCard from '../components/RiskAnalysisCard';
import api from '../utils/api';


import { 
  Shield, Home, Users, Activity, Bell, Settings, Search, 
  SlidersHorizontal, Map, Lock, MapPin, AlertTriangle, 
  Sparkles, PhoneCall, Navigation, BellOff 
} from 'lucide-react';

// ─── Nav item ─────────────────────────────────────────────────────────────────
const NavItem = ({ icon, active, onClick, badge }) => (
  <button onClick={onClick} style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#fff' : 'transparent', color: active ? '#e05a3a' : '#999', border: 'none', cursor: 'pointer', boxShadow: active ? '0 2px 12px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s ease' }}>
    {icon}
    {badge && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#e05a3a', border: '2px solid #f7f7f9' }} />}
  </button>
);

// ─── Safety Score Ring ────────────────────────────────────────────────────────
const ScoreRing = ({ score = 92 }) => {
  const r = 38, stroke = 6, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e05a3a" strokeWidth={stroke} strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" />
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
    <div style={{ width: `${(value / max) * 100}%`, height: '100%', borderRadius: 99, background: color, transition: 'width 0.6s ease' }} />
  </div>
);

// ─── Overview tab (original dashboard cards) ──────────────────────────────────
const OverviewTab = ({ user, contacts, userLocation, stats }) => {
  const card = { background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' };
  const badge = (color) => ({ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color, background: color + '18', padding: '3px 8px', borderRadius: 99 });

  const isSafe = stats.riskLevel === 'Safe' || stats.riskLevel === 'Low';
  const statusColor = isSafe ? '#34c759' : stats.riskLevel === 'Moderate' ? '#f59e0b' : '#ef4444';


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ROW 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 18 }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block', boxShadow: `0 0 6px ${statusColor}60` }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, letterSpacing: '0.06em' }}>LIVE STATUS: {stats.riskLevel.toUpperCase()}</span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1d1d1f', marginBottom: 8, letterSpacing: '-0.03em' }}>Your area is {stats.riskLevel.toLowerCase()}.</h2>
              <p style={{ fontSize: 14, color: '#86868b', lineHeight: 1.5 }}>Analysis based on your current coordinates.<br />{stats.activeAlerts} active reports nearby.</p>
            </div>
            <ScoreRing score={stats.safetyScore} />
          </div>

        </div>
        <div style={{ ...card, background: 'linear-gradient(145deg, #e05a3a 0%, #c73e20 100%)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 12, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhoneCall size={24} color="#fff" />
          </div>
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
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eef4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="#34a8f5" /></div>
            <span style={badge('#34a8f5')}>ACTIVE</span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>Real-time Tracking</h3>
          <p style={{ fontSize: 13, color: '#86868b', marginBottom: 14 }}>GPS monitoring active</p>
          <div style={{ background: '#f8f9fa', borderRadius: 12, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12, overflow: 'hidden', border: '1px solid #f0f0f2', position: 'relative' }}>
            {userLocation ? (
              <>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.3, background: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #e5e7eb 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #e5e7eb 20px)' }} />
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34a8f5', margin: '0 auto 6px', boxShadow: '0 0 0 4px rgba(52,168,245,0.2)', animation: 'pulse 1.5s infinite' }} />
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#555', margin: 0 }}>LIVE: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
                </div>
                <style>{`@keyframes pulse { 0% { transform: scale(0.95); opacity: 0.9; } 70% { transform: scale(1.1); opacity: 0.3; } 100% { transform: scale(0.95); opacity: 0.9; } }`}</style>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Navigation size={18} className="animate-pulse" color="#999" />
                <p style={{ fontSize: 13, color: '#999', margin: 0 }}>Resolving GPS...</p>
              </div>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#86868b' }}>Precision: 10 meters</p>
        </div>
        {/* Risk */}
        <div style={{ ...card, padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <RiskAnalysisCard lat={userLocation?.lat} lng={userLocation?.lng} />
        </div>

        {/* Contacts summary */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#ffeef0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={16} color="#e05a3a" /></div>
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
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c759', flexShrink: 0 }} />
              </div>
            ))}
            {contacts.length === 0 && <p style={{ fontSize: 13, color: '#86868b', textAlign: 'center', padding: '10px 0' }}>Add contacts in the Contacts tab →</p>}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: 40 }}>
          {[['TOTAL REPORTS', stats.totalReports], ['COMMUNITY ALERTS', stats.activeAlerts + ' Active'], ['CONTACTS', contacts.length || '0']].map(([label, val]) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: '#999', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.03em' }}>{val}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={14} color="#e05a3a" />
          <span style={{ fontSize: 12, color: '#86868b', fontWeight: 500 }}>Encryption: Active (AES-256)</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentTab = pathname.split('/').pop() || 'overview';

  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, activeAlerts: 0, safetyScore: 92, riskLevel: 'Safe' });

  // pick-location bridge: incident form → safety map
  const [pickMode, setPickMode] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);



  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, (err) => console.error(err), { enableHighAccuracy: true });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/users/me');
        setUser(data.data.user);
        setContacts(data.data.user.emergencyContacts || []);
      } catch { }
    };
    fetchUser();
  }, []);

  const fetchGlobalStats = async (loc) => {
    try {
      // 1. Get incidents count
      const { data: incData } = await api.get('/incidents');
      const active = incData.data.incidents.filter(i => i.status === 'active').length;

      // 2. Get local risk for safety score
      let score = 92;
      let level = 'Safe';
      if (loc) {
        const { data: riskData } = await api.get('/risk/predict', { params: { lat: loc.lat, lng: loc.lng } });
        score = 100 - (riskData.data.riskAnalysis?.riskScore || 0);
        level = riskData.data.riskAnalysis?.riskLevel || 'Safe';
      }

      setStats({
        totalReports: incData.data.incidents.length,
        activeAlerts: active,
        safetyScore: score,
        riskLevel: level
      });
    } catch { }
  };

  useEffect(() => {
    if (userLocation) fetchGlobalStats(userLocation);
  }, [userLocation]);


  // Tabs definition
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Home size={20} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={20} />, badge: contacts.length === 0 },
    { id: 'sos', label: 'SOS & Map', icon: <Activity size={20} /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle size={20} /> },
    { id: 'safetymap', label: 'Safety Map', icon: <Map size={20} /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f2f2f7', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside style={{ width: 68, minHeight: '100vh', background: '#f7f7f9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8, borderRight: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e05a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, flexShrink: 0, boxShadow: '0 4px 14px rgba(224,90,58,0.4)' }}>
          <Shield size={20} color="#fff" />
        </div>
        {tabs.map(t => <NavItem key={t.id} icon={t.icon} active={currentTab === t.id} onClick={() => navigate(`/dashboard/${t.id}`)} badge={t.badge} />)}
        <div style={{ flex: 1 }} />

        <NavItem icon={<Settings size={20} />} active={false} onClick={() => { }} />
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
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}{user ? `, ${user.name.split(' ')[0]}` : ''}
              <Sparkles size={22} color="#f59e0b" fill="#f59e0b20" />
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '9px 14px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <Search size={16} color="#999" />
              <input placeholder="Search safety zones…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#1d1d1f', width: 180, fontFamily: 'inherit' }} />
            </div>
            <button style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <SlidersHorizontal size={16} color="#555" />
            </button>
          </div>
        </header>

        {/* Tab pills */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 28px 0', background: '#f2f2f7' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => navigate(`/dashboard/${t.id}`)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 12, border: 'none',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
              background: currentTab === t.id ? '#e05a3a' : '#fff',
              color: currentTab === t.id ? '#fff' : '#86868b',
              boxShadow: currentTab === t.id ? '0 4px 14px rgba(224,90,58,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {t.icon} {t.label}
              {t.badge && <span style={{ width: 7, height: 7, borderRadius: '50%', background: currentTab === t.id ? '#fff' : '#e05a3a', flexShrink: 0 }} />}
            </button>
          ))}
        </div>


        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>
          <Routes>
            <Route path="overview" element={<OverviewTab user={user} contacts={contacts} userLocation={userLocation} stats={stats} />} />
            <Route path="contacts" element={<EmergencyContacts />} />

            <Route path="sos" element={<SOSTracker contacts={contacts} />} />
            <Route path="incidents" element={
              <IncidentReporting
                currentUserId={user?._id}
                onPickLocationMode={(active) => {
                  setPickMode(active);
                  if (active) navigate('/dashboard/safetymap');
                }}
                pickedLocation={pickedLocation}
                onPickConsumed={() => setPickedLocation(null)}
              />
            } />
            <Route path="safetymap" element={
              <SafetyMap
                isPickMode={pickMode}
                onMapClick={(loc) => {
                  if (pickMode) {
                    setPickedLocation(loc);
                    setPickMode(false);
                    navigate('/dashboard/incidents');
                  }
                }}
              />
            } />
            <Route path="alerts" element={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, color: '#86868b' }}>
                <div style={{ background: '#f5f5f7', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <BellOff size={40} color="#86868b" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f' }}>No alerts yet</p>
                <p style={{ fontSize: 14 }}>Community safety alerts will appear here.</p>
              </div>
            } />
            {/* Fallback to Overview */}
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;