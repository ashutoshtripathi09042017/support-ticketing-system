import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

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
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            required 
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            required 
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Sign In
        </button>
      </form>
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Demo Accounts:</strong><br />
        Supervisor: <code>supervisor</code> / <code>Ashu@2228</code><br />
        Agent: <code>agent1</code> / <code>Ashu@2228</code>
        Agent: <code>agent2</code> / <code>Ashu@2228</code>
      </div>
    </div>
  );
}