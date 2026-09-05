import React, { useState, useEffect } from 'react';
import api from './api';

export default function TicketDetail({ ticketId, onClose, onRefresh }) {
  const [ticket, setTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTicketDetail = () => {
    setErrorMsg('');
    api.get(`tickets/${ticketId}/`)
      .then(res => setTicket(res.data))
      .catch(err => {
        console.error("Error fetching ticket:", err);
        setErrorMsg("Failed to load ticket details.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (ticketId) fetchTicketDetail();
  }, [ticketId]);

  const handleStatusChange = (newStatus) => {
    api.patch(`tickets/${ticketId}/`, { status: newStatus })
      .then(() => {
        fetchTicketDetail();
        if (onRefresh) onRefresh();
      })
      .catch(err => console.error("Error updating status:", err));
  };

  const handleAddReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setErrorMsg('');
    api.post(`tickets/${ticketId}/add_reply/`, {
      message: replyText,
      is_internal: isInternal
    })
    .then(() => {
      setReplyText('');
      fetchTicketDetail();
    })
    .catch(err => {
      console.error("Error adding reply:", err);
      const msg = err.response?.data?.detail || "Failed to post reply (403 Forbidden).";
      setErrorMsg(msg);
    });
  };

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Loading ticket details...</div>;
  if (!ticket) return <div style={{ padding: '20px', color: '#ff6b6b' }}>{errorMsg || "Ticket not found."}</div>;

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: '500px', height: '100vh', background: '#222', color: '#fff', borderLeft: '2px solid #444', padding: '20px', overflowY: 'auto', zIndex: 1000, boxShadow: '-5px 0 15px rgba(0,0,0,0.5)' }}>
      <button onClick={onClose} style={{ float: 'right', background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Close</button>

      <h2>Ticket #{ticket.id}</h2>
      <h3>{ticket.subject}</h3>
      <p style={{ background: '#333', padding: '10px', borderRadius: '4px', lineHeight: '1.4' }}>{ticket.description}</p>

      {/* Error Banner */}
      {errorMsg && (
        <div style={{ background: '#721c24', color: '#f8d7da', padding: '8px', borderRadius: '4px', marginBottom: '10px', fontSize: '13px' }}>
          {errorMsg}
        </div>
      )}

      {/* Ticket Attributes & Controls */}
      <div style={{ margin: '15px 0', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>Status: </label>
        <select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)} style={{ padding: '5px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}>
          <option value="NEW">New</option>
          <option value="OPEN">Open</option>
          <option value="PENDING">Pending</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <hr style={{ borderColor: '#444' }} />

      {/* Thread / Replies Section */}
      <h4>Conversation & Replies</h4>
      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px' }}>
        {ticket.replies && ticket.replies.length > 0 ? (
          ticket.replies.map(r => (
            <div key={r.id} style={{ background: r.is_internal ? '#3a3000' : '#2a2a2a', padding: '8px', marginBottom: '8px', borderRadius: '4px', borderLeft: r.is_internal ? '3px solid #ffc107' : '3px solid #007bff' }}>
              <div style={{ fontSize: '11px', color: '#aaa' }}>
                {r.author_name} {r.is_internal && <strong style={{ color: '#ffc107' }}>[Internal Note]</strong>}
              </div>
              <div style={{ marginTop: '4px' }}>{r.message}</div>
            </div>
          ))
        ) : <p style={{ fontSize: '12px', color: '#888' }}>No replies yet.</p>}
      </div>

      {/* Reply Form */}
      <form onSubmit={handleAddReply}>
        <textarea 
          rows="3" 
          value={replyText} 
          onChange={(e) => setReplyText(e.target.value)} 
          placeholder="Write a response or internal note..." 
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
          required
        />
        <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} /> Internal Note
          </label>
          <button type="submit" style={{ padding: '6px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Post Reply
          </button>
        </div>
      </form>

      <hr style={{ borderColor: '#444', margin: '20px 0' }} />

      {/* Audit Log / History */}
      <h4>Activity History</h4>
      <div style={{ fontSize: '12px', color: '#bbb' }}>
        {ticket.history && ticket.history.length > 0 ? (
          ticket.history.map(h => (
            <div key={h.id} style={{ marginBottom: '4px' }}>
              • <strong>{h.actor_name}</strong> performed <code>{h.action}</code> ({h.new_value})
            </div>
          ))
        ) : <p style={{ fontSize: '11px', color: '#777' }}>No history logged yet.</p>}
      </div>
    </div>
  );
}