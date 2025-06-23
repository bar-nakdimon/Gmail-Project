import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async (id, token) => {
      try {
        const res = await fetch(`http://localhost:3000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch user data');

        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (e) {
        console.error('Error fetching user info:', e);
        logout();
      } finally {
        setLoading(false); 
      }
    };

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.userId || decoded.id;

        if (!userId) throw new Error('Token does not contain userId');

        localStorage.setItem('token', token);
        fetchUserData(userId, token);
      } catch (err) {
        console.error('Invalid or expired token:', err);
        logout();
        setLoading(false);
      }
    } else {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
    }
  }, [token]);

  function login(newToken) {
    setLoading(true);       
    setToken(newToken);   
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoading(false);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
