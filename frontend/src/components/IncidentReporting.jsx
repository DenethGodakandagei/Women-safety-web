import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit2, Trash2, MapPin, Filter, ThumbsUp, CheckCircle, X, 
  Search, Siren, Banknote, Eye, AlertTriangle, Moon, 
  Map as MapIcon, Loader2, Save, Frown, AlertCircle, Navigation as NavigationIcon
} from 'lucide-react';
import api from '../utils/api';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const loadGoogleMaps = () =>
  new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google.maps);
    const existing = document.getElementById('gmap-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      return;
    }
    const script = document.createElement('script');
    script.id = 'gmap-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });

// ─── Config ───────────────────────────────────────────────────────────────────
const INCIDENT_TYPES = [
  { value: 'harassment',          label: 'Harassment',           icon: <AlertCircle size={14}/>, color: '#f97316' },
  { value: 'assault',             label: 'Assault',              icon: <Siren size={14}/>,              color: '#ef4444' },
  { value: 'theft',               label: 'Theft',                icon: <Banknote size={14}/>,           color: '#eab308' },
  { value: 'stalking',            label: 'Stalking',             icon: <Eye size={14}/>,                color: '#8b5cf6' },
  { value: 'unsafe_area',         label: 'Unsafe Area',          icon: <AlertTriangle size={14}/>,      color: '#f43f5e' },
  { value: 'poor_lighting',       label: 'Poor Lighting',        icon: <Moon size={14}/>,               color: '#64748b' },
  { value: 'suspicious_activity', label: 'Suspicious Activity',  icon: <Search size={14}/>,             color: '#0ea5e9' },
  { value: 'other',               label: 'Other',                icon: <MapPin size={14}/>,             color: '#6b7280' },
];

const SEVERITY_LEVELS = [
  { value: 'low',      label: 'Low',      color: '#22c55e', bg: '#f0fdf4' },
  { value: 'medium',   label: 'Medium',   color: '#f59e0b', bg: '#fffbeb' },
  { value: 'high',     label: 'High',     color: '#f97316', bg: '#fff7ed' },
  { value: 'critical', label: 'Critical', color: '#ef4444', bg: '#fef2f2' },
];

const typeInfo = (val) => INCIDENT_TYPES.find(t => t.value === val) || INCIDENT_TYPES[7];
const sevInfo  = (val) => SEVERITY_LEVELS.find(s => s.value === val) || SEVERITY_LEVELS[1];

// Using Lucide icons directly in components

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <div className="card-apple glass-dark" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 48px', textAlign: 'center', gap: 28, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)' }}>
    <div className="glass-dark" style={{ width: 120, height: 120, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 69, 58, 0.15)' }}>
      <MapPin size={56} color="#ff453a" className="animate-float" strokeWidth={1.5} />
    </div>
    <div style={{ maxWidth: 360 }}>
      <h3 style={{ fontSize: 28, fontWeight: 500, color: '#f5f5f7', margin: '0 0 12px', letterSpacing: '-0.04em' }}>Community Safety</h3>
      <p style={{ fontSize: 17, color: '#8e8e93', margin: 0, fontWeight: 500, lineHeight: 1.6 }}>Help your neighborhood stay informed by reporting local danger zones or safety hazards.</p>
    </div>
    <button onClick={onAdd} className="btn-premium btn-premium-active animate-pulse-subtle" style={{ padding: '16px 40px', fontSize: 16 }}>
      <Plus size={20}/> Report New Incident
    </button>
  </div>
);

