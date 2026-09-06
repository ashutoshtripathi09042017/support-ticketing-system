import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import Navbar from './Navbar';
import QueueView from './QueueView';
import TicketDetail from './TicketDetail';
import Dashboard from './Dashboard';
import SlaAlertsView from './SlaAlertsView';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>Loading support desk...</div>;
  if (!user) return <Login />;

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
  };

  return (
    <div style={{ background: '#121212', minHeight: '100vh', color: '#fff' }}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { 
          setActiveTab(tab); 
          setSelectedTicketId(null); 
        }} 
      />

      <main style={{ padding: '20px' }}>
        {activeTab === 'queue' && (
          <QueueView 
            key={refreshTrigger} 
            onSelectTicket={handleSelectTicket} 
          />
        )}
        
        {activeTab === 'dashboard' && (
          <Dashboard />
        )}

        {activeTab === 'alerts' && (
          <SlaAlertsView 
            onSelectTicket={handleSelectTicket} 
          />
        )}

        {/* Selected Ticket Modal / Detail Overlay */}
        {selectedTicketId && (
          <TicketDetail 
            ticketId={selectedTicketId} 
            onClose={() => setSelectedTicketId(null)} 
            onRefresh={() => setRefreshTrigger(prev => prev + 1)} 
          />
        )}
      </main>
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