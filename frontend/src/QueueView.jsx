// import React, { useState, useEffect } from 'react';
// import api from './api';

// export default function QueueView({ onSelectTicket }) {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [priorityFilter, setPriorityFilter] = useState('');

//   const fetchTickets = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get('tickets/');
//       setTickets(res.data);
//     } catch (err) {
//       console.error("Failed to fetch tickets", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTickets();
//   }, []);

//   // Safe Assignee Extractor
//   const getAssigneeName = (ticket) => {
//     if (ticket.primary_assignee_username) return ticket.primary_assignee_username;
//     if (ticket.assigned_to_username) return ticket.assigned_to_username;
//     if (typeof ticket.primary_assignee === 'object' && ticket.primary_assignee?.username) {
//       return ticket.primary_assignee.username;
//     }
//     if (typeof ticket.assigned_to === 'object' && ticket.assigned_to?.username) {
//       return ticket.assigned_to.username;
//     }
//     if (typeof ticket.primary_assignee === 'string') return ticket.primary_assignee;
//     return 'Unassigned';
//   };

//   // Filter Logic
//   const filteredTickets = tickets.filter(t => {
//     const matchesSearch = t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                           t.description?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter ? t.status === statusFilter : true;
//     const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
//     return matchesSearch && matchesStatus && matchesPriority;
//   });

//   if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading queue...</div>;

//   return (
//     <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
//       <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Ticket Queue</h2>

//       {/* Filters Bar */}
//       <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
//         <input 
//           type="text" 
//           placeholder="Search subject or description..." 
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={{ flex: 1, padding: '8px 12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
//         />
//         <select 
//           value={statusFilter} 
//           onChange={(e) => setStatusFilter(e.target.value)}
//           style={{ padding: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
//         >
//           <option value="">All Statuses</option>
//           <option value="NEW">New</option>
//           <option value="OPEN">Open</option>
//           <option value="PENDING">Pending</option>
//           <option value="RESOLVED">Resolved</option>
//           <option value="CLOSED">Closed</option>
//         </select>
//         <select 
//           value={priorityFilter} 
//           onChange={(e) => setPriorityFilter(e.target.value)}
//           style={{ padding: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
//         >
//           <option value="">All Priorities</option>
//           <option value="LOW">Low</option>
//           <option value="MEDIUM">Medium</option>
//           <option value="HIGH">High</option>
//           <option value="URGENT">Urgent</option>
//         </select>
//       </div>

//       {/* Ticket Table */}
//       <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e1e1e', color: '#fff', borderRadius: '6px', overflow: 'hidden' }}>
//         <thead>
//           <tr style={{ borderBottom: '2px solid #444', textAlign: 'left', background: '#252525' }}>
//             <th style={{ padding: '12px' }}>ID</th>
//             <th style={{ padding: '12px' }}>Subject</th>
//             <th style={{ padding: '12px' }}>Status</th>
//             <th style={{ padding: '12px' }}>Priority</th>
//             <th style={{ padding: '12px' }}>Assignee</th>
//             <th style={{ padding: '12px' }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredTickets.map(ticket => (
//             <tr key={ticket.id} style={{ borderBottom: '1px solid #333' }}>
//               <td style={{ padding: '12px' }}>#{ticket.id}</td>
//               <td 
//                 onClick={() => onSelectTicket(ticket.id)} 
//                 style={{ padding: '12px', color: '#4dabf7', cursor: 'pointer', fontWeight: 'bold' }}
//               >
//                 {ticket.subject}
//               </td>
//               <td style={{ padding: '12px' }}>
//                 <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#333', fontSize: '12px' }}>
//                   {ticket.status}
//                 </span>
//               </td>
//               <td style={{ padding: '12px', fontWeight: 'bold' }}>{ticket.priority}</td>
              
//               {/* Dynamic Assignee Column Fix */}
//               <td style={{ padding: '12px', color: getAssigneeName(ticket) === 'Unassigned' ? '#888' : '#20c997', fontWeight: '500' }}>
//                 {getAssigneeName(ticket)}
//               </td>

//               <td style={{ padding: '12px' }}>
//                 <button 
//                   onClick={() => onSelectTicket(ticket.id)}
//                   style={{ background: '#555', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
//                 >
//                   View
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import api from './api';

export default function QueueView({ onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const res = await api.get('tickets/', { params });
      // DRF pagination handle karne ke liye
      const data = res.data.results ? res.data.results : res.data;
      setTickets(data);
    } catch (err) {
      console.error("Error fetching queue tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, search]);

  // Quick Status Update inside Queue Table
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.patch(`tickets/${ticketId}/`, { status: newStatus });
      // State instantly reload karein
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update status");
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', color: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>Ticket Queue</h2>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text"
          placeholder="Search subject or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 2, padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ flex: 1, padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
        >
          <option value="">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="OPEN">OPEN</option>
          <option value="PENDING">PENDING</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ flex: 1, padding: '8px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
        >
          <option value="">All Priorities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa' }}>No tickets assigned to you.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#2a2a2a', borderBottom: '1px solid #444', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Subject</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Priority</th>
              <th style={{ padding: '12px' }}>Assignee</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>#{t.id}</td>
                <td style={{ padding: '12px', color: '#4dabf7', cursor: 'pointer' }} onClick={() => onSelectTicket(t.id)}>
                  {t.subject}
                </td>
                <td style={{ padding: '12px' }}>
                  <select 
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '4px 8px', borderRadius: '4px' }}
                  >
                    <option value="NEW">NEW</option>
                    <option value="OPEN">OPEN</option>
                    <option value="PENDING">PENDING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{t.priority}</td>
                <td style={{ padding: '12px', color: '#20c997' }}>
                  {t.primary_assignee ? (typeof t.primary_assignee === 'object' ? t.primary_assignee.username : t.primary_assignee) : 'Unassigned'}
                </td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => onSelectTicket(t.id)}
                    style={{ background: '#444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
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