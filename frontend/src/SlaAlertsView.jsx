import React, { useEffect, useState } from 'react';
import api from './api';

export default function SlaAlertsView({ onSelectTicket }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('sla-alerts/');
      setAlerts(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId) => {
    try {
      await api.post(`sla-alerts/${alertId}/acknowledge/`);
      fetchAlerts();
    } catch (err) {
      alert("Failed to acknowledge alert");
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading Alerts...</div>;

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h2>Active SLA Breach Alerts</h2>
      {alerts.length === 0 ? (
        <p style={{ color: '#28a745' }}>No active SLA breaches! All tickets are within response targets.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Ticket</th>
              <th style={{ padding: '10px' }}>Alert Type</th>
              <th style={{ padding: '10px' }}>Breached At</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => (
              <tr key={alert.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '10px', color: '#007bff', cursor: 'pointer' }} onClick={() => onSelectTicket(alert.ticket)}>
                  #{alert.ticket_id || alert.ticket} {alert.ticket_subject}
                </td>
                <td style={{ padding: '10px', color: alert.alert_type === 'BREACHED' ? '#ff4d4d' : '#ffc107' }}>
                  {alert.alert_type}
                </td>
                <td style={{ padding: '10px' }}>{new Date(alert.created_at).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleAcknowledge(alert.id)} style={{ background: '#28a745', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                    Acknowledge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}