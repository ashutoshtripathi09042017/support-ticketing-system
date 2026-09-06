import React, { useState, useEffect } from 'react';
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

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Loading metrics...</div>;

  return (
    <div style={{ padding: '20px', color: '#fff', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '5px' }}>Dashboard Overview</h2>
      <p style={{ color: '#888', marginBottom: '25px' }}>Real-time ticket counts and system status.</p>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#1e1e1e', border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#aaa' }}>Total Tickets</span>
          <h1 style={{ margin: '5px 0 0', fontSize: '28px' }}>{metrics?.total || 0}</h1>
        </div>
        <div style={{ background: '#1e1e1e', border: '1px solid #007bff', padding: '15px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#007bff' }}>Open</span>
          <h1 style={{ margin: '5px 0 0', fontSize: '28px' }}>{metrics?.open || 0}</h1>
        </div>
        <div style={{ background: '#1e1e1e', border: '1px solid #ffc107', padding: '15px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#ffc107' }}>Pending</span>
          <h1 style={{ margin: '5px 0 0', fontSize: '28px' }}>{metrics?.pending || 0}</h1>
        </div>
        <div style={{ background: '#1e1e1e', border: '1px solid #28a745', padding: '15px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#28a745' }}>Resolved</span>
          <h1 style={{ margin: '5px 0 0', fontSize: '28px' }}>{metrics?.resolved || 0}</h1>
        </div>
        <div style={{ background: '#1e1e1e', border: '1px solid #6c757d', padding: '15px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#aaa' }}>Closed</span>
          <h1 style={{ margin: '5px 0 0', fontSize: '28px' }}>{metrics?.closed || 0}</h1>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div style={{ background: '#1e1e1e', border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Priority Breakdown</h3>
        <div style={{ display: 'flex', gap: '30px', marginTop: '15px' }}>
          <div><strong style={{ color: '#dc3545' }}>High:</strong> {metrics?.priority?.high || 0}</div>
          <div><strong style={{ color: '#ffc107' }}>Medium:</strong> {metrics?.priority?.medium || 0}</div>
          <div><strong style={{ color: '#17a2b8' }}>Low:</strong> {metrics?.priority?.low || 0}</div>
        </div>
      </div>
    </div>
  );
}