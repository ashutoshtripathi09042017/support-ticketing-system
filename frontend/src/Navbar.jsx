import React from 'react';
import { useAuth } from './AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#333', color: '#fff' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Support Desk</h3>
        <button onClick={() => setActiveTab('queue')} style={{ background: activeTab === 'queue' ? '#555' : 'transparent', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer' }}>
          Queue View
        </button>
        <button onClick={() => setActiveTab('dashboard')} style={{ background: activeTab === 'dashboard' ? '#555' : 'transparent', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer' }}>
          Dashboard
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