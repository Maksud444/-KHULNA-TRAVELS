import React, { useState } from 'react';
import { api } from '../../services/api';

export default function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.auth.register({ username, email, password, full_name: fullName, phone });
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (onRegister) onRegister(res.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={submit}>
      <h3>Register</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Full Name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit">Register</button>
    </form>
  );
}
