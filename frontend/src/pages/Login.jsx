import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { authServices } from '../services/authServices';
import logo from '../assets/logo.svg';
import '../styles/Login.css';

/**
 * Login page: Authenticates user and navigates to inbox on success.
 */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await authServices.login({ username, password });
      login(token); // this will trigger AuthContext and persist user
      setUsername('');
      setPassword('');
      navigate('/');
    } catch (error) {
      setError(error.message || 'Login failed');
      setPassword('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="left-panel">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Sign in</h1>
        <p>to continue to Gmail</p>
      </div>

      <div className="right-panel">
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <label htmlFor="username" className="input-label">Username</label>
          <input
            type="text"
            id="username"
            className="input-field"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />

          <label htmlFor="password" className="input-label">Password</label>
          <input
            type="password"
            id="password"
            className="input-field"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="next-button" disabled={loading}>
            {loading ? 'Loading...' : 'Next'}
          </button>

          <div className="create-account">
            <Link to="/register" className="create-link">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
