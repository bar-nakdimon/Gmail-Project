import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { searchMails } from '../../services/mailService';
import '../../styles.css';
import MailCard from './MailCard';
import '../../styles/mails/MailsList.css'

export default function SearchResults() {
  const { query } = useParams();
  const { token, logout } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchResults() {
      try {
        const mails = await searchMails(token, query, logout);
        setResults(mails);
      } catch (err) {
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query, token, logout]);

  const handleMailDeleted = (id) => {
    setResults(prev => prev.filter(m => m.id !== id));
  };

  const handleMailUpdated = (updated) => {
    setResults(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  };

  if (loading) return <div>Searching for "{query}"...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (results.length === 0) return <div>No results found for "{query}".</div>;

  return (
    <div className="mails-list-wrapper">
      <h2>Results for "{query}"</h2>
      {results.map(mail => (
        <MailCard
          key={mail.id}
          mail={mail}
          onMailDeleted={handleMailDeleted}
          onMailUpdated={handleMailUpdated}
        />
      ))}
    </div>
  );
}
