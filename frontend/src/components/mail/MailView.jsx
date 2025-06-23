import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMailById, getLabels, updateMail } from '../../services/mailService';
import { AuthContext } from '../../contexts/AuthContext';
import MailDetail from './MailDetail';
import MailActions from './MailActions';
import '../../styles.css';
import { FiArrowLeft } from 'react-icons/fi';
import '../../styles/mails/MailView.css'

export default function MailViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);
  const [mail, setMail] = useState(null);
  const [error, setError] = useState('');

  const refreshMail = useCallback(async (markAsRead = false) => {
    try {
      let data = await getMailById(token, id, logout, navigate);

      if (markAsRead) {
        const hasUnread = data.labels?.some(l => l.name.toLowerCase() === 'unread');
        const hasRead = data.labels?.some(l => l.name.toLowerCase() === 'read');

        if (hasUnread && !hasRead) {
          const allLabels = await getLabels(token, logout);
          const readLabel = allLabels.find(l => l.name.toLowerCase() === 'read');

          const updatedLabels = data.labels
            .filter(l => l.name.toLowerCase() !== 'unread')
            .map(l => l.id);

          if (readLabel) updatedLabels.push(readLabel.id);
          await updateMail(token, data.id, updatedLabels, logout);
        }
      }

      const latest = await getMailById(token, id, logout, navigate);
      setMail(latest);
    } catch (err) {
      setError(err.message);
    }
  }, [token, id, logout, navigate]);

  useEffect(() => {
    if (token) {
      refreshMail(true);
    }
  }, [token, refreshMail]);

  if (error) return <div className="mail-view-error">Error: {error}</div>;
  if (!mail) return <div className="mail-view-loading">Loading mail...</div>;

  return (
    <div className="mail-view-wrapper">
      <div className="mail-view-header">
        <button className="back-button" onClick={() => navigate(-1)}> <FiArrowLeft size={18} /> Back</button>
                <MailActions
          mail={mail}
          onMailDeleted={() => navigate('/')}
          onMailUpdated={() => refreshMail(false)}
        />
      </div>
      <div className="mail-view-body">
        <MailDetail mail={mail} userId={null} />
        <div className="mail-labels">
        </div>
      </div>
    </div>
  );
}
