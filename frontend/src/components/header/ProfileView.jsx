import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles.css';

/**
 * Displays logged-in user's profile info in a centered card.
 * Includes avatar, full name, username, and logout button.
 */
export default function ProfileView() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="profile-view">
      <img src={user.avatarUrl} alt="User avatar" />
      <h2>{user.name}</h2>
      <p>@{user.username}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
