import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const RouteAnalyzer = ({ origin, destination }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performRouteAnalysis = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    setAnalysis(null);
    try {
      // 1. Get directions waypoints from Google Maps
      const directionsService = new window.google.maps.DirectionsService();
      const result = await directionsService.route({
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      const path = result.routes[0].overview_path;
      // Sampling points (e.g., every 5th point to avoid overloading)
      const sampledPoints = path.filter((_, i) => i % 5 === 0).map(p => ({
        lat: p.lat(),
        lng: p.lng()
      }));

      // 2. Call our backend
      const { data } = await api.post('/risk/analyze-route', { points: sampledPoints });
      setAnalysis(data.data.riskAnalysis);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze route safety.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (origin && destination) {
      performRouteAnalysis();
    }
  }, [origin, destination]);

  if (loading) return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: 16 }}>
       <p style={{ fontSize: 13, fontWeight: 600, color: '#e05a3a', margin: 0 }}>AI is scanning your route for safety reports...</p>
    </div>
  );

  if (!analysis) return null;

  const color = analysis.overallSafety === 'Safe' ? '#22c55e' : analysis.overallSafety === 'Caution' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: 20, background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: 16, border: `1px solid ${color}30` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, margin: 0, color: '#1d1d1f' }}>Route Safety Analysis</h3>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: color, padding: '3px 10px', borderRadius: 99 }}>{analysis.overallSafety?.toUpperCase()}</span>
      </div>

      <p style={{ fontSize: 14, color: '#444', lineHeight: 1.5, marginBottom: 16 }}>{analysis.verdict}</p>

      {analysis.hotspots?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#999', margin: '0 0 8px' }}>POTENTIAL HOTSPOTS (APPROACH CAUTIOUSLY)</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {analysis.hotspots.map((h, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: 8 }}>📍 {h}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: color + '10', padding: 14, borderRadius: 12, borderLeft: `4px solid ${color}` }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f', margin: '0 0 4px' }}>Recommendation</p>
        <p style={{ fontSize: 13, color: '#555', margin: 0 }}>{analysis.recommendation}</p>
      </div>
    </div>
  );
};

export default RouteAnalyzer;
