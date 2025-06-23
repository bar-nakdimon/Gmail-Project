import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  MdDelete,
  MdStar,
  MdStarBorder,
  MdMarkEmailUnread,
  MdCheck,
  MdReport,
  MdRestoreFromTrash,
  MdLabel
} from 'react-icons/md';
import '../../styles.css';
import '../../styles/mails/MailActions.css';
import {
  toggleStar,
  toggleRead,
  trashOrDelete,
  restoreFromTrash
} from '../../utils/mailActionsHelper';
import { getLabels, updateMailLabel, createLabel } from '../../services/mailService';

export default function MailActions({ mail, onMailDeleted, onMailUpdated }) {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [allLabels, setAllLabels] = useState([]);
  const labelRef = useRef(null);

  const isStarred = mail.labels?.some(l => l.name.toLowerCase() === 'star');
  const isSpam = mail.labels?.some(l => l.name.toLowerCase() === 'spam');
  const isTrash = mail.labels?.some(l => l.name.toLowerCase() === 'trash');
  const isOwnedByUser = mail.fromUserId === user?.id;

  useEffect(() => {
    if (showLabelPicker && allLabels.length === 0) {
      getLabels(token, logout).then(setAllLabels).catch(console.error);
    }
  }, [showLabelPicker, token, logout]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (labelRef.current && !labelRef.current.contains(event.target)) {
        setShowLabelPicker(false);
      }
    };
    if (showLabelPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLabelPicker]);

  const handleToggleLabel = async (labelName) => {
    try {
      const all = allLabels.length ? allLabels : await getLabels(token, logout);
      let label = all.find(l => l.name.toLowerCase() === labelName.toLowerCase());

      if (!label) {
        label = await createLabel(token, labelName, `${labelName} label`, logout);
      }

      const currentLabelIds = (mail.labels || []).map(l => String(l.id));
      const currentLabelNames = (mail.labels || []).map(l => l.name.toLowerCase());
      const labelId = String(label.id);
      const labelNameLower = label.name.toLowerCase();
      const hasLabel = currentLabelIds.includes(labelId);

      let newLabelIds;

      if (hasLabel) {
        newLabelIds = currentLabelIds.filter(id => id !== labelId);
      } else {
        newLabelIds = [...currentLabelIds];

        const isExclusive = ['spam', 'trash'].includes(labelNameLower);
        const hasExclusive = currentLabelNames.includes('spam') || currentLabelNames.includes('trash');
        const isReadRelated = labelNameLower === 'read' || labelNameLower === 'unread';

        if (hasExclusive && !isReadRelated && !isExclusive) return;

        if (isExclusive) {
          newLabelIds = (mail.labels || [])
            .filter(l => {
              const name = l.name.toLowerCase();
              return ['read', 'unread', 'sent', 'received'].includes(name);
            })
            .map(l => String(l.id));
        }
        newLabelIds.push(labelId);
      }

      await updateMailLabel(token, mail.id, newLabelIds, logout);
      if (onMailUpdated) await onMailUpdated({ ...mail, labels: newLabelIds });
    } catch (err) {
      console.error('Failed to update label:', err);
    }
  };

  return (
    <div className="mail-actions">
      <div className="action-button" onClick={() => trashOrDelete(mail, token, logout, onMailDeleted, isTrash)}>
        <MdDelete size={22} />
        <div className="action-label">Delete</div>
      </div>

      {!isTrash && (
        <>
          <div className="action-button" onClick={() => toggleStar(mail, token, logout, onMailUpdated)}>
            {isStarred ? <MdStar size={22} /> : <MdStarBorder size={22} />}
            <div className="action-label">{isStarred ? 'Unstar' : 'Star'}</div>
          </div>

        <div
          className="action-button"
          onClick={async () => {
            await toggleRead(mail, token, logout, async (updated) => {
              if (onMailUpdated) await onMailUpdated(updated);
              alert('Marked as unread');
            });
          }}
        >
          <MdMarkEmailUnread size={22} />
          <div className="action-label">Unread</div>
        </div>


          <div className="action-button" onClick={() => handleToggleLabel('Spam')}>
            {isSpam ? <MdCheck size={22} /> : <MdReport size={22} />}
            <div className="action-label">{isSpam ? 'Not Spam' : 'Spam'}</div>
          </div>

          <div className="action-button" onClick={() => setShowLabelPicker(prev => !prev)}>
            <MdLabel size={22} />
            <div className="action-label">Labels</div>
          </div>
        </>
      )}

      {isTrash && (
        <div className="action-button" onClick={() => restoreFromTrash(mail, user, token, logout, onMailUpdated)}>
          <MdRestoreFromTrash size={22} />
          <div className="action-label">Restore</div>
        </div>
      )}

      {showLabelPicker && (
        <div ref={labelRef} className={`label-picker-popup ${document.body.classList.contains('dark') ? 'dark' : ''}`}>
          <strong>Choose Label:</strong>
          {allLabels.map(label => {
            const isAssigned = (mail.labels || []).some(l => l.id === label.id);
            const isProtected = ['sent', 'received', 'drafts', 'read', 'unread', 'trash', 'spam', 'star'].includes(label.name.toLowerCase());
            if (isProtected) return null;

            return (
              <div key={label.id} className="label-row">
                <span>{label.name}</span>
                <button
                  onClick={() => handleToggleLabel(label.name)}
                  className={`label-toggle-button ${isAssigned ? 'assigned' : 'unassigned'}`}
                >
                  {isAssigned ? 'Remove' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}