import React, { useState, useEffect } from 'react';
import api from './api';

export default function TicketDetail({ ticketId, onClose, onRefresh }) {
  const [ticket, setTicket] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // 1. Fetch Ticket details and Users list for dropdown
  const fetchDetails = async () => {
    try {
      const [ticketRes, usersRes] = await Promise.all([
        api.get(`tickets/${ticketId}/`),
        api.get('users/')
      ]);
      setTicket(ticketRes.data);
      setUsersList(usersRes.data);
    } catch (err) {
      console.error("Failed to load ticket details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) fetchDetails();
  }, [ticketId]);

  // 2. Handle Reassignment
  const handleAssigneeChange = async (e) => {
    const newAssigneeId = e.target.value ? parseInt(e.target.value) : null;
    try {
      await api.patch(`tickets/${ticketId}/`, { primary_assignee: newAssigneeId });
      fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to assign agent");
    }
  };

  // 3. Handle Status Transition
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await api.patch(`tickets/${ticketId}/`, { status: newStatus });
      fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // 4. Handle Reply
  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      await api.post(`tickets/${ticketId}/reply/`, {
        message: replyMessage,
        is_internal: isInternal
      });
      setReplyMessage('');
      fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to post reply");
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading ticket details...</div>;
  if (!ticket) return null;

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '450px', background: '#1e1e1e', color: '#fff', borderLeft: '1px solid #333', padding: '20px', zIndex: 1000, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>Ticket #{ticket.id}</h2>
        <button onClick={onClose} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
      </div>

      <h3 style={{ margin: '10px 0 5px 0' }}>{ticket.subject}</h3>
      <div style={{ background: '#2a2a2a', padding: '10px', borderRadius: '4px', fontSize: '14px', marginBottom: '15px', border: '1px solid #444' }}>
        {ticket.description}
      </div>

      {/* Assignment & Status Dropdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Assignee:</label>
          <select 
            value={ticket.primary_assignee || ''} 
            onChange={handleAssigneeChange}
            style={{ width: '100%', padding: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
          >
            <option value="">Unassigned</option>
            {usersList.map(u => (
              <option key={u.id} value={u.id}>{u.username} ({u.role || 'AGENT'})</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Status:</label>
          <select 
            value={ticket.status} 
            onChange={handleStatusChange}
            style={{ width: '100%', padding: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
          >
            <option value="NEW">New</option>
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <hr style={{ borderColor: '#333', margin: '20px 0' }} />

      {/* Conversation & Replies */}
      <h4>Conversation & Replies</h4>
      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px' }}>
        {ticket.replies && ticket.replies.length > 0 ? (
          ticket.replies.map(r => (
            <div key={r.id} style={{ background: r.is_internal ? '#3a2e1d' : '#2a2a2a', padding: '8px 12px', borderRadius: '4px', marginBottom: '8px', fontSize: '13px' }}>
              <strong>{r.author_name}</strong> {r.is_internal && <span style={{ color: '#ffc107', fontSize: '10px' }}>[INTERNAL]</span>}:
              <p style={{ margin: '4px 0 0 0' }}>{r.message}</p>
            </div>
          ))
        ) : (
          <p style={{ color: '#aaa', fontSize: '12px' }}>No replies yet.</p>
        )}
      </div>

      <form onSubmit={handlePostReply}>
        <textarea 
          rows="3" 
          placeholder="Write a response or internal note..." 
          value={replyMessage}
          onChange={e => setReplyMessage(e.target.value)}
          style={{ width: '100%', padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <label style={{ fontSize: '12px', color: '#aaa', cursor: 'pointer' }}>
            <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} style={{ marginRight: '5px' }} />
            Internal Note
          </label>
          <button type="submit" style={{ background: '#007bff', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer' }}>
            Post Reply
          </button>
        </div>
      </form>
    </div>
  );
}