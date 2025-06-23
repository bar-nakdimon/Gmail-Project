import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { getMails, getLabels } from '../../services/mailService';
import MailCard from './MailCard';
import '../../styles.css';

export default function LabelMails() {
  const { id: labelId } = useParams();
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mails, setMails] = useState([]);
  const [labelName, setLabelName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMailsForLabel() {
      try {
        const [allMails, labels] = await Promise.all([
          getMails(token, logout),
          getLabels(token, logout),
        ]);

        let label = labels.find(l => String(l.id) === String(labelId));
        if (!label && String(labelId) === 'received') label = { name: 'Inbox' };
        else if (!label && String(labelId) === 'all') label = { name: 'All Mail' };

        setLabelName(label?.name || 'Unknown');

        const labelIdLower = String(labelId).toLowerCase();
        const isTrashView = labelIdLower === 'trash';
        const isSpamView = labelIdLower === 'spam';
        const isAllView = labelIdLower === 'all';

        const filteredMails = allMails.filter(mail => {
          const labelIds = (mail.labels || []).map(l =>
            typeof l === 'object' ? String(l.id).toLowerCase() : String(l).toLowerCase()
          );

          if (isAllView) {
            return !labelIds.includes('trash') && !labelIds.includes('spam');
          }

          if (isTrashView) {
            return labelIds.includes('trash');
          }

          if (isSpamView) {
            return labelIds.includes('spam') && !labelIds.includes('trash');
          }

          return labelIds.includes(labelIdLower) && !labelIds.includes('trash') && !labelIds.includes('spam');
        });

        setMails(filteredMails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setError('');
      } catch (err) {
        setError('Failed to load label mails.');
      }
    }

    if (token && labelId) fetchMailsForLabel();
  }, [token, labelId, logout]);

  const handleMailDeleted = (id) => {
    setMails(prev => prev.filter(m => m.id !== id));
  };

  const handleMailUpdated = (updated) => {
    const labelIds = updated.labels?.map(l =>
      typeof l === 'object' ? String(l.id).toLowerCase() : String(l).toLowerCase()
    );

    const labelIdLower = String(labelId).toLowerCase();
    const isTrashView = labelIdLower === 'trash';
    const isSpamView = labelIdLower === 'spam';
    const isAllView = labelIdLower === 'all';

    const belongsToThisLabel =
      isAllView
        ? !labelIds.includes('trash') && !labelIds.includes('spam')
        : isTrashView
        ? labelIds.includes('trash')
        : isSpamView
        ? labelIds.includes('spam') && !labelIds.includes('trash')
        : labelIds.includes(labelIdLower) && !labelIds.includes('trash') && !labelIds.includes('spam');

    setMails(prev => {
      if (!belongsToThisLabel) return prev.filter(m => m.id !== updated.id);
      return prev.map(m => (m.id === updated.id ? updated : m));
    });
  };

  return (
    <div className="mails-list-wrapper">
      <h2>{labelName}</h2>
      {error && <div className="text-red-500">{error}</div>}
      {mails.length === 0 ? (
        <p>No mails found for this label.</p>
      ) : (
        mails.map(mail => {
          const isDraft = mail.labels?.some(label => {
            const name = typeof label === 'object' ? label.name?.toLowerCase() : String(label).toLowerCase();
            return name === 'drafts';
          });

          return (
            <MailCard
              key={mail.id}
              mail={mail}
              onMailDeleted={handleMailDeleted}
              onMailUpdated={handleMailUpdated}
              onClick={() => {
                if (isDraft) {
                  navigate(`/draft/${mail.id}`);
                } else {
                  navigate(`/mail/${mail.id}`);
                }
              }}
            />
          );
        })
      )}
    </div>
  );
}
