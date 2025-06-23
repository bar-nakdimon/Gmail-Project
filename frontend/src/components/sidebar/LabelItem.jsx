import { useNavigate } from 'react-router-dom';
import { deleteLabel } from '../../services/mailService';
import EditLabelModal from './EditLabelModal';
import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
  FiEdit2, FiTrash2, FiInbox, FiStar, FiSend,
  FiFileText, FiAlertCircle, FiTag, FiMail
} from 'react-icons/fi';
import '../../styles.css';

export default function LabelItem({ label, onUpdated }) {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const { token, logout } = useContext(AuthContext);

  const DEFAULT_LABEL_IDS = [
    'received', 'sent', 'star', 'trash', 'spam', 'read', 'unread', 'drafts', 'all'
  ];
  const isDefault = DEFAULT_LABEL_IDS.includes(label.id);

  const handleDelete = async () => {
    if (window.confirm(`Delete label "${label.name}"?`)) {
      try {
        await deleteLabel(token, label.id, logout);
        onUpdated();
      } catch (err) {
        alert('Failed to delete label.');
      }
    }
  };

  const getLabelIcon = (labelId) => {
    switch (labelId) {
      case 'received':
        return <FiInbox size={16} />;
      case 'star':
        return <FiStar size={16} />;
      case 'sent':
        return <FiSend size={16} />;
      case 'drafts':
        return <FiFileText size={16} />;
      case 'spam':
        return <FiAlertCircle size={16} />;
      case 'trash':
        return <FiTrash2 size={16} />;
      case 'all':
        return <FiMail size={16} />;
      default:
        return <FiTag size={16} />;
    }
  };

  return (
    <div className="label-item">
      <span
        className="label-name"
        onClick={() => {
          if (label.id === 'received') {
            navigate('/');
          } else if (label.id === 'all') {
            navigate('/label/all');
          } else {
            navigate(`/label/${label.id}`);
          }
        }}
      >
        {getLabelIcon(label.id)}
        {label.name}
      </span>
      <div className="actions">
        {!isDefault && (
          <>
            <button onClick={() => setShowEdit(true)}><FiEdit2 size={16} /></button>
            <button onClick={handleDelete}><FiTrash2 size={16} /></button>
          </>
        )}
      </div>
      {showEdit && (
        <EditLabelModal label={label} onClose={() => setShowEdit(false)} onUpdated={onUpdated} />
      )}
    </div>
  );
}