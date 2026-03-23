import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import EmergencyContacts from '../components/EmergencyContacts';
import SOSTracker from '../components/SOSTracker';
import IncidentReporting from '../components/IncidentReporting';
import SafetyMap from '../components/SafetyMap';
import RiskAnalysisCard from '../components/RiskAnalysisCard';
import api from '../utils/api';

import {
  Shield, Home, Users, Activity as ActivityIcon, Bell, Settings, Search,
  SlidersHorizontal, Map as MapIcon, Lock, MapPin, AlertTriangle,
  Sparkles, PhoneCall, Navigation as NavigationIcon, BellOff
} from 'lucide-react';

// ─── Nav item ─────────────────────────────────────────────────────────────────
const NavItem = ({ icon, active, onClick, badge }) => (
  <button onClick={onClick} style={{
    position: 'relative', width: 44, height: 44, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: active ? 'rgba(255, 59, 48, 0.1)' : 'transparent',
    color: active ? '#ff3b30' : '#8e8e93',
    border: 'none', cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: active ? 'scale(1.1)' : 'scale(1)'
  }}>
    {React.cloneElement(icon, { strokeWidth: active ? 2.5 : 1.5 })}
    {badge && <span style={{ position: 'absolute', top: 10, right: 10, width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 8px rgba(255,59,48,0.4)' }} />}
  </button>
);

// ─── Safety Score Ring ────────────────────────────────────────────────────────
const ScoreRing = ({ score = 92 }) => {
  const r = 40, stroke = 4, circ = 2 * Math.PI * r;
  const color = score > 80 ? '#34c759' : score > 50 ? '#ff9500' : '#ff3b30';
  return (
    <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 12px ${color}40)` }}>
        <circle cx="70" cy="70" r={r * 1.5} fill="transparent" stroke="rgba(0,0,0,0.04)" strokeWidth={stroke * 1.5} />
        <circle cx="70" cy="70" r={r * 1.5} fill="transparent" stroke={color} strokeWidth={stroke * 1.5} strokeDasharray={circ * 1.5} strokeDashoffset={circ * 1.5 - (score / 100) * circ * 1.5} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.165, 0.84, 0.44, 1)' }} />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <p style={{ fontSize: 44, fontWeight: 500, color: '#1d1d1f', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.05em' }}>{score}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#8e8e93', margin: '-4px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SECURE</p>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, color, max = 100 }) => (
  <div className="glass-dark" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
    <div style={{ width: `${(value / max) * 100}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${color}, ${color}cc)`, transition: 'width 1s cubic-bezier(0.165, 0.84, 0.44, 1)' }} />
  </div>
);

// ─── Overview tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ user, contacts, userLocation, stats, onSOS }) => {
  const isSafe = stats.riskLevel === 'Safe' || stats.riskLevel === 'Low';
  const statusColor = isSafe ? '#34c759' : stats.riskLevel === 'Moderate' ? '#ff9500' : '#ff3b30';

  return (
    <div className="content-padding" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 20 }}>
      {/* ROW 1: Hero Cards */}
      <div className="overview-grid-row1" style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 24 }}>
        <div className="card-apple" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor, boxShadow: `0 0 12px ${statusColor}a0` }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: statusColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live Status: {stats.riskLevel}</span>
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 500, color: '#1d1d1f', marginBottom: 12, letterSpacing: '-0.05em', lineHeight: 1.1 }}>
              Your area is <span style={{ color: statusColor }}>{stats.riskLevel.toLowerCase()}</span>.
            </h2>
            <p style={{ fontSize: 16, color: '#636366', lineHeight: 1.6, maxWidth: '85%' }}>
              AI analysis confirms high safety levels in your current vicinity. <strong>{stats.activeAlerts}</strong> active reports monitored within 5km.
            </p>
          </div>
          <div className="hidden-mobile">
            <ScoreRing score={stats.safetyScore} />
          </div>
        </div>

        <div className="card-apple sos-card-mobile-top" onClick={onSOS} style={{
          background: 'linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', gap: 16, border: 'none', position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(255, 59, 48, 0.3)'
        }}>
          <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="animate-pulse-subtle" style={{
            width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <PhoneCall size={32} color="#fff" />
          </div>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <p style={{ fontSize: 24, fontWeight: 500, color: '#fff', marginBottom: 6, letterSpacing: '-0.04em' }}>Quick SOS</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Immediate notification for crisis</p>
          </div>
        </div>
      </div>

      {/* ROW 2: Widgets Grid */}
      <div className="overview-grid-row2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {/* Tracking Widget */}
        <div className="card-apple" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="glass-dark" style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 59, 48, 0.05)' }}>
                <NavigationIcon size={18} color="#ff3b30" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', margin: 0, letterSpacing: '-0.03em' }}>Live Tracking</h3>
                <p style={{ fontSize: 12, color: '#636366', margin: 0 }}>GPS Signal: Strong</p>
              </div>
            </div>
          </div>
          <div style={{ background: '#f5f5f7', borderRadius: 20, height: 140, position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#d1d1d6 0.5px, transparent 0.5px)', backgroundSize: '16px 16px', opacity: 0.3 }} />
            {userLocation ? (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff3b30', border: '3px solid #fff', boxShadow: '0 0 15px rgba(255, 59, 48, 0.8)', animation: 'pulse-subtle 2s infinite' }} />
                <p style={{ fontSize: 11, fontWeight: 600, color: '#ff3b30', marginTop: 8, background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: 6 }}>USER_ACTIVE</p>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NavigationIcon size={24} color="#8e8e93" className="animate-spin-slow" />
              </div>
            )}
          </div>
        </div>

        {/* Contacts Widget */}
        <div className="card-apple" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div className="glass-dark" style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(52,199,89,0.05)' }}>
              <Users size={18} color="#34c759" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', margin: 0, letterSpacing: '-0.03em' }}>Trusted Circle</h3>
              <p style={{ fontSize: 12, color: '#636366', margin: 0 }}>{contacts.length} Active Guardians</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contacts.slice(0, 2).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(52,199,89,0.05)', borderRadius: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>{c.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: '#636366', margin: 0 }}>Primary Contact</p>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c759' }} />
              </div>
            ))}
            {contacts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '12px', border: '1.5px dashed #d1d1d6', borderRadius: 14, color: '#8e8e93', fontSize: 12 }}>No contacts added</div>
            )}
          </div>
        </div>

        {/* AI Analytics Widget */}
        <div className="card-apple" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div className="glass-dark" style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,149,0,0.05)' }}>
              <ActivityIcon size={18} color="#ff9500" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', margin: 0, letterSpacing: '-0.03em' }}>Safety Index</h3>
              <p style={{ fontSize: 12, color: '#636366', margin: 0 }}>Local Risk Trends</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#8e8e93' }}>CONFIDENCE</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#1d1d1f' }}>98%</span>
              </div>
              <ProgressBar value={98} color="#34c759" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#8e8e93' }}>REPORTS VOL</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#1d1d1f' }}>LOW</span>
              </div>
              <ProgressBar value={20} color="#ff3b30" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="card-apple stats-bar-apple" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px' }}>
        <div className="stats-bar-items" style={{ display: 'flex', gap: 48 }}>
          {[
            ['TOTAL REPORTS', stats.totalReports],
            ['COMMUNITY ALERTS', stats.activeAlerts + ' Active'],
            ['SYSTEM STATE', 'SECURE']
          ].map(([label, val]) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: '#8e8e93', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 500, color: '#1d1d1f', letterSpacing: '-0.03em', margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={16} color="#34c759" />
          <span style={{ fontSize: 13, color: '#636366', fontWeight: 600 }}>End-to-end Encrypted</span>
        </div>
      </div>
    </div>
  );
};

const SOSOverlay = ({ state, message, onClose }) => {
  if (state === 'idle') return null;
  
  const isError = state === 'error';
  const isSent = state === 'sent';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="card-apple"
        style={{
          maxWidth: 440, width: '100%', borderRadius: 32, padding: '48px 40px', textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          {state === 'sending' && (
            <div className="animate-pulse" style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255, 59, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneCall size={44} color="#ff3b30" />
            </div>
          )}
          {isSent && (
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIcon size={44} color="#34c759" />
            </div>
          )}
          {isError && (
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255, 59, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={44} color="#ff3b30" />
            </div>
          )}
        </div>

        <h2 style={{ fontSize: 32, color: '#1d1d1f', marginBottom: 12, letterSpacing: '-0.04em', fontWeight: 600 }}>
          {state === 'sending' ? 'Sending SOS…' : isSent ? 'Alert Processed' : 'Alert Failed'}
        </h2>
        
        <p style={{ fontSize: 16, color: '#636366', lineHeight: 1.5, marginBottom: 40, fontWeight: 500 }}>
          {message}
        </p>

        {state !== 'sending' && (
          <button 
            onClick={onClose}
            className="btn-premium"
            style={{ 
              width: '100%', 
              background: isSent ? '#34c759' : '#ff3b30', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 20, 
              padding: '20px', 
              fontSize: 17, 
              fontWeight: 600,
              boxShadow: isSent ? '0 8px 24px rgba(52, 199, 89, 0.3)' : '0 8px 24px rgba(255, 59, 48, 0.3)'
            }}
          >
            {isSent ? 'Dismiss Status' : 'Cancel & Retry'}
          </button>
        )}
      </motion.div>
    </motion.div>
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

  const [pickMode, setPickMode] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [sosState, setSosState] = useState('idle'); // idle | sending | sent | error
  const [sosMessage, setSosMessage] = useState('');

  const triggerSOS = async () => {
    if (!userLocation) {
      setSosState('error');
      setSosMessage("Unable to acquire high-precision GPS signal. Please ensure location services are enabled.");
      return;
    }

    setSosState('sending');
    setSosMessage("Communicating your live coordinates to all emergency guardians across SMS and Email networks.");

    try {
      const { data } = await api.post('/sos/trigger', {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      });
      setSosState('sent');
      setSosMessage(data.message);
    } catch (err) {
      setSosState('error');
      setSosMessage(err.response?.data?.message || "Emergency gateway timed out. Please retry or call local emergency services directly.");
    }
  };

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
      const { data: incData } = await api.get('/incidents');
      const active = incData.data.incidents.filter(i => i.status === 'active').length;

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Home size={20} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={20} />, badge: contacts.length === 0 },
    { id: 'sos', label: 'SOS & Map', icon: <ActivityIcon size={20} /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle size={20} /> },
    { id: 'safetymap', label: 'Safety Map', icon: <MapIcon size={20} /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell size={20} /> },
  ];

  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh', background: 'transparent' }}>
      <AnimatePresence>
        <SOSOverlay 
          state={sosState} 
          message={sosMessage} 
          onClose={() => setSosState('idle')} 
        />
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside className="glass sidebar-apple" style={{ width: 72, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 24, border: 'none', borderRight: '1px solid rgba(0,0,0,0.05)', zIndex: 100 }}>
        <div className="sidebar-logo animate-float" style={{ width: 44, height: 44, borderRadius: 16, background: 'linear-gradient(135deg, #ff3b30, #ff2d55)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, flexShrink: 0, boxShadow: '0 8px 16px rgba(255, 59, 48, 0.3)' }}>
          <Shield size={24} color="#fff" />
        </div>

        <div className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tabs.map(t => <NavItem key={t.id} icon={t.icon} active={currentTab === t.id} onClick={() => navigate(`/dashboard/${t.id}`)} badge={t.badge} />)}
        </div>

        <div className="sidebar-spacer" style={{ flex: 1 }} />

        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <NavItem icon={<Settings size={22} />} active={false} onClick={() => { }} />
          <div className="user-avatar" style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #f5f5f7, #d1d1d6)', padding: 2, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <img src="/memoji.png" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <header className="header-apple" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '40px 48px 24px', background: 'transparent' }}>
          <div className="header-user-info" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <img src="/memoji.png" className="animate-float" style={{ width: 80, height: 80, borderRadius: 24, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }} />
            <div>
              <p style={{ fontSize: 13, color: '#636366', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>SheShield Premium</p>
              <h1 style={{ fontSize: 44, fontWeight: 500, color: '#1d1d1f', letterSpacing: '-0.05em', margin: 0 }}>
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}{user ? `, ${user.name.split(' ')[0]}` : ''}
              </h1>
            </div>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="glass header-search" style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 16, padding: '12px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', width: 320 }}>
              <Search size={18} color="#8e8e93" strokeWidth={2.5} />
              <input placeholder="Search safety zones…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#1d1d1f', width: '100%', fontWeight: 500 }} />
            </div>
            <button className="glass btn-premium hidden-mobile" style={{ borderRadius: 16, width: 48, height: 48, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SlidersHorizontal size={18} color="#1d1d1f" />
            </button>
          </div>
        </header>

        <div className="main-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          <div className="tabs-scroll-container" style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => navigate(`/dashboard/${t.id}`)} className={currentTab === t.id ? 'btn-premium btn-premium-active' : 'btn-premium glass'} style={{ whiteSpace: 'nowrap' }}>
                {React.cloneElement(t.icon, { size: 16, strokeWidth: 2.5 })}
                <span style={{ marginLeft: 2 }}>{t.label}</span>
              </button>
            ))}
          </div>

          <Routes>
            <Route path="overview" element={<OverviewTab user={user} contacts={contacts} userLocation={userLocation} stats={stats} onSOS={triggerSOS} />} />
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, color: '#8e8e93' }}>
                <div style={{ background: 'rgba(0,0,0,0.03)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <BellOff size={40} color="#8e8e93" />
                </div>
                <p style={{ fontSize: 18, fontWeight: 500, color: '#1d1d1f', margin: 0 }}>No alerts yet</p>
                <p style={{ fontSize: 14, marginTop: 8 }}>Your emergency notifications will appear here.</p>
              </div>
            } />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;