import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './middlewares/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import MainPage from './pages/MainPage';

import Inbox from './components/mail/Inbox';
import ComposeMail from './components/mail/ComposeMail';
import MailView from './components/mail/MailView';
import LabelMails from './components/mail/LabelMails';
import SearchResults from './components/mail/SearchResults';
import ProfileView from './components/header/ProfileView';
import ComposeDraft from './components/mail/ComposeDraft';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainPage />
              </PrivateRoute>
            }
          >
            {/* Routes rendered inside <MainPage>'s <Outlet /> */}
            <Route index element={<Inbox />} />
            <Route path="compose" element={<ComposeMail />} />
            <Route path="mail/:id" element={<MailView />} />
            <Route path="label/:id" element={<LabelMails />} />
            <Route path="search/:query" element={<SearchResults />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="draft/:id" element={<ComposeDraft />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
