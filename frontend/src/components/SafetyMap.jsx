import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Map as MapIcon, MapPin, AlertTriangle, Siren, RefreshCcw, 
  Flag, Navigation as NavigationIcon, Info, ChevronLeft, ChevronRight, Target,
  Banknote, Eye, Moon, CheckCircle, XCircle, Square, Play, Search as SearchIcon
} from 'lucide-react';
import api from '../utils/api';
import RouteAnalyzer from './RouteAnalyzer';


const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ─── Incident config ──────────────────────────────────────────────────────────
const INCIDENT_TYPES = [
  { value: 'harassment',          label: 'Harassment',           icon: <AlertTriangle size={14}/>, markerText: 'H', color: '#f97316' },
  { value: 'assault',             label: 'Assault',              icon: <Siren size={14}/>,              markerText: 'A', color: '#ef4444' },
  { value: 'theft',               label: 'Theft',                icon: <Banknote size={14}/>,           markerText: 'T', color: '#eab308' },
  { value: 'stalking',            label: 'Stalking',             icon: <Eye size={14}/>,                markerText: 'S', color: '#8b5cf6' },
  { value: 'unsafe_area',         label: 'Unsafe Area',          icon: <AlertTriangle size={14}/>,      markerText: '!', color: '#f43f5e' },
  { value: 'poor_lighting',       label: 'Poor Lighting',        icon: <Moon size={14}/>,               markerText: 'L', color: '#64748b' },
  { value: 'suspicious_activity', label: 'Suspicious Activity',  icon: <SearchIcon size={14}/>,         markerText: '?', color: '#0ea5e9' },
  { value: 'other',               label: 'Other',                icon: <MapPin size={14}/>,             markerText: 'O', color: '#6b7280' },
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
        <div style="width:32px;height:32px;border-radius:8px;background:${t.color}18;display:flex;align-items:center;justify-content:center;color:${t.color};font-weight:900;font-size:16px">
          ${t.markerText}
        </div>
        <div>
          <div style="font-size:13px;font-weight:800;color:#1d1d1f;line-height:1.2">${incident.title}</div>
          <div style="display:flex;gap:5px;margin-top:3px">
            <span style="font-size:10px;font-weight:700;color:${t.color};background:${t.color}18;padding:2px 7px;border-radius:99px">${t.label}</span>
            <span style="font-size:10px;font-weight:700;color:${s.color};padding:2px 7px;border-radius:99px;background:${s.color}18">${incident.severity?.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <p style="font-size:12px;color:#555;line-height:1.5;margin:0 0 8px;max-height:52px;overflow:hidden">${incident.description}</p>
      ${incident.location?.address ? `<div style="font-size:11px;color:#86868b;margin-bottom:6px;display:flex;align-items:center;gap:4px">📍 ${incident.location.address}</div>` : ''}
      <div style="font-size:11px;color:#86868b;border-top:1px solid #f0f0f0;padding-top:6px;display:flex;justify-content:space-between;align-items:center">
        <span>By <strong>${incident.reportedBy?.name || 'Anonymous'}</strong></span>
        <span>${time} · 👍 ${incident.upvotes || 0}</span>
      </div>
      ${incident.status === 'resolved' ? '<div style="margin-top:6px;font-size:11px;color:#22c55e;font-weight:600;display:flex;align-items:center;gap:4px">Check Resolved</div>' : ''}
    </div>
  `;
};

// ─── Legend ───────────────────────────────────────────────────────────────────
const MapLegend = ({ filter, onFilter }) => (
  <div className="card-apple" style={{ 
    background: 'rgba(255,255,255,0.85)', 
    backdropFilter: 'blur(20px)', 
    borderRadius: 24, 
    padding: '24px', 
    width: '100%',
    maxWidth: 260,
    border: '1px solid rgba(255,255,255,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  }}>
    <div className="hidden-mobile">
      <p style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.08em', margin: '0 0 12px', textTransform: 'uppercase' }}>Safety Layers</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button 
          onClick={() => onFilter('')} 
          className={!filter ? 'btn-premium btn-premium-active' : 'btn-premium'}
          style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', background: !filter ? '#007aff' : 'rgba(0,0,0,0.03)', color: !filter ? '#fff' : '#1d1d1f' }}
        >
          <MapPin size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Show All Reports</span>
        </button>
        {INCIDENT_TYPES.slice(0, 6).map(t => (
          <button 
            key={t.value} 
            onClick={() => onFilter(t.value === filter ? '' : t.value)} 
            className={filter === t.value ? 'btn-premium btn-premium-active' : 'btn-premium'}
            style={{ 
              width: '100%', 
              justifyContent: 'flex-start', 
              padding: '8px 14px', 
              background: filter === t.value ? t.color : 'rgba(0,0,0,0.03)',
              color: filter === t.value ? '#fff' : '#1d1d1f'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {React.cloneElement(t.icon, { size: 16 })}
              <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>

    {/* Mobile Select */}
    <div className="hidden-desktop">
      <p style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.08em', margin: '0 0 8px', textTransform: 'uppercase' }}>Filter Map</p>
      <select 
        value={filter} 
        onChange={(e) => onFilter(e.target.value)}
        className="btn-premium"
        style={{ width: '100%', appearance: 'none', padding: '12px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.03)', fontWeight: 600, fontSize: 14 }}
      >
        <option value="">All Intel Layers</option>
        {INCIDENT_TYPES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
    
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.08em', margin: '0 0 12px', textTransform: 'uppercase' }}>Risk Indicators</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 0 3px ${cfg.ring}` }}/>
            <span style={{ fontSize: 11, color: '#1d1d1f', fontWeight: 600, textTransform: 'capitalize' }}>{sev}</span>
          </div>
        ))}
      </div>
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
  const [destination,  setDestination]  = useState('');
  const [routeInput,   setRouteInput]   = useState('');
  const [showRouteSearch, setShowRouteSearch] = useState(false);

  const [directionsRenderer, setDirectionsRenderer] = useState(null);


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

        const dRenderer = new mapsApi.DirectionsRenderer({ suppressMarkers: false });
        dRenderer.setMap(mapObj.current);
        setDirectionsRenderer(dRenderer);

        setMapReady(true);
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
              <text x="19" y="22" text-anchor="middle" font-size="14" font-weight="900" font-family="Inter, sans-serif" fill="white">${t.markerText}</text>
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

  // Route calculation effect
  useEffect(() => {
    if (!mapReady || !destination || !userLocation || !directionsRenderer || !window.google?.maps) return;
    const ds = new window.google.maps.DirectionsService();
    ds.route({ origin: userLocation, destination, travelMode: 'DRIVING' }, (res, status) => {
      if (status === 'OK') directionsRenderer.setDirections(res);
    });
  }, [destination, mapReady, userLocation, directionsRenderer]);


  // Pick mode cursor — re-run whenever pickMode OR map readiness changes
  useEffect(() => {
    if (!mapObj.current) return;
    mapObj.current.setOptions({ draggableCursor: isPickMode ? 'crosshair' : null });
  }, [isPickMode, mapReady]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="responsive-flex-column" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="glass-dark" style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,122,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapIcon size={32} color="#007aff" />
          </div>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 500, color: '#1d1d1f', letterSpacing: '-0.04em', margin: '0' }}>Safety Map</h2>
            <p style={{ fontSize: 16, color: '#636366', margin: '4px 0 0', fontWeight: 500 }}>Live community-driven intelligence.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }} className="full-width-mobile">
          <button onClick={() => setShowRouteSearch(!showRouteSearch)} className={`${showRouteSearch ? 'btn-premium btn-premium-active' : 'btn-premium'} full-width-mobile`} style={{ padding: '12px 24px', fontSize: 14 }}>
            <NavigationIcon size={18} /> Plan Safe Route
          </button>
          <button onClick={fetchIncidents} className="btn-premium full-width-mobile" style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.03)', color: '#1d1d1f' }}>
            <RefreshCcw size={18}/>
          </button>
        </div>
      </div>

      {showRouteSearch && (
        <div className="card-apple" style={{ padding: '24px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: 'none' }}>
          <div className="responsive-grid-modal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 20, alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#8e8e93', display: 'block', marginBottom: 10, letterSpacing: '0.05em' }}>START POINT</label>
              <div className="glass-dark" style={{ background: 'rgba(0,0,0,0.03)', padding: '14px 18px', borderRadius: 14, fontSize: 15, color: '#8e8e93', fontWeight: 600 }}>
                My Current Location
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#8e8e93', display: 'block', marginBottom: 10, letterSpacing: '0.05em' }}>DESTINATION</label>
              <input 
                placeholder="Where are you heading?" 
                value={routeInput}
                onChange={(e) => setRouteInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setDestination(routeInput)}
                className="glass-dark"
                style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: 'none', background: 'rgba(0,0,0,0.03)', fontSize: 15, color: '#1d1d1f', outline: 'none', fontWeight: 600 }} 
              />
            </div>
            <button 
              onClick={() => setDestination(routeInput)}
              className="btn-premium btn-premium-active full-width-mobile"
              style={{ padding: '14px 32px', height: 52 }}
            >
              Analyze Security
            </button>
          </div>
          <RouteAnalyzer origin={userLocation} destination={destination} />
        </div>
      )}


      {/* Stats bar */}
      <div className="responsive-grid-modal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Intelligence Base', value: stats.total,    icon: <MapPin size={24}/>,      color: '#007aff', bg: 'rgba(0, 122, 255, 0.05)' },
          { label: 'Active Reports',    value: stats.active,   icon: <Siren size={24}/>,       color: '#ff3b30', bg: 'rgba(255, 59, 48, 0.05)' },
          { label: 'High Alert Zones',  value: stats.critical, icon: <AlertTriangle size={24}/>, color: '#ff9500', bg: 'rgba(255, 149, 0, 0.05)' },
        ].map(s => (
          <div key={s.label} className="card-apple" style={{ background: s.bg, padding: '20px 24px', border: 'none', display: 'flex', alignItems: 'center', gap: 18 }}>
            <div className="glass-dark" style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 500, color: '#1d1d1f', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#8e8e93', margin: '4px 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pick mode banner — pointer-events:none so it doesn't intercept map clicks below */}
      {isPickMode && (
        <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', borderRadius: 14, fontSize: 14, fontWeight: 600, pointerEvents: 'none', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={18}/> Click <strong>anywhere on the map</strong> below to set the incident location
        </div>
      )}

      {/* Map wrapper */}
      <div className="map-wrapper" style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.5)', height: 520 }}>
        {/* Legend overlay */}
        {showLegend && !isPickMode && (
          <div className="legend-container" style={{ position: 'absolute', top: 20, right: 20, zIndex: 11 }}>
            <MapLegend filter={filterType} onFilter={setFilterType}/>
          </div>
        )}

        {/* Toggle legend button */}
        <button
          onClick={() => setShowLegend(l => !l)}
          className="btn-premium glass-dark"
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 12, padding: '10px 18px', background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {showLegend ? <><ChevronLeft size={16}/> Hide Filters</> : <><ChevronRight size={16}/> Show Filters</>}
        </button>

        {/* User location badge */}
        {userLocation && (
          <div className="animate-float" style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 99, background: 'rgba(0, 122, 255, 0.9)', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', display: 'inline-block', boxShadow: '0 0 0 4px rgba(255,255,255,0.2)', animation: 'map-blink 1.5s ease infinite' }}/>
            LIVE SIGNAL
          </div>
        )}

        {mapError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', zIndex: 5, gap: 12, textAlign: 'center', padding: 20 }}>
            <div style={{ background: '#fff', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
               <MapIcon size={32} color="#dc2626" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', margin: 0 }}>{mapError}</p>
            <p style={{ fontSize: 13, color: '#86868b', margin: 0, maxWidth: 360 }}>
              Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> file.
            </p>
          </div>
        )}

        {loading && !mapError && (
          <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', fontSize: 13, fontWeight: 600, color: '#555' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #f0f0f0', borderTop: '2px solid #e05a3a', animation: 'spin 0.7s linear infinite' }}/>
            Loading...
          </div>
        )}

        <div ref={mapRef} className="map-container" style={{ width: '100%', height: '100%', background: '#e8eaed' }}/>

        <style>{`
          @keyframes map-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>

      {/* Incident type quick filter pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterType('')} className={!filterType ? 'btn-premium btn-premium-active' : 'btn-premium'} style={{ padding: '10px 20px', fontSize: 13 }}>
          <MapIcon size={14}/> All Intel
        </button>
        {INCIDENT_TYPES.map(t => (
          <button key={t.value} onClick={() => setFilterType(filterType === t.value ? '' : t.value)} className={filterType === t.value ? 'btn-premium btn-premium-active' : 'btn-premium'} style={{ padding: '10px 20px', fontSize: 13, background: filterType === t.value ? t.color : 'rgba(0,0,0,0.03)', color: filterType === t.value ? '#fff' : '#1d1d1f' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SafetyMap;
