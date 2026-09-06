import React, { useState } from 'react';
import api from './api';

export default function PublicTicketForm({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    requester_email: '',
    priority: 'MEDIUM',
    category: 'GENERAL'
  });
  const [submittedId, setSubmittedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('tickets/', formData);
      setSubmittedId(res.data.id || res.data.ticket_id || '#Ref-Success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit ticket. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedId) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', background: '#1e1e1e', borderRadius: '8px', color: '#fff', textAlign: 'center', border: '1px solid #28a745' }}>
        <h2 style={{ color: '#28a745' }}>Ticket Submitted Successfully!</h2>
        <p style={{ color: '#ccc' }}>Your request reference ID is <strong>#{submittedId}</strong>.</p>
        <p style={{ fontSize: '14px', color: '#aaa' }}>Our support agents will review your request and get back to you at <strong>{formData.requester_email}</strong>.</p>
        
        <button 
          onClick={() => { setSubmittedId(null); setFormData({ subject: '', description: '', requester_email: '', priority: 'MEDIUM', category: 'GENERAL' }); }}
          style={{ marginTop: '20px', padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
        >
          Submit Another Request
        </button>
        
        {onBackToLogin && (
          <button 
            onClick={onBackToLogin}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Agent Login
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', background: '#1e1e1e', borderRadius: '8px', color: '#fff', border: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Customer Support Portal</h2>
        {onBackToLogin && (
          <button onClick={onBackToLogin} style={{ background: 'transparent', color: '#007bff', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Agent Sign In
          </button>
        )}
      </div>
      
      <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>Submit your query or issue below. No account required.</p>

      {error && <div style={{ color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Your Email Address *</label>
          <input 
            type="email" required value={formData.requester_email}
            onChange={e => setFormData({...formData, requester_email: e.target.value})}
            placeholder="name@example.com"
            style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Subject / Problem Summary *</label>
          <input 
            type="text" required value={formData.subject}
            onChange={e => setFormData({...formData, subject: e.target.value})}
            placeholder="Brief subject of your issue"
            style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Description *</label>
          <textarea 
            rows="4" required value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Please detail your question or issue..."
            style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Priority Level</label>
            <select 
              value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Category</label>
            <select 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
            >
              <option value="GENERAL">General Query</option>
              <option value="TECHNICAL">Technical Bug</option>
              <option value="BILLING">Billing Issue</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#28a745', border: 'none', color: '#fff', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Submitting...' : 'Submit Support Ticket'}
        </button>
      </form>
    </div>
  );
}