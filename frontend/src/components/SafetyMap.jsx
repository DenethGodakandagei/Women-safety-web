import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ─── Incident config ──────────────────────────────────────────────────────────
const INCIDENT_TYPES = [
  { value: 'harassment',          label: 'Harassment',           emoji: '😤', color: '#f97316' },
  { value: 'assault',             label: 'Assault',              emoji: '🚨', color: '#ef4444' },
  { value: 'theft',               label: 'Theft',                emoji: '💰', color: '#eab308' },
  { value: 'stalking',            label: 'Stalking',             emoji: '👁',  color: '#8b5cf6' },
  { value: 'unsafe_area',         label: 'Unsafe Area',          emoji: '⚠️', color: '#f43f5e' },
  { value: 'poor_lighting',       label: 'Poor Lighting',        emoji: '🌑', color: '#64748b' },
  { value: 'suspicious_activity', label: 'Suspicious Activity',  emoji: '🕵️', color: '#0ea5e9' },
  { value: 'other',               label: 'Other',                emoji: '📌', color: '#6b7280' },
];

const SEVERITY_CONFIG = {
  low:      { color: '#22c55e', ring: 'rgba(34,197,94,0.25)',  size: 10 },
  medium:   { color: '#f59e0b', ring: 'rgba(245,158,11,0.25)', size: 13 },
  high:     { color: '#f97316', ring: 'rgba(249,115,22,0.25)', size: 16 },
  critical: { color: '#ef4444', ring: 'rgba(239,68,68,0.3)',   size: 20 },
};

const typeInfo = val => INCIDENT_TYPES.find(t => t.value === val) || INCIDENT_TYPES[7];

// ─── Load Google Maps script (singleton) ─────────────────────────────────────
const loadGoogleMaps = () =>
  new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google.maps);
    const existing = document.getElementById('gmap-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      return;
    }
    const script = document.createElement('script');
    script.id    = 'gmap-script';
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload  = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });

// ─── Build SVG pin for a marker ───────────────────────────────────────────────
const buildMarkerSVG = (color, size = 13) => {
  const s = size;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${s * 3}" height="${s * 3.5}" viewBox="0 0 30 35">
        <circle cx="15" cy="13" r="12" fill="${color}" stroke="white" stroke-width="2.5" opacity="0.9"/>
        <polygon points="15,35 8,22 22,22" fill="${color}" opacity="0.9"/>
        <circle cx="15" cy="13" r="5" fill="white" opacity="0.85"/>
      </svg>
    `)}`,
    scaledSize: null, // will be set after maps API loads
    anchor: null,
  };
};

// ─── Info-window HTML ─────────────────────────────────────────────────────────
const buildInfoWindowContent = (incident) => {
  const t = typeInfo(incident.type);
  const s = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.medium;
  const time = (() => {
    const diff = (Date.now() - new Date(incident.createdAt)) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  })();

  return `
    <div style="font-family:'Inter',system-ui,sans-serif;min-width:220px;max-width:280px;padding:4px 2px 2px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:20px">${t.emoji}</span>
        <div>
          <div style="font-size:13px;font-weight:800;color:#1d1d1f;line-height:1.2">${incident.title}</div>
          <div style="display:flex;gap:5px;margin-top:3px">
            <span style="font-size:10px;font-weight:700;color:${t.color};background:${t.color}18;padding:2px 7px;border-radius:99px">${t.label}</span>
            <span style="font-size:10px;font-weight:700;color:${s.color};padding:2px 7px;border-radius:99px;background:${s.color}18">${incident.severity?.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <p style="font-size:12px;color:#555;line-height:1.5;margin:0 0 8px;max-height:52px;overflow:hidden">${incident.description}</p>
      ${incident.location?.address ? `<div style="font-size:11px;color:#86868b;margin-bottom:6px">📍 ${incident.location.address}</div>` : ''}
      <div style="font-size:11px;color:#86868b;border-top:1px solid #f0f0f0;padding-top:6px;display:flex;justify-content:space-between;align-items:center">
        <span>By <strong>${incident.reportedBy?.name || 'Anonymous'}</strong></span>
        <span>${time} · 👍 ${incident.upvotes || 0}</span>
      </div>
      ${incident.status === 'resolved' ? '<div style="margin-top:6px;font-size:11px;color:#22c55e;font-weight:700">✓ Resolved</div>' : ''}
    </div>
  `;
};

