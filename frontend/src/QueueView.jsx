import React, { useState, useEffect } from 'react';
import api from './api';

export default function QueueView({ onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionResult, setBulkActionResult] = useState(null);

  const fetchTickets = () => {
    setLoading(true);
    let url = `tickets/?search=${search}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (priorityFilter) url += `&priority=${priorityFilter}`;

    api.get(url)
      .then(res => {
        // Safe check for DRF Pagination vs Plain Array
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setTickets(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, priorityFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(tickets.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkClose = () => {
    if (selectedIds.length === 0) return;
    api.post('tickets/bulk_action/', { ticket_ids: selectedIds, action: 'close' })
      .then(res => {
        setBulkActionResult(res.data);
        setSelectedIds([]);
        fetchTickets();
      });
  };

  const handleExportCSV = () => {
    api.get('tickets/export_csv/', { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tickets_export.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => console.error('CSV Export Error:', err));
};



  return (
    <div style={{ padding: '20px' }}>
      <h2>Ticket Queue</h2>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search subject or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px' }}>
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="OPEN">Open</option>
          <option value="PENDING">Pending</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: '8px' }}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <button onClick={handleExportCSV} style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none' }}>
          Export CSV
        </button>
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div style={{ background: '#e9ecef', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
          <span>Selected: {selectedIds.length} tickets | </span>
          <button onClick={handleBulkClose} style={{ marginLeft: '10px', background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px' }}>
            Bulk Close
          </button>
        </div>
      )}

      {/* Bulk Action Report Display */}
      {bulkActionResult && (
        <div style={{ background: '#d4edda', padding: '10px', marginBottom: '15px', border: '1px solid #c3e6cb' }}>
          <p style={{ margin: 0 }}>
            <strong>Bulk Operation Completed:</strong> Succeeded: {bulkActionResult.succeeded.length}, Failed: {bulkActionResult.failed.length}
          </p>
          {bulkActionResult.failed.map(f => (
            <p key={f.id} style={{ color: 'red', margin: '4px 0 0 0', fontSize: '12px' }}>
              Ticket #{f.id}: {f.reason}
            </p>
          ))}
        </div>
      )}

      {/* Queue Table */}
      {loading ? <p>Loading tickets...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '8px' }}>
                <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === tickets.length && tickets.length > 0} />
              </th>
              <th style={{ padding: '8px' }}>ID</th>
              <th style={{ padding: '8px' }}>Subject</th>
              <th style={{ padding: '8px' }}>Status</th>
              <th style={{ padding: '8px' }}>Priority</th>
              <th style={{ padding: '8px' }}>Assignee</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '8px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => handleSelectOne(t.id)}
                  />
                </td>
                <td style={{ padding: '8px' }}>#{t.id}</td>
                <td style={{ padding: '8px', cursor: 'pointer', color: '#0056b3' }} onClick={() => onSelectTicket(t.id)}>
                  <strong>{t.subject}</strong>
                </td>
                <td style={{ padding: '8px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px', background: t.status === 'PENDING' ? '#ffc107' : '#e2e3e5' }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: '8px' }}>{t.priority}</td>
                <td style={{ padding: '8px' }}>{t.primary_assignee_name || 'Unassigned'}</td>
                <td style={{ padding: '8px' }}>
                  <button onClick={() => onSelectTicket(t.id)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                    View
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