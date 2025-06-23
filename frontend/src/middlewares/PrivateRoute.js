import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * PrivateRoute component restricts access to authenticated users only.
 * While authentication status is loading, displays a loading message.
 * Redirects unauthenticated users to /login.
 * Renders the children for authenticated users.
 */
export default function PrivateRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  console.log('PrivateRoute - token:', token, 'loading:', loading);

  if (loading) {
    // While loading token/auth state, show loading indicator
    return <div>Loading authentication status...</div>;
  }

  if (!token) {
    // No token means user is not authenticated: redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is authenticated: render child components (protected content)
  return children;
}
