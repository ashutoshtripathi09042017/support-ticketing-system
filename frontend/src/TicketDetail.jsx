import React, { useState, useEffect } from 'react';
import api from './api';

export default function TicketDetail({ ticketId, currentUser, onClose, onRefresh }) {
  const [ticket, setTicket] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // GUARANTEED SUPERVISOR DETECTOR
  // Checks role, superuser, staff, or if username contains 'supervisor' or 'admin'
  const isSupervisor = Boolean(
    currentUser?.is_superuser || 
    currentUser?.is_staff ||
    currentUser?.role?.toUpperCase() === 'SUPERVISOR' ||
    currentUser?.role?.toUpperCase() === 'ADMIN' ||
    currentUser?.username?.toLowerCase().includes('supervisor') ||
    currentUser?.username?.toLowerCase().includes('admin')
  );

  const fetchDetails = async () => {
    try {
      const ticketRes = await api.get(`tickets/${ticketId}/`);
      setTicket(ticketRes.data);

      // Fetch users list for dropdown options
      const usersRes = await api.get('users/');
      setUsersList(usersRes.data);
    } catch (err) {
      console.error("Failed to load details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) fetchDetails();
  }, [ticketId]);

  // Handle Primary Assignee Update
  const handleAssigneeChange = async (e) => {
    const newAssigneeId = e.target.value ? parseInt(e.target.value) : null;
    try {
      await api.patch(`tickets/${ticketId}/`, { primary_assignee: newAssigneeId });
      fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to update assignee");
    }
  };

  // Handle Collaborators Update
  const handleCollaboratorChange = async (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value)).filter(Boolean);
    try {
      await api.patch(`tickets/${ticketId}/`, { collaborators: selectedOptions });
      fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to update collaborators");
    }
  };

  // Handle Status Update
  const handleStatusChange = async (e) => {
    try {
      await api.patch(`tickets/${ticketId}/`, { status: e.target.value });
      fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Handle Post Reply
  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      await api.post(`tickets/${ticketId}/add_reply/`, {
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

  if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading details...</div>;
  if (!ticket) return null;

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '450px', background: '#1e1e1e', color: '#fff', borderLeft: '1px solid #333', padding: '20px', zIndex: 1000, overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>Ticket #{ticket.id}</h2>
        <button onClick={onClose} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
      </div>

      <h3 style={{ margin: '10px 0 5px 0' }}>{ticket.subject}</h3>
      <div style={{ background: '#2a2a2a', padding: '10px', borderRadius: '4px', fontSize: '14px', marginBottom: '15px', border: '1px solid #444' }}>
        {ticket.description}
      </div>

      {/* Control Panel: Assignee & Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Assignee:</label>
          {isSupervisor ? (
            /* Supervisor View: Select Dropdown */
            <select 
              value={ticket.primary_assignee || ''} 
              onChange={handleAssigneeChange}
              style={{ width: '100%', padding: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #007bff', borderRadius: '4px', cursor: 'pointer' }}
            >
              <option value="">Unassigned (None)</option>
              {usersList.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          ) : (
            /* Agent View: Read-only */
            <div style={{ padding: '8px', background: '#2a2a2a', color: '#4dabf7', border: '1px solid #444', borderRadius: '4px', fontSize: '13px' }}>
              {ticket.primary_assignee_username || 'Unassigned'}
            </div>
          )}
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Status:</label>
          <select 
            value={ticket.status} 
            onChange={handleStatusChange}
            style={{ width: '100%', padding: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
          >
            <option value="NEW">New</option>
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Collaborators Dropdown (Supervisor Only) */}
      {isSupervisor && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
            Collaborators: <span style={{ color: '#888' }}>(Ctrl + Click for multiple)</span>
          </label>
          <select 
            multiple
            value={ticket.collaborators || []} 
            onChange={handleCollaboratorChange}
            style={{ width: '100%', padding: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #007bff', borderRadius: '4px', height: '75px' }}
          >
            {usersList.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        </div>
      )}

      <hr style={{ borderColor: '#333', margin: '20px 0' }} />

      {/* Conversation Thread */}
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

      {/* Post Reply */}
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