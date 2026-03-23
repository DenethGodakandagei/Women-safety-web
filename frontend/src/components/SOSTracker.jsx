import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShieldAlert, AlertTriangle, MapPin, Siren, Radio, 
  CheckCircle, XCircle, Square, Play, Map, 
  Loader2, Info, Clock, Navigation
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
      setResult({ error: e.response?.data?.message || 'SMS delivery failed.' });
      setState('error');
    }
  };

  const reset = () => { setState('idle'); setResult(null); setCountdown(5); };

  const hasContacts = contacts.length > 0;
  const hasLocation = location.lat !== 0;

  return (
    <div style={{
      background: state === 'counting' || state === 'sending'
        ? 'linear-gradient(145deg, #ef4444, #dc2626)'
        : state === 'sent'
        ? 'linear-gradient(145deg, #22c55e, #16a34a)'
        : 'linear-gradient(145deg, #e05a3a, #c73e20)',
      borderRadius: 20,
      padding: '28px 24px',
      color: '#fff',
      boxShadow: state === 'counting' || state === 'sending'
        ? '0 8px 32px rgba(239,68,68,0.5)'
        : '0 8px 32px rgba(224,90,58,0.4)',
      transition: 'all 0.4s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative rings */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>
      <div style={{ position: 'absolute', bottom: -60, left: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>

      {/* IDLE state */}
      {state === 'idle' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={28} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>SOS Emergency Alert</h3>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Sends SMS with live location to all contacts</p>
            </div>
          </div>
          {!hasContacts && (
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} /> Add emergency contacts first before triggering SOS.
            </div>
          )}
          {!hasLocation && (
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Navigation size={16} className="animate-pulse" /> Waiting for GPS location…
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {contacts.slice(0, 4).map(c => (
              <span key={c._id} style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                {c.name}
              </span>
            ))}
            {contacts.length > 4 && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 99, fontSize: 12 }}>+{contacts.length - 4} more</span>}
          </div>
          <button
            onClick={startSOS}
            disabled={!hasContacts || !hasLocation}
            style={{
              width: '100%', padding: '16px', borderRadius: 14, border: '2px solid rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 17, fontWeight: 800,
              cursor: (!hasContacts || !hasLocation) ? 'not-allowed' : 'pointer',
              opacity: (!hasContacts || !hasLocation) ? 0.5 : 1,
              letterSpacing: '0.03em', transition: 'all 0.2s',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}
            onMouseEnter={e => { if (hasContacts && hasLocation) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <Siren size={20} className="animate-pulse" /> HOLD TO SEND SOS
          </button>
        </div>
      )}

      {/* COUNTING state */}
      {state === 'counting' && (
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, marginBottom: 8, animation: 'sos-pulse 1s ease infinite' }}>{countdown}</div>
          <p style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>Sending SOS in {countdown}s…</p>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 24 }}>Alert will be sent to {contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
          <button onClick={cancelSOS} style={{
            background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.6)',
            color: '#fff', borderRadius: 14, padding: '12px 32px', fontWeight: 800, fontSize: 15, cursor: 'pointer'
          }}>✕ CANCEL</button>
        </div>
      )}

      {/* SENDING state */}
      {state === 'sending' && (
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Radio size={32} color="#fff" className="animate-pulse" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Sending alerts…</p>
          <p style={{ fontSize: 13, opacity: 0.8 }}>Contacting {contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* SENT state */}
      {state === 'sent' && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <CheckCircle size={40} color="#fff" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>SOS Sent Successfully!</h3>
            <p style={{ fontSize: 14, opacity: 0.85 }}>{result?.sent} contact{result?.sent !== 1 ? 's' : ''} notified with your live location.</p>
          </div>
          {result?.contactsNotified?.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              {result.contactsNotified.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: i < result.contactsNotified.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <span style={{ fontSize: 12 }}>✓</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 'auto' }}>{c.phone}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={reset} style={{ width: '100%', padding: 14, background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Dismiss
          </button>
        </div>
      )}

      {/* ERROR state */}
      {state === 'error' && (
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <XCircle size={40} color="#fff" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Failed to send SOS</h3>
          <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 20 }}>{result?.error}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={sendSOS} style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Retry</button>
            <button onClick={reset} style={{ padding: '11px 20px', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sos-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
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
          { featureType: 'all', elementType: 'geometry', stylers: [{ saturation: -20 }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f8f8f8' }] },
        ],
      });
      markerRef.current = new mapsApi.Marker({
        position: center, map: mapObj.current,
        title: 'Your location',
        icon: {
          path: mapsApi.SymbolPath.CIRCLE,
          scale: 10, fillColor: '#e05a3a', fillOpacity: 1,
          strokeColor: '#fff', strokeWeight: 3,
        },
      });
      circleRef.current = new mapsApi.Circle({
        map: mapObj.current, center, radius: 120,
        fillColor: '#e05a3a', fillOpacity: 0.1,
        strokeColor: '#e05a3a', strokeOpacity: 0.3, strokeWeight: 1,
      });
    } catch (err) {
      setMapError('Failed to load Google Maps.');
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
    if (!navigator.geolocation) { setMapError('Geolocation not supported.'); return; }
    setWatching(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude, longitude, accuracy } = coords;
        onLocationUpdate({ lat: latitude, lng: longitude, accuracy });
        updateMapPosition(latitude, longitude);
        if (!mapObj.current) initMap(latitude, longitude);
      },
      (err) => { setMapError('Location access denied: ' + err.message); setWatching(false); },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    setWatching(false);
  };

  useEffect(() => () => stopTracking(), []);

  const s = {
    card: { background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' },
  };

  return (
    <div style={s.card}>
      {/* Header bar */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} color="#e05a3a" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', margin: 0 }}>Live Location Tracking</h3>
            {location.lat !== 0
              ? <p style={{ fontSize: 12, color: '#86868b', margin: '3px 0 0' }}>Lat: {location.lat.toFixed(5)} · Lng: {location.lng.toFixed(5)}{location.accuracy ? ` · ±${Math.round(location.accuracy)}m` : ''}</p>
              : <p style={{ fontSize: 12, color: '#86868b', margin: '3px 0 0' }}>Press "Start Tracking" to enable GPS</p>}
          </div>
        </div>
        <button
          onClick={watching ? stopTracking : startTracking}
          style={{
            padding: '8px 16px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            background: watching ? '#fef2f2' : '#e05a3a',
            color: watching ? '#dc2626' : '#fff',
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          {watching ? <><Square size={14} fill="currentColor" /> Stop Tracking</> : <><Play size={14} fill="currentColor" /> Start Tracking</>}
        </button>
      </div>

      {watching && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: '#f0fdf4', borderBottom: '1px solid #dcfce7' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.7)', animation: 'sos-pulse 1.5s ease infinite' }}/>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={14} /> LIVE TRACKING ACTIVE – Location updates every 5 seconds
          </span>
        </div>
      )}

      {mapError && (
        <div style={{ padding: '10px 20px', background: '#fff1f0', color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> {mapError}
        </div>
      )}

      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: 320, background: '#f5f5f7' }}>
        {location.lat === 0 && !watching && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#86868b' }}>
            <div style={{ background: '#fff', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Map size={32} color="#86868b" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Start tracking to see your live location</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
const SOSTracker = ({ contacts }) => {
  const [location, setLocation] = useState({ lat: 0, lng: 0, accuracy: null });

  // Try to get initial position on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }),
      () => {}
    );
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.03em' }}>SOS & Live Tracking</h2>
        <p style={{ fontSize: 13, color: '#86868b', marginTop: 4 }}>One tap sends your location to all emergency contacts via SMS</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SOSPanel location={location} contacts={contacts} />
        <LiveMap location={location} onLocationUpdate={setLocation} />
      </div>
    </div>
  );
};

export default SOSTracker;
