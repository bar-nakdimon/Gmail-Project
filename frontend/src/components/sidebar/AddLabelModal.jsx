import { useState, useContext } from 'react';
import { createLabel } from '../../services/mailService';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles.css';

export default function AddLabelModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const { token, logout } = useContext(AuthContext);

  const [error, setError] = useState('');

  const handleAdd = async () => {
    const forbiddenNames = ['inbox', 'sent', 'spam', 'trash', 'star', 'read', 'unread', 'drafts', 'received'];
    const lowerName = name.trim().toLowerCase();

    if (!lowerName) {
      setError('Label name cannot be empty.');
      return;
    }

    if (forbiddenNames.includes(lowerName)) {
      setError('This label name is reserved and cannot be used.');
      return;
    }
    try {
      const res = await createLabel(token, name, '', logout);
      if (res?.error?.includes('Label with this name already exists')) {
        setError('A label with this name already exists.');
        return;
      }
      onAdded();
      onClose();
    } catch (err) {
      if (err.message?.includes('Label with this name already exists')) {
        setError('A label with this name already exists.');
      } else {
        setError('Failed to add label.');
      }
    }
  };

  return (
    <div className="modal">
      <h3>Add New Label</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Label name" />
      {error && <div className="error" style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
      <button onClick={handleAdd}>Add</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}