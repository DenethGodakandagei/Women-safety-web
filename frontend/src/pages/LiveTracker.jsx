import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, MapPin, Phone, AlertCircle, Clock, Navigation } from 'lucide-react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import axios from 'axios';

const LiveTracker = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

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
    try {
      const mapsApi = await loadGoogleMaps();
      const center = { lat, lng };
      
      if (!mapRef.current) return;

      mapObj.current = new mapsApi.Map(mapRef.current, {
        center, zoom: 17,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#212121' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
          { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
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
    } catch (err) {
      console.error('Map init failed:', err);
    }
  };

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 5000); 
    return () => clearInterval(interval);
  }, [sessionId]);

  if (loading && !session) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0c' }}>
      <div className="animate-pulse" style={{ textAlign: 'center' }}>
        <Shield size={64} color="#ff3b30" style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 18, fontWeight: 600, color: '#f5f5f7' }}>Connecting to Live SOS Grid...</p>
      </div>
    </div>
  );
 
  if (error && !session) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0c', padding: 24 }}>
      <div className="card-apple" style={{ maxWidth: 400, textAlign: 'center', padding: 40, background: 'rgba(255,255,255,0.03)' }}>
        <AlertCircle size={64} color="#ff3b30" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, fontWeight: 600, color: '#f5f5f7' }}>Session Inactive</h2>
        <p style={{ color: '#8e8e93', marginTop: 12 }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-premium btn-premium-active" style={{ marginTop: 24, width: '100%' }}>Retry Connection</button>
      </div>
    </div>
  );
 
  return (
    <div className="theme-dark" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px', background: 'rgba(10,10,12,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="animate-pulse" style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255, 59, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="#ff3b30" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f5f5f7', margin: 0 }}>Live SOS: {session?.user?.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c759', boxShadow: '0 0 8px rgba(52, 199, 89, 0.5)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#30b14b' }}>ACTIVE SIGNAL</span>
            </div>
          </div>
        </div>
        <a href={`tel:${session?.user?.phone}`} style={{ textDecoration: 'none' }}>
            <button className="btn-premium-active" style={{ height: 44, borderRadius: 12, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <Phone size={16} /> Call Emergency
            </button>
        </a>
      </div>
 
      <div ref={mapRef} style={{ flex: 1, width: '100%', background: '#0a0a0c' }} />
 
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 440, zIndex: 10 }}>
        <div className="card-apple" style={{ background: 'rgba(28,28,30,0.95)', padding: '24px 32px', boxShadow: '0 32px 64px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
             <Navigation size={18} color="#ff3b30" />
             <span style={{ fontSize: 13, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.08em' }}>USER CURRENT POSITION</span>
           </div>
           <div style={{ fontSize: 18, fontWeight: 500, color: '#f5f5f7', background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: 16, fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
             {session?.currentLocation?.lat.toFixed(6)}, {session?.currentLocation?.lng.toFixed(6)}
           </div>
           <p style={{ fontSize: 12, color: '#a1a1a6', marginTop: 16, textAlign: 'center', fontWeight: 500, opacity: 0.6 }}>
             Satellite sync active. Refresh rate: 5.0hz
           </p>
        </div>
      </div>
    </div>
  );
};

export default LiveTracker;
