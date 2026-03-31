import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert, AlertTriangle, MapPin, Siren, Radio,
  CheckCircle, XCircle, Square, Play, Map as MapIcon,
  Loader2, Info, Clock, Navigation as NavigationIcon, Activity as ActivityIcon, X
} from 'lucide-react';
import api from '../utils/api';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

import { loadGoogleMaps } from '../utils/googleMapsLoader';

// ── SOS Panel ─────────────────────────────────────────────────────────────────
const SOSPanel = ({ location, contacts, geoError }) => {
  const [state, setState] = useState('idle'); // idle | counting | sending | sent | error
  const [countdown, setCountdown] = useState(5);
  const [result, setResult] = useState(null);
  const [sessionId, setSessionId] = useState(null);
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
      setSessionId(data.data.sessionId);
      setState('sent');
    } catch (e) {
      setResult({ error: e.response?.data?.message || 'Emergency server unreachable.' });
      setState('error');
    }
  };

  // Sync live location to backend during active SOS
  useEffect(() => {
    let interval;
    if (sessionId && state === 'sent' && location.lat !== 0) {
      interval = setInterval(async () => {
        try {
          await api.patch(`/sos/update-location/${sessionId}`, {
            latitude: location.lat,
            longitude: location.lng
          });
          console.log('[SOSTracker] Syncing location...');
        } catch (err) {
          console.error('[SOSTracker] Sync failed:', err.message);
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [sessionId, state, location]);

  const reset = () => { 
    setState('idle'); 
    setResult(null); 
    setSessionId(null);
    setCountdown(5); 
  };

  const hasContacts = contacts.length > 0;
  const hasLocation = location.lat !== 0;

  const getBg = () => {
    if (state === 'counting' || state === 'sending') return 'linear-gradient(135deg, #ff3b30 0%, #ff2d55 100%)';
    if (state === 'sent') return 'linear-gradient(135deg, #30d158 0%, #28a745 100%)';
    if (state === 'error') return 'linear-gradient(135deg, #ff9f0a 0%, #ffc107 100%)';
    return undefined;
  };

  return (
    <div className="card-apple glass-dark" style={{
      background: getBg(),
      padding: '32px',
      color: (state === 'idle') ? '#f5f5f7' : '#fff',
      boxShadow: (state === 'counting' || state === 'sending') ? '0 20px 48px rgba(255, 69, 58, 0.4)' : '0 12px 32px rgba(0,0,0,0.3)',
      transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: 400
    }}>
      {/* Dynamic Background Effects */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />

      {/* IDLE state */}
      {state === 'idle' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div className="glass-dark" style={{ width: 56, height: 56, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 69, 58, 0.15)' }}>
              <ShieldAlert size={32} color="#ff453a" />
            </div>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 500, margin: 0, letterSpacing: '-0.03em', color: '#f5f5f7' }}>Emergency SOS</h3>
              <p style={{ fontSize: 14, color: '#8e8e93', margin: '4px 0 0', fontWeight: 500 }}>Alert all {contacts.length} guardians immediately.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {!hasContacts && (
              <div style={{ background: 'rgba(213, 50, 42, 0.08)', borderRadius: 14, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#d5322a', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} /> Please add emergency contacts first.
              </div>
            )}
            {!hasLocation && !geoError && (
              <div style={{ background: 'rgba(255, 59, 48, 0.08)', borderRadius: 14, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#ff3b30', display: 'flex', alignItems: 'center', gap: 10 }}>
                <NavigationIcon size={18} className="animate-pulse" /> Acquiring high-precision GPS…
              </div>
            )}
            {geoError && !hasLocation && (
              <div style={{ background: 'rgba(213, 50, 42, 0.12)', borderRadius: 14, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#d5322a', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertTriangle size={18} /> {geoError}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(213, 50, 42, 0.8)', fontWeight: 500 }}>
                  Manual override: Click anywhere on the map to set your current position.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {contacts.map(c => (
                <div key={c._id} style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', fontSize: 12, fontWeight: 700, color: '#f5f5f7', border: '1px solid rgba(255,255,255,0.1)' }}>
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
              background: 'linear-gradient(135deg, #d5322a 0%, #ff2d55 100%)',
              color: '#fff', fontSize: 20, fontWeight: 600,
              cursor: (!hasContacts || !hasLocation) ? 'not-allowed' : 'pointer',
              opacity: (!hasContacts || !hasLocation) ? 0.3 : 1,
              letterSpacing: '-0.02em', transition: 'all 0.3s',
              boxShadow: '0 12px 32px rgba(213, 50, 42, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
            }}
          >
            <Siren size={24} /> SEND EMERGENCY SOS
          </button>
          <p style={{ fontSize: 12, textAlign: 'center', color: '#8e8e93', marginTop: 16, fontWeight: 600 }}>SMS & Email alerts with LIVE tracking link will be sent.</p>
        </div>
      )}

      {/* COUNTING state */}
      {state === 'counting' && (
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 100, fontWeight: 500, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.1em' }}>{countdown}</div>
          <p style={{ fontSize: 24, fontWeight: 500, margin: '0 0 8px' }}>Triggering SOS…</p>
          <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 40, fontWeight: 500 }}>Sending coordinates to {contacts.length} guardians in {countdown}s</p>
          <button 
            onClick={cancelSOS} 
            style={{ 
              marginTop: 40,
              padding: '16px 40px', 
              borderRadius: 16, 
              border: '2px solid rgba(255,255,255,0.6)', 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
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
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="animate-pulse" style={{ background: 'rgba(255,255,255,0.25)', width: 100, height: 100, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, boxShadow: '0 0 50px rgba(255,255,255,0.2)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={48} color="#30d158" />
            </div>
          </div>
          
          <h3 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.04em', color: '#fff' }}>SOS Active</h3>
          <p style={{ fontSize: 17, opacity: 0.9, fontWeight: 600, maxWidth: 280, textAlign: 'center', lineHeight: 1.4 }}>
            Direct live signal established. Your guardians are following you now.
          </p>
          
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.1)', padding: '12px 24px', borderRadius: 100 }}>
             <div className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
             <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>LIVE TRACKING ENABLED</span>
          </div>
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
          { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
          { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
          { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
          { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
          { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
          { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
          { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
          { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
        ],
      });
      markerRef.current = new mapsApi.Marker({
        position: center, map: mapObj.current,
        title: 'You',
        icon: {
          path: mapsApi.SymbolPath.CIRCLE,
          scale: 12, fillColor: '#d5322a', fillOpacity: 1,
          strokeColor: '#fff', strokeWeight: 4,
        },
      });
      circleRef.current = new mapsApi.Circle({
        map: mapObj.current, center, radius: 100,
        fillColor: '#d5322a', fillOpacity: 0.15,
        strokeColor: '#d5322a', strokeOpacity: 0.3, strokeWeight: 1,
      });

      mapObj.current.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationUpdate({ lat, lng, accuracy: 0 });
        updateMapPosition(lat, lng);
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
    <div className="card-apple glass-dark" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="glass-dark" style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(213, 50, 42, 0.15)' }}>
            <MapPin size={22} color="#d5322a" />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: '#f5f5f7', margin: 0, letterSpacing: '-0.02em' }}>Live Location Tracking</h3>
            <p style={{ fontSize: 12, color: '#8e8e93', margin: '2px 0 0', fontWeight: 600 }}>
              {watching ? 'Broadcasting live coordinates' : 'GPS standby: Ready to track'}
            </p>
          </div>
        </div>
        <button
          onClick={watching ? stopTracking : startTracking}
          className={watching ? 'btn-premium glass-dark' : 'btn-premium btn-premium-active'}
          style={{ padding: '10px 20px', borderRadius: 14, background: watching ? 'rgba(255,255,255,0.05)' : '#d5322a', color: watching ? '#f5f5f7' : '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {watching ? <><Square size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Start</>}
        </button>
      </div>

      {watching && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', background: 'rgba(48, 209, 88, 0.1)', borderBottom: '1px solid rgba(48, 209, 88, 0.15)' }}>
          <div className="animate-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: '#30d158', boxShadow: '0 0 10px rgba(48, 209, 88, 0.5)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#30d158', display: 'flex', alignItems: 'center', gap: 6 }}>
            GPS ACTIVE: ±{location.accuracy ? Math.round(location.accuracy) : '...'}m accuracy
          </span>
        </div>
      )}

      {mapError && (
        <div style={{ padding: '12px 24px', background: 'rgba(255, 59, 48, 0.08)', color: '#ff3b30', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} /> {mapError}
        </div>
      )}

      <div ref={mapRef} style={{ width: '100%', height: 350, background: '#1c1c1e', position: 'relative' }}>
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
const SOSTracker = ({ contacts = [], userLocation, geoError }) => {
  const [location, setLocation] = useState(userLocation || { lat: 0, lng: 0, accuracy: null });

  useEffect(() => {
    if (userLocation) setLocation(userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (userLocation || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }),
      () => { }
    );
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div className="responsive-flex-column" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 32, fontWeight: 500, color: '#f5f5f7', letterSpacing: '-0.04em', margin: 0 }}>SOS & Tracking</h2>
          <p style={{ fontSize: 16, color: '#8e8e93', marginTop: 6, fontWeight: 500 }}>Real-time location sharing with emergency response integration.</p>
        </div>
      </div>

      <div className="responsive-grid-1-1" style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', gap: 24 }}>
        <SOSPanel location={location} contacts={contacts} geoError={geoError} />
        <LiveMap location={location} onLocationUpdate={setLocation} />
      </div>
    </div>
  );
};

export default SOSTracker;
