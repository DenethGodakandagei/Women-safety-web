import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, MapPin, Phone, AlertCircle, Clock, Navigation } from 'lucide-react';
import axios from 'axios';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LiveTracker = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  // Load Google Maps script
  const loadGoogleMaps = () =>
    new Promise((resolve) => {
      if (window.google?.maps) return resolve(window.google.maps);
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`;
      script.onload = () => resolve(window.google.maps);
      document.head.appendChild(script);
    });

  const fetchSession = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';
      const { data } = await axios.get(`${apiBase}/sos/public/${sessionId}`);
      const newSession = data.data.session;
      setSession(newSession);
      setError(null);
      
      if (mapObj.current && markerRef.current) {
        const pos = { lat: newSession.currentLocation.lat, lng: newSession.currentLocation.lng };
        markerRef.current.setPosition(pos);
        circleRef.current?.setCenter(pos);
        mapObj.current.panTo(pos);
      } else if (!mapObj.current && newSession) {
        initMap(newSession.currentLocation.lat, newSession.currentLocation.lng);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lost connection to SOS tracking server.");
    } finally {
      setLoading(false);
    }
  };

  const initMap = async (lat, lng) => {
    const mapsApi = await loadGoogleMaps();
    const center = { lat, lng };
    
    mapObj.current = new mapsApi.Map(mapRef.current, {
      center, zoom: 17,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'all', elementType: 'geometry', stylers: [{ saturation: -100 }, { lightness: 10 }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      ]
    });

    markerRef.current = new mapsApi.Marker({
      position: center, map: mapObj.current,
      icon: {
        path: mapsApi.SymbolPath.CIRCLE,
        scale: 12, fillColor: '#ff3b30', fillOpacity: 1,
        strokeColor: '#fff', strokeWeight: 4,
      }
    });

    circleRef.current = new mapsApi.Circle({
      map: mapObj.current, center, radius: 50,
      fillColor: '#ff3b30', fillOpacity: 0.1,
      strokeColor: '#ff3b30', strokeOpacity: 0.2, strokeWeight: 1,
    });
  };

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  if (loading && !session) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7' }}>
      <div className="animate-pulse" style={{ textAlign: 'center' }}>
        <Shield size={64} color="#ff3b30" style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f' }}>Connecting to Live SOS Grid...</p>
      </div>
    </div>
  );

  if (error && !session) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', padding: 24 }}>
      <div className="card-apple" style={{ maxWidth: 400, textAlign: 'center', padding: 40 }}>
        <AlertCircle size={64} color="#ff3b30" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1d1d1f' }}>Session Inactive</h2>
        <p style={{ color: '#636366', marginTop: 12 }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-premium btn-premium-active" style={{ marginTop: 24, width: '100%' }}>Retry Connection</button>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="animate-pulse" style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255, 59, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="#ff3b30" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f', margin: 0 }}>Live SOS: {session?.user?.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c759', boxShadow: '0 0 8px rgba(52, 199, 89, 0.5)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#30b14b' }}>ACTIVE SIGNAL • UPDATED JUST NOW</span>
            </div>
          </div>
        </div>
        <a href={`tel:${session?.user?.phone}`} style={{ textDecoration: 'none' }}>
            <button className="btn-premium btn-premium-active" style={{ borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={16} /> <span className="hidden-mobile">Call Emergency</span>
            </button>
        </a>
      </div>

      {/* Map View */}
      <div ref={mapRef} style={{ flex: 1, width: '100%', background: '#f5f5f7' }} />

      {/* Footer / Status */}
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 400, zIndex: 10 }}>
        <div className="card-apple" style={{ background: 'rgba(255,255,255,0.95)', padding: 20, boxShadow: '0 20px 48px rgba(0,0,0,0.15)', border: 'none' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
             <Navigation size={18} color="#ff3b30" />
             <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>CURRENT COORDINATES</span>
           </div>
           <div style={{ fontSize: 15, fontWeight: 500, color: '#636366', background: 'rgba(0,0,0,0.03)', padding: '12px 16px', borderRadius: 12, fontFamily: 'monospace' }}>
             {session?.currentLocation?.lat.toFixed(6)}, {session?.currentLocation?.lng.toFixed(6)}
           </div>
           <p style={{ fontSize: 12, color: '#8e8e93', marginTop: 12, textAlign: 'center', fontWeight: 600 }}>
             Location updates automatically while browser is open.
           </p>
        </div>
      </div>
    </div>
  );
};

export default LiveTracker;
