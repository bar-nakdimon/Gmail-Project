import { useState, useContext } from 'react';
import { updateLabel } from '../../services/mailService';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles.css';

export default function EditLabelModal({ label, onClose, onUpdated }) {
  const [name, setName] = useState(label.name);
  const { token, logout } = useContext(AuthContext);

  const [error, setError] = useState('');

  const handleUpdate = async () => {
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
      const res = await updateLabel(token, label.id, name, logout);
      if (res?.error?.includes('Label with this name already exists')) {
        setError('A label with this name already exists.');
        return;
      }
      onUpdated();
      onClose();
    } catch (err) {
      if (err.message?.includes('Label with this name already exists')) {
        setError('A label with this name already exists.');
      } else {
        setError('Failed to update label.');
      }
    }
  };

  return (
    <div className="modal">
      <h3>Edit Label</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      {error && <div className="error" style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
      <button onClick={handleUpdate}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
