import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { getMailById } from '../../services/mailService';
import ComposeMail from './ComposeMail';

export default function ComposeDraft() {
  const { id } = useParams();
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const data = await getMailById(token, id, logout);
        const isDraft = data.labels?.some(label => label.name?.toLowerCase() === 'drafts');

        if (!isDraft) {
          navigate('/');  
        } else {
          setDraft(data);
        }
      } catch (err) {
        setError('Failed to load draft');
      }
    };

    if (id && token) {
      fetchDraft();
    }
  }, [id, token, logout, navigate]);

  if (error) return <div className="mails-error">{error}</div>;
  if (!draft) return <div>Loading draft...</div>;

  return <ComposeMail initialData={draft} onSent={() => navigate('/')} />;
}
