import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authServices } from '../services/authServices';
import '../styles/Register.css';
import logo from '../assets/logo.svg';

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function isValidUsername(name) {
    const usernameRegex = /^(?![_.])[a-zA-Z0-9._]{3,20}(?<![_.])$/;
    return usernameRegex.test(name);
  }

  function isValidPassword(pw) {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /\d/.test(pw) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    );
  }

  function handleUsernameChange(e) {
    const val = e.target.value;
    setUsername(val);
    setUsernameError(
      isValidUsername(val)
        ? ''
        : 'Username must be 3-20 characters, letters, numbers, dots, underscores; no _ or . at start/end'
    );
  }

  function handlePasswordChange(e) {
    const val = e.target.value;
    setPassword(val);
    setPasswordError(
      isValidPassword(val)
        ? ''
        : 'Password must be 8+ chars, include uppercase, lowercase, number and special char'
    );
  }

  function handleConfirmPasswordChange(e) {
    const val = e.target.value;
    setConfirmPassword(val);
    setConfirmPasswordError(val !== password ? 'Passwords do not match' : '');
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Image is too large. Please upload an image under 1MB.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (
      !username ||
      !displayName ||
      !password ||
      !confirmPassword ||
      usernameError ||
      passwordError ||
      confirmPasswordError
    ) {
      setError('Please fix the errors above before submitting.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('name', displayName);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await authServices.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.message === 'Username already exists'
        ? 'Username is already taken, please choose another one.'
        : err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <img src={logo} alt="Logo" className="auth-logo" />
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="error-message">{error}</div>}

        <label htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          required
          autoComplete="username"
        />
        {usernameError && <small className="error-text">{usernameError}</small>}

        <label htmlFor="displayName">Display Name:</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          required
          autoComplete="new-password"
        />
        {passwordError && <small className="error-text">{passwordError}</small>}

        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
          autoComplete="new-password"
        />
        {confirmPasswordError && <small className="error-text">{confirmPasswordError}</small>}

        <label htmlFor="avatar">Profile Image:</label>
        <input type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} />

        {avatarPreview && (
          <img
            src={avatarPreview}
            alt="Avatar preview"
            style={{
              width: 100,
              height: 100,
              objectFit: 'cover',
              borderRadius: '50%',
              marginBottom: '20px',
            }}
          />
        )}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="auth-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}
