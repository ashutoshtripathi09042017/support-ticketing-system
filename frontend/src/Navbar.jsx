import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './api';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchSlaAlerts = async () => {
      try {
        const res = await api.get('sla-alerts/');
        const data = res.data.results || res.data;
        setAlertCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.error("Failed to load SLA alerts", err);
      }
    };

    fetchSlaAlerts();
    const interval = setInterval(fetchSlaAlerts, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#333', color: '#fff' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Support Desk</h3>
        <button 
          onClick={() => setActiveTab('queue')} 
          style={{ background: activeTab === 'queue' ? '#555' : 'transparent', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
        >
          Queue View
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{ background: activeTab === 'dashboard' ? '#555' : 'transparent', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
        >
          Dashboard
        </button>

        {/* SLA Alert Button with Count Badge */}
        <button 
          onClick={() => setActiveTab('alerts')} 
          style={{ 
            position: 'relative', 
            background: activeTab === 'alerts' ? '#dc3545' : 'transparent', 
            color: '#fff', 
            border: 'none', 
            padding: '6px 12px', 
            cursor: 'pointer',
            borderRadius: '4px' 
          }}
        >
          SLA Alerts
          {alertCount > 0 && (
            <span style={{ 
              position: 'absolute', 
              top: '-4px', 
              right: '-6px', 
              background: '#ff3333', 
              color: '#fff', 
              fontSize: '10px', 
              fontWeight: 'bold', 
              borderRadius: '50%', 
              padding: '2px 6px' 
            }}>
              {alertCount}
            </span>
          )}
        </button>
      </div>

      <div>
        <span style={{ marginRight: '15px' }}>
          Logged in as: <strong>{user?.username}</strong> ({user?.role})
        </span>
        <button onClick={logout} style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}