// ─── INCIDENT CARD ─────────────────────────────────────────────────────────────
const IncidentCard = ({ incident, currentUserId, onEdit, onDelete, onUpvote }) => {
  const t = typeInfo(incident.type);
  const s = sevInfo(incident.severity);
  const isOwner = incident.isOwner;
  const upvoted = incident.upvotedBy?.includes(currentUserId);

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div className="card-apple glass-dark group" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      padding: '20px',
      transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: `${t.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.color}15`, flexShrink: 0 }}>
             <span style={{ color: t.color }}>{React.cloneElement(t.icon, { size: 22, strokeWidth: 2.5 })}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
               <span style={{ fontSize: 9, fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', background: `${s.color}15`, padding: '3px 10px', borderRadius: 8 }}>{s.label} Severity</span>
               {incident.status === 'resolved' && (
                 <span style={{ fontSize: 9, fontWeight: 800, color: '#30d158', background: 'rgba(48,209,88,0.15)', padding: '3px 10px', borderRadius: 8 }}>RESOLVED</span>
               )}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f7', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.2, wordBreak: 'break-word' }}>{incident.title}</h3>
          </div>
        </div>
        
        {isOwner && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(incident._id); }} 
            className="hover-scale" 
            style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: 'rgba(255, 59, 48, 0.08)', color: '#ff3b30', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0 }}
          >
            <Trash2 size={14}/>
          </button>
        )}
      </div>

      <p style={{ fontSize: 14, color: '#48484a', lineHeight: 1.5, margin: 0, fontWeight: 500, flex: 1, letterSpacing: '-0.01em' }}>{incident.description}</p>

      {incident.location?.address && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>
          <MapPin size={14} color={s.color} style={{ marginTop: 2, flexShrink: 0 }} /> 
          <span style={{ lineHeight: 1.4 }}>{incident.location.address}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1c1c1e, #2c2c2e)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#f5f5f7', flexShrink: 0 }}>
            {incident.reportedBy?.name?.[0] || 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, color: '#f5f5f7', fontWeight: 600 }}>{incident.anonymous ? 'Anonymous' : incident.reportedBy?.name}</span>
            <span style={{ fontSize: 11, color: '#8e8e93', fontWeight: 500 }}>{timeAgo(incident.createdAt)}</span>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onUpvote(incident._id); }} 
          className={upvoted ? 'btn-premium-active' : 'btn-premium'}
          style={{ padding: '0 14px', fontSize: 12, borderRadius: 12, height: 36, gap: 8, transition: 'all 0.3s' }}
        >
          <ThumbsUp size={16} fill={upvoted ? 'currentColor' : 'none'} strokeWidth={2.5} /> 
          <span style={{ fontWeight: 800 }}>{incident.upvotes || 0}</span>
        </button>
      </div>
    </div>
  );
};

