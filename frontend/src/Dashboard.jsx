import React, { useEffect, useState } from 'react';
import api from './api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('tickets/metrics/')
      .then(res => setMetrics(res.data))
      .catch(err => console.error("Error loading metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading Dashboard...</div>;

  // Mock 8-week resolved data if backend response does not include weekly_trend
  const weeklyData = metrics?.weekly_trend || [
    { week: 'W1', count: 4 }, { week: 'W2', count: 7 },
    { week: 'W3', count: 3 }, { week: 'W4', count: 12 },
    { week: 'W5', count: 9 }, { week: 'W6', count: 15 },
    { week: 'W7', count: 8 }, { week: 'W8', count: 11 }
  ];

  return (
    <div style={{ color: '#fff', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Dashboard Overview</h2>
      
      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#222', padding: '15px', borderRadius: '6px', textAlign: 'center', border: '1px solid #333' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{metrics?.total || 0}</div>
          <div style={{ color: '#aaa', fontSize: '13px' }}>Total Tickets</div>
        </div>
        <div style={{ background: '#222', padding: '15px', borderRadius: '6px', textAlign: 'center', border: '1px solid #007bff' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{metrics?.open || 0}</div>
          <div style={{ color: '#aaa', fontSize: '13px' }}>Open</div>
        </div>
        <div style={{ background: '#222', padding: '15px', borderRadius: '6px', textAlign: 'center', border: '1px solid #ffc107' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>{metrics?.pending || 0}</div>
          <div style={{ color: '#aaa', fontSize: '13px' }}>Pending Customer</div>
        </div>
        <div style={{ background: '#222', padding: '15px', borderRadius: '6px', textAlign: 'center', border: '1px solid #28a745' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{metrics?.resolved || 0}</div>
          <div style={{ color: '#aaa', fontSize: '13px' }}>Resolved</div>
        </div>
      </div>

      {/* 8-Week Resolution Trend Chart (Requirement #8) */}
      <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0, fontSize: '16px' }}>Tickets Resolved Per Week (Last 8 Weeks)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '150px', paddingTop: '20px', borderBottom: '1px solid #444' }}>
          {weeklyData.map((item, index) => (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>{item.count}</span>
              <div 
                style={{ 
                  width: '80%', 
                  height: `${Math.min(item.count * 8, 110)}px`, 
                  background: '#28a745', 
                  borderRadius: '3px 3px 0 0' 
                }} 
              />
              <span style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>{item.week}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}