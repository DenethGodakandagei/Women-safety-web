import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert, AlertTriangle, MapPin, Siren, Radio,
  CheckCircle, XCircle, Square, Play, Map as MapIcon,
  Loader2, Info, Clock, Navigation as NavigationIcon, Activity as ActivityIcon, X
} from 'lucide-react';
import api from '../utils/api';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ── Load Google Maps script once ──────────────────────────────────────────────
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

// ── SOS Panel ─────────────────────────────────────────────────────────────────
const SOSPanel = ({ location, contacts }) => {
  const [state, setState] = useState('idle'); // idle | counting | sending | sent | error
  const [countdown, setCountdown] = useState(5);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const startSOS = () => {
    setState('counting');
    setCountdown(5);
    let c = 5;
    timerRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(timerRef.current);
        sendSOS();
      }
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setState('idle');
    setCountdown(5);
  };

  const sendSOS = async () => {
    setState('sending');
    try {
      const { data } = await api.post('/sos/trigger', {
        latitude: location.lat,
        longitude: location.lng,
      });
      setResult(data.data);
      setState('sent');
    } catch (e) {
      setResult({ error: e.response?.data?.message || 'Emergency server unreachable.' });
      setState('error');
    }
  };

  const reset = () => { setState('idle'); setResult(null); setCountdown(5); };

  const hasContacts = contacts.length > 0;
  const hasLocation = location.lat !== 0;

  const getBg = () => {
    if (state === 'counting' || state === 'sending') return 'linear-gradient(135deg, #ff3b30 0%, #ff2d55 100%)';
    if (state === 'sent') return 'linear-gradient(135deg, #34c759 0%, #30b14b 100%)';
    if (state === 'error') return 'linear-gradient(135deg, #ff9500 0%, #ffcc00 100%)';
    return 'rgba(255,255,255,0.85)';
  };

  return (
    <div className="card-apple" style={{
      background: getBg(),
      padding: '32px',
      color: (state === 'idle') ? '#1d1d1f' : '#fff',
      boxShadow: (state === 'counting' || state === 'sending') ? '0 20px 48px rgba(255, 59, 48, 0.4)' : '0 12px 32px rgba(0,0,0,0.05)',
      transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: 400,
      border: 'none',
      backdropFilter: 'blur(30px)'
    }}>
      {/* Dynamic Background Effects */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />

      {/* IDLE state */}
      {state === 'idle' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div className="glass-dark" style={{ width: 56, height: 56, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 59, 48, 0.1)' }}>
              <ShieldAlert size={32} color="#ff3b30" />
            </div>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 500, margin: 0, letterSpacing: '-0.03em' }}>Emergency SOS</h3>
              <p style={{ fontSize: 14, color: '#636366', margin: '4px 0 0', fontWeight: 500 }}>Alert all {contacts.length} guardians immediately.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {!hasContacts && (
              <div style={{ background: 'rgba(255, 59, 48, 0.08)', borderRadius: 14, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#ff3b30', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} /> Please add emergency contacts first.
              </div>
            )}
            {!hasLocation && (
              <div style={{ background: 'rgba(255, 59, 48, 0.08)', borderRadius: 14, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#ff3b30', display: 'flex', alignItems: 'center', gap: 10 }}>
                <NavigationIcon size={18} className="animate-pulse" /> Acquiring high-precision GPS…
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {contacts.map(c => (
                <div key={c._id} style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.04)', fontSize: 12, fontWeight: 700, color: '#636366', border: '1px solid rgba(0,0,0,0.03)' }}>
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startSOS}
            disabled={!hasContacts || !hasLocation}
            className="animate-pulse-subtle"
            style={{
              width: '100%', padding: '24px', borderRadius: 20, border: 'none',
              background: 'linear-gradient(135deg, #ff3b30 0%, #ff2d55 100%)',
              color: '#fff', fontSize: 20, fontWeight: 600,
              cursor: (!hasContacts || !hasLocation) ? 'not-allowed' : 'pointer',
              opacity: (!hasContacts || !hasLocation) ? 0.3 : 1,
              letterSpacing: '-0.02em', transition: 'all 0.3s',
              boxShadow: '0 12px 32px rgba(255, 59, 48, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
            }}
          >
            <Siren size={24} /> SEND EMERGENCY SOS
          </button>
          <p style={{ fontSize: 12, textAlign: 'center', color: '#8e8e93', marginTop: 16, fontWeight: 600 }}>SMS alerts will be sent with your live coordinates.</p>
        </div>
      )}

      {/* COUNTING state */}
      {state === 'counting' && (
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 100, fontWeight: 500, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.1em' }}>{countdown}</div>
          <p style={{ fontSize: 24, fontWeight: 500, margin: '0 0 8px' }}>Triggering SOS…</p>
          <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 40, fontWeight: 500 }}>Sending coordinates to {contacts.length} guardians in {countdown}s</p>
          <button onClick={cancelSOS} className="btn-premium glass" style={{ padding: '16px 40px', borderRadius: 16, fontSize: 16, border: '2px solid rgba(255,255,255,0.4)', color: '#fff' }}>
            ✕ STOP ALERT
          </button>
        </div>
      )}

      {/* SENDING state */}
      {state === 'sending' && (
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Radio size={40} color="#fff" className="animate-pulse" />
          </div>
          <p style={{ fontSize: 24, fontWeight: 500 }}>Dispatching Alerts</p>
          <p style={{ fontSize: 15, opacity: 0.9, fontWeight: 500 }}>Establishing secure connection to emergency gateway…</p>
        </div>
      )}

      {/* SENT state */}
      {state === 'sent' && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <CheckCircle size={48} color="#fff" />
            </div>
            <h3 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Alerts Sent</h3>
            <p style={{ fontSize: 16, opacity: 0.9, fontWeight: 500 }}>{result?.sent} contacts have been notified successfully.</p>
          </div>
          <button onClick={reset} className="btn-premium glass" style={{ width: '100%', padding: 16, borderRadius: 16, fontSize: 15, border: '2px solid rgba(255,255,255,0.4)', color: '#fff' }}>
            Dismiss Status
          </button>
        </div>
      )}

      {/* ERROR state */}
      {state === 'error' && (
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <XCircle size={48} color="#fff" />
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 500, marginBottom: 8 }}>Delivery Failed</h3>
          <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 32 }}>{result?.error}</p>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <button onClick={sendSOS} className="btn-premium glass" style={{ flex: 1, padding: 16, borderRadius: 16, fontWeight: 600 }}>Retry</button>
            <button onClick={reset} className="btn-premium" style={{ flex: 1, padding: 16, borderRadius: 16, background: 'rgba(0,0,0,0.1)', border: 'none', color: '#fff' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Live Map ──────────────────────────────────────────────────────────────────
const LiveMap = ({ location, onLocationUpdate }) => {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [mapError, setMapError] = useState('');
  const [watching, setWatching] = useState(false);
  const watchIdRef = useRef(null);

  const initMap = useCallback(async (lat, lng) => {
    try {
      const mapsApi = await loadGoogleMaps();
      if (!mapRef.current) return;
      const center = { lat, lng };
      mapObj.current = new mapsApi.Map(mapRef.current, {
        center, zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: 'all', elementType: 'geometry', stylers: [{ saturation: -100 }, { lightness: 10 }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
      });
      markerRef.current = new mapsApi.Marker({
        position: center, map: mapObj.current,
        title: 'You',
        icon: {
          path: mapsApi.SymbolPath.CIRCLE,
          scale: 12, fillColor: '#ff3b30', fillOpacity: 1,
          strokeColor: '#fff', strokeWeight: 4,
        },
      });
      circleRef.current = new mapsApi.Circle({
        map: mapObj.current, center, radius: 100,
        fillColor: '#ff3b30', fillOpacity: 0.1,
        strokeColor: '#ff3b30', strokeOpacity: 0.2, strokeWeight: 1,
      });
    } catch (err) {
      setMapError('Google Maps failed to initialize.');
    }
  }, []);

  useEffect(() => {
    if (location.lat !== 0) initMap(location.lat, location.lng);
  }, []);

  const updateMapPosition = (lat, lng) => {
    if (!mapObj.current || !markerRef.current) return;
    const pos = { lat, lng };
    markerRef.current.setPosition(pos);
    circleRef.current?.setCenter(pos);
    mapObj.current.panTo(pos);
  };

  const startTracking = () => {
    if (!navigator.geolocation) { setMapError('GPS not available.'); return; }
    setWatching(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude, longitude, accuracy } = coords;
        onLocationUpdate({ lat: latitude, lng: longitude, accuracy });
        updateMapPosition(latitude, longitude);
        if (!mapObj.current) initMap(latitude, longitude);
      },
      (err) => { setMapError('Location denied.'); setWatching(false); },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    setWatching(false);
  };

  useEffect(() => () => stopTracking(), []);

  return (
    <div className="card-apple" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="glass-dark" style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,59,48,0.05)' }}>
            <MapPin size={22} color="#ff3b30" />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: '#1d1d1f', margin: 0, letterSpacing: '-0.02em' }}>Live Location Tracking</h3>
            <p style={{ fontSize: 12, color: '#8e8e93', margin: '2px 0 0', fontWeight: 600 }}>
              {watching ? 'Broadcasting live coordinates' : 'GPS standby: Ready to track'}
            </p>
          </div>
        </div>
        <button
          onClick={watching ? stopTracking : startTracking}
          className={watching ? 'btn-premium glass' : 'btn-premium btn-premium-active'}
          style={{ padding: '10px 20px', borderRadius: 14, background: watching ? 'rgba(0,0,0,0.03)' : '#ff3b30', color: watching ? '#1d1d1f' : '#fff' }}
        >
          {watching ? <><Square size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Start</>}
        </button>
      </div>

      {watching && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', background: 'rgba(52,199,89,0.08)', borderBottom: '1px solid rgba(52,199,89,0.1)' }}>
          <div className="animate-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: '#34c759', boxShadow: '0 0 10px rgba(52,199,89,0.5)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#30b14b', display: 'flex', alignItems: 'center', gap: 6 }}>
            GPS ACTIVE: ±{location.accuracy ? Math.round(location.accuracy) : '...'}m accuracy
          </span>
        </div>
      )}

      {mapError && (
        <div style={{ padding: '12px 24px', background: 'rgba(255, 59, 48, 0.08)', color: '#ff3b30', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} /> {mapError}
        </div>
      )}

      <div ref={mapRef} style={{ width: '100%', height: 350, background: '#f5f5f7', position: 'relative' }}>
        {location.lat === 0 && !watching && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#8e8e93' }}>
            <MapIcon size={48} strokeWidth={1.5} />
            <p style={{ fontSize: 15, fontWeight: 500 }}>Enable GPS to visualize location</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
const SOSTracker = ({ contacts = [] }) => {
  const [location, setLocation] = useState({ lat: 0, lng: 0, accuracy: null });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }),
      () => { }
    );
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div className="responsive-flex-column" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 32, fontWeight: 500, color: '#1d1d1f', letterSpacing: '-0.04em', margin: 0 }}>SOS & Tracking</h2>
          <p style={{ fontSize: 16, color: '#636366', marginTop: 6, fontWeight: 500 }}>Real-time location sharing with emergency response integration.</p>
        </div>
      </div>

      <div className="responsive-grid-1-1" style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', gap: 24 }}>
        <SOSPanel location={location} contacts={contacts} />
        <LiveMap location={location} onLocationUpdate={setLocation} />
      </div>
    </div>
  );
};

export default SOSTracker;
