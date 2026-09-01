import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import Navbar from './Navbar';
import QueueView from './QueueView';
import TicketDetail from './TicketDetail';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading support desk...</div>;
  if (!user) return <Login />;

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedTicketId(null); }} />
      {activeTab === 'queue' && (
        <QueueView key={refreshTrigger} onSelectTicket={(id) => setSelectedTicketId(id)} />
      )}
      {activeTab === 'dashboard' && (
        <div style={{ padding: '20px' }}>
          <h2>Dashboard</h2>
          <p>Dashboard metrics and SLA charts view.</p>
        </div>
      )}

      {selectedTicketId && (
        <TicketDetail 
          ticketId={selectedTicketId} 
          onClose={() => setSelectedTicketId(null)} 
          onRefresh={() => setRefreshTrigger(prev => prev + 1)} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}