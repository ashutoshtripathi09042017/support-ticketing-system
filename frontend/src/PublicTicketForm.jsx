import React, { useState } from 'react';
import api from './api';

export default function PublicTicketForm({ onGoToLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    description: '',
    priority: 'MEDIUM',
    category: 'General Query'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('tickets/public/', formData);
      setSuccess(`Ticket submitted successfully! Your Ticket ID is #${res.data.id}`);
      setFormData({
        email: '',
        subject: '',
        description: '',
        priority: 'MEDIUM',
        category: 'General Query'
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    if (onGoToLogin) {
      onGoToLogin();
    } else {
      window.location.reload(); // Fallback reload
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '25px', background: '#1e1e1e', color: '#fff', borderRadius: '8px' }}>
      
      {/* ALWAYS VISIBLE LOGIN LINK */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>Customer Support Portal</h2>
        <button 
          type="button"
          onClick={handleLoginClick}
          style={{ 
            background: 'transparent', 
            color: '#4dabf7', 
            border: 'none', 
            cursor: 'pointer', 
            textDecoration: 'underline',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Agent Sign In →
        </button>
      </div>

      <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
        Submit your query or issue below. No account required.
      </p>

      {success && <div style={{ background: '#198754', color: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}
      {error && <div style={{ background: '#dc3545', color: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Your Email Address *</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Subject / Problem Summary *</label>
          <input 
            type="text" 
            required 
            value={formData.subject} 
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description *</label>
          <textarea 
            rows="4" 
            required 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Priority Level</label>
            <select 
              value={formData.priority} 
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '10px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
            >
              <option value="General Query">General Query</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Billing">Billing</option>
              <option value="Product Replacement">Product Replacement</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          style={{ width: '100%', padding: '12px', background: '#28a745', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
        >
          {submitting ? 'Submitting...' : 'Submit Support Ticket'}
        </button>
      </form>
    </div>
  );
}