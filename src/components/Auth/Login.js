import React, { useState } from 'react';
import { api } from '../../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.auth.login({ emailOrUsername: email, password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (onLogin) onLogin(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={submit}>
      <h3>Login</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label>Email or Username</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
