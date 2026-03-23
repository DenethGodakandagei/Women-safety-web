import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit2, Trash2, MapPin, Filter, ThumbsUp, CheckCircle, X, 
  Search, Siren, Banknote, Eye, AlertTriangle, Moon, 
  UserSearch, Map, Loader2, Save, Frown, MessageSquareAlert,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';

// ─── Config ───────────────────────────────────────────────────────────────────
const INCIDENT_TYPES = [
  { value: 'harassment',          label: 'Harassment',           icon: <MessageSquareAlert size={14}/>, color: '#f97316' },
  { value: 'assault',             label: 'Assault',              icon: <Siren size={14}/>,              color: '#ef4444' },
  { value: 'theft',               label: 'Theft',                icon: <Banknote size={14}/>,           color: '#eab308' },
  { value: 'stalking',            label: 'Stalking',             icon: <Eye size={14}/>,                color: '#8b5cf6' },
  { value: 'unsafe_area',         label: 'Unsafe Area',          icon: <AlertTriangle size={14}/>,      color: '#f43f5e' },
  { value: 'poor_lighting',       label: 'Poor Lighting',        icon: <Moon size={14}/>,               color: '#64748b' },
  { value: 'suspicious_activity', label: 'Suspicious Activity',  icon: <UserSearch size={14}/>,         color: '#0ea5e9' },
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
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', gap: 16 }}>
    <div style={{ background: '#f5f5f7', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <MapPin size={40} color="#86868b" />
    </div>
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f', margin: '0 0 6px' }}>No incidents reported yet</h3>
      <p style={{ fontSize: 14, color: '#86868b', margin: 0 }}>Help keep the community safe by reporting danger zones</p>
    </div>
    <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, background: '#e05a3a', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
      <Plus size={16}/> Report First Incident
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
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
    >
      {/* Severity bar */}
      <div style={{ height: 4, background: s.color, opacity: 0.7 }}/>

      <div style={{ padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.color, background: t.color + '18', padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                {t.icon} {t.label}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '2px 8px', borderRadius: 99 }}>{s.label.toUpperCase()}</span>
              {incident.status === 'resolved' && <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: '#f0fdf4', padding: '2px 8px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={10} /> Resolved</span>}
              {incident.anonymous && <span style={{ fontSize: 11, color: '#86868b', background: '#f5f5f7', padding: '2px 8px', borderRadius: 99 }}>Anonymous</span>}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1d1d1f', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incident.title}</h3>
          </div>
          {isOwner && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button onClick={() => onEdit(incident)} title="Edit" style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#f5f5f7', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={14} /></button>
              <button onClick={() => onDelete(incident._id)} title="Delete" style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14}/></button>
            </div>
          )}
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.55, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{incident.description}</p>

        {/* Location */}
        {incident.location?.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10, fontSize: 12, color: '#86868b' }}>
            <MapPin size={12} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incident.location.address}</span>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f5f5f7' }}>
          <div style={{ fontSize: 12, color: '#86868b' }}>
            By <strong>{incident.reportedBy?.name || 'Anonymous'}</strong> · {timeAgo(incident.createdAt)}
          </div>
          <button onClick={() => onUpvote(incident._id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 99, border: `1px solid ${upvoted ? '#e05a3a' : '#e5e5e7'}`, background: upvoted ? '#fef3f0' : '#fff', color: upvoted ? '#e05a3a' : '#86868b', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
            <ThumbsUp size={12}/> {incident.upvotes || 0}
          </button>
        </div>
      </div>
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

  const set    = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setLoc = (key, val) => setForm(f => ({ ...f, location: { ...f.location, [key]: val } }));

  // If pickedCoords arrive while form is already open (edge case guard)
  useEffect(() => {
    if (pickedCoords?.lat != null) {
      setForm(f => ({ ...f, location: { ...f.location, lat: pickedCoords.lat, lng: pickedCoords.lng } }));
    }
  }, [pickedCoords]);

  const useMyLocation = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setLoc('lat', pos.coords.latitude);
        setLoc('lng', pos.coords.longitude);
        setLocLoading(false);
      },
      () => { setError('Could not get your location.'); setLocLoading(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.location.lat || !form.location.lng) {
      setError('Please provide a location (use GPS or enter coordinates).');
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
      setError(err.response?.data?.message || 'Failed to save incident.');
    } finally {
      setLoading(false);
    }
  };

  const inp = { width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e5e5e7', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fafafa', color: '#1d1d1f' };
  const label = { fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: '0.04em', marginBottom: 5, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: isEdit ? '#f5f5f7' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isEdit ? <Edit2 size={20} color="#555" /> : <Siren size={20} color="#ef4444" />}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1d1d1f', margin: '0 0 2px' }}>{isEdit ? 'Edit Incident' : 'Report Danger Zone'}</h2>
              <p style={{ fontSize: 13, color: '#86868b', margin: 0 }}>Help keep the community informed and safe</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: '#f5f5f7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', color: '#dc2626', fontSize: 13, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} /> {error}</div>}

          {/* Title */}
          <div>
            <label style={label}>INCIDENT TITLE *</label>
            <input style={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Brief description of the danger…" required maxLength={120}/>
          </div>

          {/* Type + Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={label}>INCIDENT TYPE *</label>
              <select style={inp} value={form.type} onChange={e => set('type', e.target.value)}>
                {INCIDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>SEVERITY *</label>
              <select style={inp} value={form.severity} onChange={e => set('severity', e.target.value)}>
                {SEVERITY_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={label}>DESCRIPTION *</label>
            <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe what happened, when, and any relevant details…" required maxLength={1000}/>
          </div>

          {/* Location */}
          <div>
            <label style={label}>LOCATION *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <input style={inp} type="number" step="any" value={form.location.lat} onChange={e => setLoc('lat', e.target.value)} placeholder="Latitude" required/>
              <input style={inp} type="number" step="any" value={form.location.lng} onChange={e => setLoc('lng', e.target.value)} placeholder="Longitude" required/>
            </div>
            <input style={{ ...inp, marginBottom: 8 }} value={form.location.address} onChange={e => setLoc('address', e.target.value)} placeholder="Address or landmark (optional)"/>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={useMyLocation} disabled={locLoading} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1.5px dashed #e05a3a', background: '#fef9f8', color: '#e05a3a', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {locLoading ? <><Loader2 size={14} className="animate-spin" /> Getting…</> : <><MapPin size={14} /> Use My Location</>}
              </button>
              <button type="button" onClick={() => onPickLocation(form)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1.5px dashed #0ea5e9', background: '#f0f9ff', color: '#0ea5e9', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Map size={14} /> Pick on Map
              </button>
            </div>
            {form.location.lat && form.location.lng && (
              <p style={{ fontSize: 11, color: '#86868b', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={10} /> {parseFloat(form.location.lat).toFixed(5)}, {parseFloat(form.location.lng).toFixed(5)}
              </p>
            )}
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div>
              <label style={label}>STATUS</label>
              <select style={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}

          {/* Anonymous */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#555', fontWeight: 500, padding: '10px 14px', background: '#fafafa', borderRadius: 10, border: '1.5px solid #e5e5e7' }}>
            <input type="checkbox" checked={form.anonymous} onChange={e => set('anonymous', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#e05a3a' }}/>
            Report anonymously (your name won't be shown publicly)
          </label>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 12, background: loading ? '#ccc' : 'linear-gradient(135deg, #e05a3a, #c73e20)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : isEdit ? <><Save size={18} /> Update Incident</> : <><Siren size={18} /> Submit Report</>}
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

  // Called from inside the form's "Pick on Map" button
  const handlePickLocation = (currentFormDraft) => {
    draftRef.current = currentFormDraft; // save current form values
    setAwaitingPick(true);
    setShowForm(false);                  // hide modal while map is visible
    onPickLocationMode && onPickLocationMode(true); // tell Dashboard to switch to map tab
  };

  const filtered = incidents.filter(inc =>
    inc.title.toLowerCase().includes(search.toLowerCase()) ||
    inc.description.toLowerCase().includes(search.toLowerCase()) ||
    (inc.location?.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Siren size={24} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Incident Reports</h2>
            <p style={{ fontSize: 13, color: '#86868b', margin: 0 }}>Report and track danger zones in your community</p>
          </div>
        </div>
        <button onClick={() => { setEditTarget(null); setPendingPick(null); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #e05a3a, #c73e20)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(224,90,58,0.35)', whiteSpace: 'nowrap' }}>
          <Plus size={18}/> Report Incident
        </button>
      </div>

      {/* Pick mode banner – shown while user is on Safety Map tab selecting a point */}
      {awaitingPick && (
        <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Map size={18} /> Switch to the <strong>Safety Map</strong> tab and click anywhere to set the incident location.</span>
          <button onClick={() => { setAwaitingPick(false); onPickLocationMode && onPickLocationMode(false); setShowForm(true); }} style={{ padding: '6px 14px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      {/* Filters bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '14px 18px', background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 160, background: '#f5f5f7', borderRadius: 10, padding: '7px 12px' }}>
          <Search size={14} color="#86868b" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1d1d1f', fontFamily: 'inherit', width: '100%' }}/>
        </div>

        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '7px 12px', borderRadius: 10, border: '1.5px solid #e5e5e7', fontSize: 13, background: '#fff', color: '#1d1d1f', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="">All Types</option>
          {INCIDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select value={filterSev} onChange={e => setFilterSev(e.target.value)} style={{ padding: '7px 12px', borderRadius: 10, border: '1.5px solid #e5e5e7', fontSize: 13, background: '#fff', color: '#1d1d1f', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="">All Severities</option>
          {SEVERITY_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <button onClick={() => setMyOnly(m => !m)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: `1.5px solid ${myOnly ? '#e05a3a' : '#e5e5e7'}`, background: myOnly ? '#fef3f0' : '#fff', color: myOnly ? '#e05a3a' : '#86868b', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {myOnly ? <CheckCircle size={14}/> : <Filter size={14}/>} My Reports
        </button>
      </div>

      {/* Stats summary */}
      {!loading && incidents.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['critical','high','medium','low'].map(sev => {
            const count = incidents.filter(i => i.severity === sev).length;
            const s = sevInfo(sev);
            return count > 0 ? (
              <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: s.bg, border: `1px solid ${s.color}40` }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }}/>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{count} {s.label}</span>
              </div>
            ) : null;
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: '#f5f5f7' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#86868b' }}>{incidents.length} total reports</span>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
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
