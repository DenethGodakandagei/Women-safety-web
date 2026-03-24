import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCcw, ShieldCheck, AlertCircle, Info } from 'lucide-react';
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

  const GLASS_STYLE = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(30px) saturate(190%)',
    WebkitBackdropFilter: 'blur(30px) saturate(190%)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'safe': return '#30d158';
      case 'low': return '#0a84ff';
      case 'moderate': return '#ff9f0a';
      case 'high': return '#d5322a';
      case 'critical': return '#d5322a';
      default: return '#8e8e93';
    }
  };

  if (loading) {
    return (
      <div style={{ ...GLASS_STYLE, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, color: '#f5f5f7' }}>
        <RefreshCcw className="animate-spin" size={32} color="#d5322a" />
        <p style={{ marginTop: 16, fontSize: 15, fontWeight: 700, color: '#f5f5f7' }}>Gemini is analyzing...</p>
        <p style={{ marginTop: 4, fontSize: 13, color: '#8e8e93' }}>Scanning local safety data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...GLASS_STYLE, borderRadius: 24, padding: 24, textAlign: 'center' }}>
        <AlertCircle size={32} color="#d5322a" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#d5322a', fontSize: 15, fontWeight: 700 }}>{error}</p>
        <button onClick={fetchRisk} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 12, background: '#d5322a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Retry Analysis</button>
      </div>
    );
  }

  if (!analysis) return null;

  const riskColor = getRiskColor(analysis.riskLevel);

  return (
    <div style={{ ...GLASS_STYLE, borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Background Glow */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 140, height: 140, background: riskColor, opacity: 0.12, borderRadius: '50%', filter: 'blur(40px)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={18} color={riskColor} fill={riskColor + '20'} />
            <span style={{ fontSize: 12, fontWeight: 600, color: riskColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Safety Insights</span>
          </div>
          <h3 style={{ fontSize: 28, fontWeight: 500, color: '#f5f5f7', margin: 0, letterSpacing: '-0.04em' }}>{analysis.riskLevel} Risk</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: riskColor, lineHeight: 1, letterSpacing: '-0.04em' }}>{analysis.riskScore}%</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#8e8e93', marginTop: 4, letterSpacing: '0.05em' }}>SAFETY INDEX</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '18px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: 15, color: '#f5f5f7', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
          {analysis.analysis}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 10, fontWeight: 500, color: '#8e8e93', margin: '0 0 8px', letterSpacing: '0.05em' }}>CONFIDENCE</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
              <div style={{ width: `${analysis.confidenceRate || analysis.confidence || 0}%`, height: '100%', background: '#30d158', borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#f5f5f7' }}>{analysis.confidenceRate || analysis.confidence || 0}%</span>
          </div>
        </div>
        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)' }}>
           <p style={{ fontSize: 10, fontWeight: 500, color: '#8e8e93', margin: '0 0 8px', letterSpacing: '0.05em' }}>PEAK RISK</p>
           <span style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f7' }}>{analysis.temporalAnalysis || 'Unchanging'}</span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ShieldCheck size={18} color="#30d158" />
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7', margin: 0, letterSpacing: '0.03em' }}>SAFETY RECOMMENDATIONS</h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {analysis.safetySuggestions?.map((tip, i) => (
            <div key={i} style={{ 
              display: 'flex', alignItems: 'flex-start', gap: 12, 
              fontSize: 14, color: '#f5f5f7', background: 'rgba(255,255,255,0.03)', 
              padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' 
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: riskColor, marginTop: 7, flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={fetchRisk} 
        style={{ 
          width: '100%', marginTop: 24, padding: '14px', border: '1px solid rgba(255,255,255,0.1)', 
          background: 'rgba(255,255,255,0.05)', color: '#f5f5f7', borderRadius: 18, 
          fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 
        }}
        onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
        onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
      >
        <RefreshCcw size={16} /> Refresh Analysis
      </button>
    </div>
  );
};

export default RiskAnalysisCard;