// ─── Legend ───────────────────────────────────────────────────────────────────
const MapLegend = ({ filter, onFilter }) => (
  <div style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '14px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 180 }}>
    <p style={{ fontSize: 11, fontWeight: 800, color: '#555', letterSpacing: '0.05em', margin: '0 0 10px' }}>FILTER BY TYPE</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <button onClick={() => onFilter('')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 8, border: 'none', background: !filter ? '#e05a3a18' : 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <span style={{ fontSize: 13 }}>🗺️</span>
        <span style={{ fontSize: 12, fontWeight: filter ? 500 : 700, color: !filter ? '#e05a3a' : '#555' }}>All Incidents</span>
      </button>
      {INCIDENT_TYPES.map(t => (
        <button key={t.value} onClick={() => onFilter(t.value === filter ? '' : t.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 8, border: 'none', background: filter === t.value ? t.color + '18' : 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
          <span style={{ fontSize: 13 }}>{t.emoji}</span>
          <span style={{ fontSize: 12, fontWeight: filter === t.value ? 700 : 500, color: filter === t.value ? t.color : '#555' }}>{t.label}</span>
        </button>
      ))}
    </div>
    <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: '#555', letterSpacing: '0.05em', margin: '0 0 8px' }}>SEVERITY</p>
      {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => (
        <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: cfg.size, height: cfg.size, borderRadius: '50%', background: cfg.color, border: '2px solid white', boxShadow: `0 0 0 2px ${cfg.ring}` }}/>
          <span style={{ fontSize: 11, color: '#555', textTransform: 'capitalize' }}>{sev}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main SafetyMap ───────────────────────────────────────────────────────────
const SafetyMap = ({ onMapClick, isPickMode }) => {
  const mapRef        = useRef(null);
  const mapObj        = useRef(null);
  const markersRef    = useRef([]);
  const infoWindowRef = useRef(null);
  const userMarkerRef = useRef(null);
  const heatCircles   = useRef([]);
  // Always keep the latest onMapClick in a ref so the map click listener never has a stale closure
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  const [incidents,    setIncidents]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [mapError,     setMapError]     = useState('');
  const [mapReady,     setMapReady]     = useState(false);
  const [filterType,   setFilterType]   = useState('');
  const [showLegend,   setShowLegend]   = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [stats,        setStats]        = useState({ total: 0, critical: 0, active: 0 });

  // Fetch incidents
  const fetchIncidents = useCallback(async () => {
    try {
      const params = {};
      if (filterType) params.type = filterType;
      const { data } = await api.get('/incidents', { params });
      setIncidents(data.data.incidents);
      const inc = data.data.incidents;
      setStats({
        total:    inc.length,
        critical: inc.filter(i => i.severity === 'critical').length,
        active:   inc.filter(i => i.status === 'active').length,
      });
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  // Init map
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const mapsApi = await loadGoogleMaps();
        if (cancelled || !mapRef.current) return;

        // Default center: Colombo, Sri Lanka (adjust as needed)
        const center = { lat: 6.9271, lng: 79.8612 };

        mapObj.current = new mapsApi.Map(mapRef.current, {
          center,
          zoom: 13,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'poi',   elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e4f5' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f8f9fa' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e8e8e8' }] },
          ],
        });

        // Shared InfoWindow
        infoWindowRef.current = new mapsApi.InfoWindow({ maxWidth: 300 });

        // Map click handler — always calls the LATEST onMapClick via ref (avoids stale closure)
        mapObj.current.addListener('click', (e) => {
          if (onMapClickRef.current) {
            onMapClickRef.current({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }
        });

        setMapReady(true);

        // Try to center on user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            const uloc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(uloc);
            mapObj.current.setCenter(uloc);
            mapObj.current.setZoom(14);
            userMarkerRef.current = new mapsApi.Marker({
              position: uloc,
              map: mapObj.current,
              title: 'Your Location',
              zIndex: 999,
              icon: {
                path: mapsApi.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 3,
              },
            });
          }, () => {});
        }
      } catch (err) {
        setMapError('Failed to load Google Maps. Check your API key.');
        console.error(err);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Render markers whenever incidents or mapReady changes
  useEffect(() => {
    if (!mapReady || !mapObj.current || !window.google?.maps) return;
    const mapsApi = window.google.maps;

    // Clear old markers & heat circles
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    heatCircles.current.forEach(c => c.setMap(null));
    heatCircles.current = [];

    incidents.forEach(incident => {
      if (!incident.location?.lat || !incident.location?.lng) return;

      const pos   = { lat: incident.location.lat, lng: incident.location.lng };
      const t     = typeInfo(incident.type);
      const sev   = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.medium;

      // Heat circle
      const circle = new mapsApi.Circle({
        map:           mapObj.current,
        center:        pos,
        radius:        sev.size * 12,
        fillColor:     sev.color,
        fillOpacity:   0.14,
        strokeColor:   sev.color,
        strokeOpacity: 0.35,
        strokeWeight:  1.5,
        clickable:     false,
        zIndex:        1,
      });
      heatCircles.current.push(circle);

      // Pin marker
      const marker = new mapsApi.Marker({
        position: pos,
        map:      mapObj.current,
        title:    incident.title,
        zIndex:   2,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="44" viewBox="0 0 38 44">
              <circle cx="19" cy="17" r="15" fill="${sev.color}" stroke="white" stroke-width="3"/>
              <polygon points="19,44 11,28 27,28" fill="${sev.color}"/>
              <text x="19" y="22" text-anchor="middle" font-size="13" font-family="sans-serif">${t.emoji === '⚠️' ? '!' : t.emoji.replace(/[\uFE0F]/g, '')}</text>
            </svg>
          `)}`,
          scaledSize: new mapsApi.Size(38, 44),
          anchor:     new mapsApi.Point(19, 44),
        },
      });

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(buildInfoWindowContent(incident));
        infoWindowRef.current.open(mapObj.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [incidents, mapReady]);

  // Pick mode cursor — re-run whenever pickMode OR map readiness changes
  useEffect(() => {
    if (!mapObj.current) return;
    mapObj.current.setOptions({ draggableCursor: isPickMode ? 'crosshair' : null });
  }, [isPickMode, mapReady]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.03em', margin: '0 0 4px' }}>🗺️ Interactive Safety Map</h2>
          <p style={{ fontSize: 13, color: '#86868b', margin: 0 }}>Live danger zones from community reports. Click a marker for details.</p>
        </div>
        <button onClick={fetchIncidents} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, background: '#fff', border: '1.5px solid #e5e5e7', color: '#555', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Reports',   value: stats.total,    icon: '📍', color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Active Incidents', value: stats.active,   icon: '🚨', color: '#ef4444', bg: '#fef2f2' },
          { label: 'Critical Zones',  value: stats.critical, icon: '⚠️', color: '#f97316', bg: '#fff7ed' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '14px 18px', border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#86868b', margin: '3px 0 0', fontWeight: 600, letterSpacing: '0.03em' }}>{s.label.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pick mode banner — pointer-events:none so it doesn't intercept map clicks below */}
      {isPickMode && (
        <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', borderRadius: 14, fontSize: 14, fontWeight: 600, pointerEvents: 'none', userSelect: 'none' }}>
          🎯 Click <strong>anywhere on the map</strong> below to set the incident location
        </div>
      )}

      {/* Map wrapper */}
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.07)' }}>
        {/* Legend overlay — hide during pick mode so the legend buttons can't intercept clicks */}
        {showLegend && !isPickMode && (
          <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}>
            <MapLegend filter={filterType} onFilter={setFilterType}/>
          </div>
        )}

        {/* Toggle legend button */}
        <button
          onClick={() => setShowLegend(l => !l)}
          style={{ position: 'absolute', top: 14, left: 14, zIndex: 10, padding: '7px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)' }}
        >
          {showLegend ? '◀ Hide Legend' : '▶ Show Legend'}
        </button>

        {/* User location badge */}
        {userLocation && (
          <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 10, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 99, background: 'rgba(59,130,246,0.9)', color: '#fff', fontSize: 12, fontWeight: 700, boxShadow: '0 2px 12px rgba(59,130,246,0.4)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block', boxShadow: '0 0 0 3px rgba(255,255,255,0.3)', animation: 'map-blink 1.5s ease infinite' }}/>
            You are here
          </div>
        )}

        {mapError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', zIndex: 5, gap: 12 }}>
            <span style={{ fontSize: 40 }}>🗺️</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', margin: 0 }}>{mapError}</p>
            <p style={{ fontSize: 13, color: '#86868b', margin: 0, textAlign: 'center', maxWidth: 360 }}>
              Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> file with a valid key.
            </p>
          </div>
        )}

        {loading && !mapError && (
          <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', fontSize: 13, fontWeight: 600, color: '#555' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #f0f0f0', borderTop: '2px solid #e05a3a', animation: 'spin 0.7s linear infinite' }}/>
            Loading incidents…
          </div>
        )}

        <div ref={mapRef} style={{ width: '100%', height: 520, background: '#e8eaed' }}/>

        <style>{`
          @keyframes map-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>

      {/* Incident type quick filter pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterType('')} style={{ padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${!filterType ? '#e05a3a' : '#e5e5e7'}`, background: !filterType ? '#fef3f0' : '#fff', color: !filterType ? '#e05a3a' : '#86868b', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          All
        </button>
        {INCIDENT_TYPES.map(t => (
          <button key={t.value} onClick={() => setFilterType(filterType === t.value ? '' : t.value)} style={{ padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${filterType === t.value ? t.color : '#e5e5e7'}`, background: filterType === t.value ? t.color + '18' : '#fff', color: filterType === t.value ? t.color : '#86868b', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SafetyMap;
