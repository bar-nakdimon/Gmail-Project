import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { getLabels } from '../../services/mailService';
import LabelItem from './LabelItem';
import AddLabelModal from './AddLabelModal';
import '../../styles.css';

export default function LabelList() {
  const { token, logout } = useContext(AuthContext);
  const [labels, setLabels] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchLabels = useCallback(async () => {
    try {
      let data = await getLabels(token, logout);
      
      data = data.map(label =>
        label.name.toLowerCase() === 'received'
          ? { ...label, name: 'Inbox' }
          : label
      );

      
      const inbox = data.find(l => l.name === 'Inbox');
      const rest = data.filter(l => l.name !== 'Inbox');
      
      
      const allMail = { id: 'all', name: 'All Mail' };

      setLabels([inbox, ...rest, allMail].filter(Boolean));
    } catch (err) {
      console.error('Failed to load labels:', err.message);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  return (
    <div className="label-list">
      <div className="label-list-header">
        <h3>Labels</h3>
        <button className="label-add-button" onClick={() => setShowAddModal(true)}>＋</button>
      </div>

      {labels.map(label => (
        <LabelItem key={label.id} label={label} onUpdated={fetchLabels} />
      ))}

      {showAddModal && (
        <AddLabelModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchLabels}
        />
      )}
    </div>
  );
}