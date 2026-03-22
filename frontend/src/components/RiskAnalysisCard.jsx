import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const RiskAnalysisCard = ({ lat, lng }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRisk = async () => {
    if (!lat || !lng) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/risk/predict', {
        params: { lat, lng, radius: 2 }
      });
      setAnalysis(data.data.riskAnalysis);
    } catch (err) {
      console.error(err);
      setError('AI analysis unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lat && lng) {
      fetchRisk();
    }
  }, [lat, lng]);

  if (loading) {
    return (
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #f0f0f0', borderTop: '3px solid #e05a3a', animation: 'risk-spin 0.8s linear infinite' }} />
        <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: '#86868b' }}>Gemini is analyzing your area...</p>
        <style>{` @keyframes risk-spin { to { transform: rotate(360deg); } } `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: 14, fontWeight: 600 }}>{error}</p>
        <button onClick={fetchRisk} style={{ marginTop: 10, padding: '6px 16px', borderRadius: 10, background: '#e05a3a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Retry</button>
      </div>
    );
  }

  if (!analysis) return null;

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'safe': return '#22c55e';
      case 'low': return '#3b82f6';
      case 'moderate': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#86868b';
    }
  };

  const riskColor = getRiskColor(analysis.riskLevel);

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: riskColor, opacity: 0.08, borderRadius: '50%', filter: 'blur(40px)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: riskColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Safety Insights</span>
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>{analysis.riskLevel} Risk</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: riskColor, lineHeight: 1 }}>{analysis.riskScore}%</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#999', marginTop: 4 }}>DANGER INDEX</div>
        </div>
      </div>

      <div style={{ background: '#f8f9fa', borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
          {analysis.analysis}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: '12px 14px', background: '#fff', borderRadius: 14, border: '1.5px solid #f0f0f2' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#999', margin: '0 0 4px', letterSpacing: '0.04em' }}>CONFIDENCE</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: '#eee', borderRadius: 99 }}>
              <div style={{ width: `${analysis.confidenceRate || analysis.confidence || 0}%`, height: '100%', background: '#34c759', borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>{analysis.confidenceRate || analysis.confidence || 0}%</span>
          </div>
        </div>
        <div style={{ padding: '12px 14px', background: '#fff', borderRadius: 14, border: '1.5px solid #f0f0f2' }}>
           <p style={{ fontSize: 10, fontWeight: 700, color: '#999', margin: '0 0 4px', letterSpacing: '0.04em' }}>PEAK RISK</p>
           <span style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>{analysis.temporalAnalysis || 'N/A'}</span>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: 12, fontWeight: 800, color: '#1d1d1f', marginBottom: 12, letterSpacing: '0.02em' }}>🛡️ SAFETY SUGGESTIONS</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {analysis.safetySuggestions?.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#555', background: '#f8f9fa', padding: '10px 14px', borderRadius: 12 }}>
              <span style={{ color: riskColor, fontWeight: 800 }}>•</span>
              {tip}
            </div>
          ))}
        </div>
      </div>

      <button onClick={fetchRisk} style={{ width: '100%', marginTop: 20, padding: '12px', border: 'none', background: '#f0f0f2', color: '#555', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.target.style.background='#e5e5e7'} onMouseOut={e=>e.target.style.background='#f0f0f2'}>
        Refresh Analysis
      </button>
    </div>
  );
};

export default RiskAnalysisCard;
