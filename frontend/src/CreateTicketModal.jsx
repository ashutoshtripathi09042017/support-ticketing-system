import React, { useState } from 'react';
import api from './api';
import { useAuth } from './AuthContext';

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    requester_email: user?.email || '', // Default to logged in user's email
    priority: 'MEDIUM',
    category: 'TECHNICAL',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('tickets/', formData);
      onTicketCreated();
      onClose();
      setFormData({ 
        subject: '', 
        description: '', 
        requester_email: user?.email || '', 
        priority: 'MEDIUM', 
        category: 'TECHNICAL' 
      });
    } catch (err) {
      // Print exact validation error from Django server
      const backendError = err.response?.data;
      if (typeof backendError === 'object') {
        const errorMsg = Object.entries(backendError)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
          .join(' | ');
        setError(errorMsg || 'Failed to create ticket.');
      } else {
        setError(err.response?.data?.detail || 'Failed to create ticket.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e1e1e', padding: '25px', borderRadius: '8px', width: '450px', color: '#fff', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0 }}>Create New Ticket</h3>
        {error && <div style={{ color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '8px', borderRadius: '4px', marginBottom: '12px', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Requester Email *</label>
            <input 
              type="email" required value={formData.requester_email}
              onChange={e => setFormData({...formData, requester_email: e.target.value})}
              placeholder="customer@example.com"
              style={{ width: '100%', padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Subject *</label>
            <input 
              type="text" required value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Description *</label>
            <textarea 
              rows="3" required value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Priority</label>
              <select 
                value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                style={{ width: '100%', padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Category</label>
              <select 
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
              >
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="BILLING">BILLING</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 15px', background: '#444', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 15px', background: '#007bff', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}