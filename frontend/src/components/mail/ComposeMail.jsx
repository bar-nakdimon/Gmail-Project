import React, { useState, useContext, useEffect } from 'react';
import { createMail, updateMail } from '../../services/mailService';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles.css';

const ComposeMail = ({ onSent, initialData }) => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ toUsername: '', subject: '', body: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        toUsername: initialData.toUsername || '',
        subject: initialData.subject || '',
        body: initialData.body || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.toUsername || !form.subject || !form.body) {
      alert('All fields are required to send a mail');
      return;
    }

    try {
      if (initialData?.id) {
        await updateMail(token, initialData.id, {
          toUsername: form.toUsername,
          subject: form.subject,
          body: form.body,
          isDraft: false
        }, logout);
      } else {
        await createMail(token, {
          toUsername: form.toUsername,
          subject: form.subject,
          body: form.body
        }, logout, navigate);
      }

      alert('Mail sent!');
      if (onSent) onSent();
      setForm({ toUsername: '', subject: '', body: '' });
      navigate('/');
    } catch (err) {
      alert('Failed to send mail: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSaveDraft = async () => {
    if (!form.toUsername && !form.subject && !form.body) {
      alert('Draft is empty — not saved');
      return;
    }

    try {
      if (initialData?.id) {
        await updateMail(token, initialData.id, {
          toUsername: form.toUsername,
          subject: form.subject,
          body: form.body,
          isDraft: true
        }, logout);
      } else {
        await createMail(token, {
          toUsername: form.toUsername,
          subject: form.subject,
          body: form.body,
          isDraft: true
        }, logout, navigate);
      }

      alert('Draft saved!');
      if (onSent) onSent();
      setForm({ toUsername: '', subject: '', body: '' });
      navigate('/');
    } catch (err) {
      alert('Failed to save draft: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="compose-mail-wrapper">
      <form className="compose-mail-container" onSubmit={handleSubmit}>
        <h2>Compose Mail</h2>

        <div>
          <label>To Username:</label>
          <input
            type="text"
            name="toUsername"
            value={form.toUsername}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Subject:</label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Body:</label>
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
          />
        </div>

        <div className="compose-mail-buttons">
          <button type="submit">Send</button>
          <button type="button" onClick={handleSaveDraft}>Save as Draft</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ComposeMail;