// ─── MAP PICKER COMPONENT ─────────────────────────────────────────────────────
const InlineMapPicker = ({ onPick, onCancel }) => {
  const mapRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let map;
    const init = async () => {
      try {
        const mapsApi = await loadGoogleMaps();
        setLoading(false);
        if (!mapRef.current) return;
        
        map = new mapsApi.Map(mapRef.current, {
          center: { lat: 6.9271, lng: 79.8612 }, 
          zoom: 13,
          disableDefaultUI: false,
          draggableCursor: 'crosshair',
          mapTypeControl: false,
          streetViewControl: false
        });

        map.addListener('click', (e) => {
          onPick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.setCenter(loc);
            map.setZoom(15);
          }, () => {});
        }
      } catch (err) { console.error(err); }
    };
    init();
  }, [onPick]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 440, borderRadius: 20, overflow: 'hidden', background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.05)' }}>
      {loading && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', zIndex: 2, fontWeight: 600, color: '#8e8e93' }}>Loading Security Map...</div>}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 16, left: 16, right: 16, pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(0,122,255,0.95)', color: '#fff', padding: '10px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,122,255,0.3)', backdropFilter: 'blur(10px)' }}>
          TAP ANYWHERE TO PIN INCIDENT
        </div>
      </div>
      <button 
        type="button"
        onClick={onCancel} 
        style={{ position: 'absolute', bottom: 16, right: 16, padding: '12px 24px', borderRadius: 14, background: '#fff', border: 'none', fontWeight: 700, fontSize: 13, color: '#ff3b30', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        Cancel
      </button>
    </div>
  );
};

// ─── FORM MODAL ───────────────────────────────────────────────────────────────
const IncidentForm = ({ incident, draft, pickedCoords, onClose, onSave, onPickLocation }) => {
  const isEdit = !!incident?._id;

  // Build initial state: prefer saved draft (after map-pick), then incident (edit), then blanks
  const buildInitial = () => {
    const base = draft || (incident ? {
      title: incident.title || '',
      description: incident.description || '',
      type: incident.type || 'other',
      severity: incident.severity || 'medium',
      anonymous: incident.anonymous || false,
      status: incident.status || 'active',
      location: { lat: incident.location?.lat || '', lng: incident.location?.lng || '', address: incident.location?.address || '' },
    } : { title: '', description: '', type: 'other', severity: 'medium', anonymous: false, status: 'active', location: { lat: '', lng: '', address: '' } });

    // Overlay picked coords on top of whatever base we have
    if (pickedCoords?.lat != null) {
      return { ...base, location: { ...base.location, lat: pickedCoords.lat, lng: pickedCoords.lng } };
    }
    return base;
  };

  const [form, setForm]             = useState(buildInitial);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [isPicking, setIsPicking]   = useState(false);

  const updateField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setLoc      = (key, val) => setForm(f => ({ ...f, location: { ...f.location, [key]: val } }));

  // If pickedCoords arrive while form is already open (edge case guard)
  useEffect(() => {
    if (pickedCoords?.lat != null) {
      setForm(f => ({ ...f, location: { ...f.location, lat: pickedCoords.lat, lng: pickedCoords.lng } }));
    }
  }, [pickedCoords]);

  const useMyLocation = () => {
    setLocLoading(true);
    setError('');
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setLoc('lat', pos.coords.latitude);
        setLoc('lng', pos.coords.longitude);
        setLocLoading(false);
      },
      () => { setError('GPS access denied.'); setLocLoading(false); }
    );
  };

  const handeInlinePick = (coords) => {
    setForm(f => ({ ...f, location: { ...f.location, lat: coords.lat, lng: coords.lng } }));
    setIsPicking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPicking) return;
    setError('');
    if (!form.location.lat || !form.location.lng) {
      setError('Coordinates required. Use GPS or Pick on Map.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        location: {
          lat: parseFloat(form.location.lat),
          lng: parseFloat(form.location.lng),
          address: form.location.address,
        },
      };
      if (isEdit) {
        await api.patch(`/incidents/${incident._id}`, payload);
      } else {
        await api.post('/incidents', payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save report.');
    } finally {
      setLoading(false);
    }
  };

  const inp = { 
    width: '100%', 
    padding: '16px 20px', 
    borderRadius: 16, 
    border: 'none', 
    fontSize: 15, 
    fontFamily: 'inherit', 
    outline: 'none', 
    boxSizing: 'border-box', 
    background: 'rgba(255,255,255,0.05)', 
    color: '#f5f5f7',
    fontWeight: 500,
    transition: 'all 0.2s',
    border: '1px solid rgba(255,255,255,0.1)'
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card-apple glass-dark" style={{ background: 'rgba(28,28,30,0.95)', borderRadius: 32, width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', padding: 0, boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 32px 24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="glass-dark" style={{ width: 56, height: 56, borderRadius: 20, background: isEdit ? 'rgba(255,255,255,0.05)' : 'rgba(213, 50, 42, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isEdit ? <Edit2 size={24} color="#f5f5f7" /> : <Siren size={24} color="#d5322a" />}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 500, color: '#f5f5f7', margin: '0', letterSpacing: '-0.04em' }}>{isEdit ? 'Update Details' : 'Report Incident'}</h2>
              <p style={{ fontSize: 13, color: '#8e8e93', margin: '4px 0 0', fontWeight: 500 }}>Help other citizens stay safe.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 32, right: 32, width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5f5f7' }}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(213, 50, 42, 0.08)', color: '#d5322a', fontSize: 14, fontWeight: 600, border: '1px solid rgba(213, 50, 42, 0.1)', display: 'flex', alignItems: 'center', gap: 10 }}><AlertCircle size={18} /> {error}</div>}

          {/* Title */}
          <div>
            <label style={labelStyle}>Incident Title</label>
            <input value={form.title} onChange={e => updateField('title', e.target.value)} style={inp} placeholder="e.g. Broken streetlight, Heavy harassment zone..." required maxLength={120}/>
          </div>

          <div className="responsive-grid-modal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.type} onChange={e => updateField('type', e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
                {INCIDENT_TYPES.map(t => <option key={t.value} value={t.value} style={{ background: '#1c1c1e' }}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Severity Level</label>
              <select value={form.severity} onChange={e => updateField('severity', e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
                {SEVERITY_LEVELS.map(s => <option key={s.value} value={s.value} style={{ background: '#1c1c1e' }}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Detailed Description</label>
            <textarea value={form.description} onChange={e => updateField('description', e.target.value)} style={{ ...inp, minHeight: 120, resize: 'none' }} placeholder="Share more context..." required maxLength={1000}/>
          </div>

          <div style={{ display: isPicking ? 'none' : 'block' }}>
            <label style={labelStyle}>Location Coordinates</label>
            <div className="responsive-grid-modal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <input type="number" step="any" value={form.location.lat} onChange={e => setLoc('lat', e.target.value)} style={inp} placeholder="Latitude" required/>
              <input type="number" step="any" value={form.location.lng} onChange={e => setLoc('lng', e.target.value)} style={inp} placeholder="Longitude" required/>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button type="button" onClick={useMyLocation} disabled={locLoading} className="btn-premium glass-dark full-width-mobile" style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#f5f5f7', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                {locLoading ? <Loader2 size={18} className="animate-spin" /> : <><NavigationIcon size={18} /> GPS</>}
              </button>
              <button type="button" onClick={() => setIsPicking(true)} className="btn-premium btn-premium-active full-width-mobile" style={{ flex: 1, padding: '14px', borderRadius: 16 }}>
                <MapIcon size={18} /> Pick on Map
              </button>
            </div>
          </div>

          {isPicking && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <label style={labelStyle}>Select Point on Map</label>
              <InlineMapPicker onPick={handeInlinePick} onCancel={() => setIsPicking(false)} />
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', fontSize: 15, color: '#f5f5f7', fontWeight: 600, padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
            <input type="checkbox" checked={form.anonymous} onChange={e => updateField('anonymous', e.target.checked)} style={{ width: 24, height: 24, accentColor: '#d5322a', borderRadius: 8 }}/>
            Post report anonymously
          </label>

          <button type="submit" disabled={loading} className="btn-premium btn-premium-active" style={{ padding: '18px', fontSize: 16, marginTop: 12 }}>
            {loading ? <Loader2 size={24} className="animate-spin" /> : (isEdit ? 'Update Report' : 'Submit Security Report')}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const IncidentReporting = ({ currentUserId, onPickLocationMode, pickedLocation, onPickConsumed }) => {
  const [incidents, setIncidents]       = useState([]);
  const [myOnly, setMyOnly]             = useState(false);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [filterType, setFilterType]     = useState('');
  const [filterSev, setFilterSev]       = useState('');
  const [search, setSearch]             = useState('');
  const [awaitingPick, setAwaitingPick] = useState(false); // true while user is picking from map
  const [pendingPick, setPendingPick]   = useState(null);  // coords returned from map
  // Save draft so the form can be restored after map pick
  const draftRef = React.useRef(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = myOnly ? '/incidents/my' : '/incidents';
      const params   = {};
      if (filterType) params.type = filterType;
      if (filterSev)  params.severity = filterSev;
      const { data } = await api.get(endpoint, { params });
      setIncidents(data.data.incidents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [myOnly, filterType, filterSev]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  // When Dashboard sends back a picked location, re-open the form with those coords
  useEffect(() => {
    if (!pickedLocation) return;
    setPendingPick(pickedLocation);
    setAwaitingPick(false);
    setShowForm(true); // re-open the form so user sees updated coords
    onPickConsumed && onPickConsumed(); // tell Dashboard to clear pickedLocation
  }, [pickedLocation]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this incident report?')) return;
    try {
      await api.delete(`/incidents/${id}`);
      fetchIncidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const handleUpvote = async (id) => {
    try {
      await api.post(`/incidents/${id}/upvote`);
      fetchIncidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upvote.');
    }
  };

  const handleEdit = (incident) => {
    setEditTarget(incident);
    setPendingPick(null);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditTarget(null);
    setPendingPick(null);
    draftRef.current = null;
    fetchIncidents();
  };

  // Called from inside the form's "Pick on Map" button (Legacy - now handled inline)
  const handlePickLocation = (currentFormDraft) => {
    draftRef.current = currentFormDraft;
    setAwaitingPick(true);
    setShowForm(false);
    onPickLocationMode && onPickLocationMode(true);
  };

  const filtered = incidents.filter(inc =>
    inc.title.toLowerCase().includes(search.toLowerCase()) ||
    inc.description.toLowerCase().includes(search.toLowerCase()) ||
    (inc.location?.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="responsive-flex-column" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="glass-dark" style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255, 69, 58, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Siren size={32} color="#ff453a" />
          </div>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 500, color: '#f5f5f7', letterSpacing: '-0.04em', margin: '0' }}>Incident Reports</h2>
            <p style={{ fontSize: 16, color: '#8e8e93', margin: '4px 0 0', fontWeight: 500 }}>Crowdsourced safety alerts.</p>
          </div>
        </div>
        <button onClick={() => { setEditTarget(null); setPendingPick(null); setShowForm(true); }} className="btn-premium btn-premium-active animate-pulse-subtle full-width-mobile" style={{ padding: '14px 28px', fontSize: 15 }}>
          <Plus size={20}/> Report Incident
        </button>
      </div>

      {/* Pick mode banner – shown while user is on Safety Map tab selecting a point */}
      {awaitingPick && (
        <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><MapIcon size={18} /> Switch to the <strong>Safety Map</strong> tab and click anywhere to set the incident location.</span>
          <button onClick={() => { setAwaitingPick(false); onPickLocationMode && onPickLocationMode(false); setShowForm(true); }} style={{ padding: '6px 14px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      {/* Filters bar */}
      <div className="card-apple glass-dark responsive-flex-column" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="glass-dark full-width-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280, borderRadius: 16, padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Search size={20} color="#8e8e93" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search safety reports..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#f5f5f7', width: '100%', fontWeight: 500 }}/>
        </div>

        <div className="full-width-mobile" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="btn-premium glass-dark full-width-mobile" style={{ appearance: 'none', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, color: '#f5f5f7' }}>
            <option value="" style={{ background: '#1c1c1e' }}>All Categories</option>
            {INCIDENT_TYPES.map(t => <option key={t.value} value={t.value} style={{ background: '#1c1c1e' }}>{t.label}</option>)}
          </select>
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)} className="btn-premium glass-dark full-width-mobile" style={{ appearance: 'none', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, color: '#f5f5f7' }}>
            <option value="" style={{ background: '#1c1c1e' }}>All Severity</option>
            {SEVERITY_LEVELS.map(s => <option key={s.value} value={s.value} style={{ background: '#1c1c1e' }}>{s.label}</option>)}
          </select>

          <button onClick={() => setMyOnly(m => !m)} className={`${myOnly ? 'btn-premium btn-premium-active' : 'btn-premium'} full-width-mobile`} style={{ padding: '12px 20px', fontSize: 14 }}>
            {myOnly ? <CheckCircle size={18}/> : <Filter size={18}/>} <span>{myOnly ? 'Your Reports' : 'All Reports'}</span>
          </button>
        </div>
      </div>

      {/* Stats summary */}
      {!loading && incidents.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '0 8px' }}>
          {['critical','high','medium','low'].map(sev => {
            const count = incidents.filter(i => i.severity === sev).length;
            const s = sevInfo(sev);
            return count > 0 ? (
              <div key={sev} className="glass-dark" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: `1px solid ${s.color}25`, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: `0 0 12px ${s.color}a0`, animation: 'pulse-subtle 2s infinite' }}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f5f5f7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{count} {s.label}</span>
              </div>
            ) : null;
          })}
          <div className="glass-dark" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 14, background: 'rgba(0,0,0,0.03)', border: 'none', color: '#8e8e93' }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{incidents.length} TOTAL REPORTS</span>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #f0f0f0', borderTop: '3px solid #e05a3a', animation: 'spin 0.7s linear infinite' }}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)}/>
      ) : (
        <div className="responsive-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map(inc => (
            <IncidentCard
              key={inc._id}
              incident={inc}
              currentUserId={currentUserId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpvote={handleUpvote}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <IncidentForm
          incident={editTarget}
          draft={draftRef.current}      // restore form values after map pick
          onClose={() => { setShowForm(false); setEditTarget(null); setPendingPick(null); draftRef.current = null; }}
          onSave={handleSave}
          pickedCoords={pendingPick}     // coordinates chosen on map
          onPickLocation={handlePickLocation}
        />
      )}
    </div>
  );
};

export default IncidentReporting;
