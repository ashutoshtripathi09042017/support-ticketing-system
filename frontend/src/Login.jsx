import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import PublicTicketForm from './PublicTicketForm';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [showPublicForm, setShowPublicForm] = useState(false);

  if (showPublicForm) {
    return <PublicTicketForm onBackToLogin={() => setShowPublicForm(false)} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Support Ticket Queue Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Username: </label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
            required 
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
            required 
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sign In
        </button>
      </form>

      {/* Public Customer Ticket Portal Link */}
      <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
        <span style={{ color: '#666', fontSize: '13px' }}>Need support without logging in? </span>
        <button 
          type="button" 
          onClick={() => setShowPublicForm(true)} 
          style={{ background: 'transparent', color: '#28a745', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', fontWeight: 'bold' }}
        >
          Submit a Public Ticket
        </button>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Demo Accounts:</strong><br />
        Supervisor: <code>supervisor</code> / <code>Ashu@2228</code><br />
        Agent: <code>agent1</code> / <code>Ashu@2228</code><br />
        Agent: <code>agent2</code> / <code>Ashu@2228</code>
      </div>
    </div>
  );
}