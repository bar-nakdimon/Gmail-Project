import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { getMails } from '../../services/mailService';
import { useNavigate } from 'react-router-dom';
import MailCard from './MailCard';
import '../../styles.css';
import '../../styles/mails/MailsList.css';

export default function Inbox() {
  const [mails, setMails] = useState([]);
  const [error, setError] = useState('');
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const data = await getMails(token, logout, navigate);
     const receivedMails = data.filter(mail => {
          const labelNames = (mail.labels || []).map(label => label.name?.toLowerCase());
          return (
            labelNames.includes('received') &&
            !labelNames.includes('spam') &&
            !labelNames.includes('trash')
          );
        });

        setMails(receivedMails);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load mails');
      }
    };

    if (token) fetchInbox();
  }, [token, logout, navigate]);

  const handleMailDeleted = (id) => {
    setMails(prev => prev.filter(m => m.id !== id));
  };

  const handleMailUpdated = (updated) => {
    const labelNames = updated.labels?.map(l =>
      typeof l === 'object' ? l.name?.toLowerCase() : l.toLowerCase()
    ) || [];

    setMails(prev => {
      if (!labelNames.includes('received')) {
        return prev.filter(m => m.id !== updated.id);
      }
      return prev.map(m => (m.id === updated.id ? updated : m));
    });
  };

  if (!token) {
    return <p className="mails-error">Please log in to view your inbox.</p>;
  }

  return (
    <div className="mail-list-container">
      <div className="mail-list-title">Inbox</div>
      {error && <div className="mails-error">{error}</div>}
      {mails.length === 0 ? (
        <p className="no-mails">No mails found.</p>
      ) : (
        [...mails]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map(mail => {
            const isDraft = mail.labels?.some(label => label.name?.toLowerCase() === 'drafts');
            return (
              <MailCard
                key={mail.id}
                mail={mail}
                onMailDeleted={handleMailDeleted}
                onMailUpdated={handleMailUpdated}
                onClick={() => {
                  if (isDraft) navigate(`/draft/${mail.id}`);
                  else navigate(`/mail/${mail.id}`);
                }}
              />
            );
          })
      )}
    </div>
  );
}
