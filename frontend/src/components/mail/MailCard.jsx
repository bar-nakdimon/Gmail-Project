import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowForward,
  MdArrowBack,
  MdStarBorder,
  MdStar,
  MdMarkEmailUnRead,
  MdMarkEmailRead,
  MdDelete,
  MdRestoreFromTrash
} from '../../icons/Icons';
import { AuthContext } from '../../contexts/AuthContext';
import {
  toggleStar,
  toggleRead,
  trashOrDelete,
  restoreFromTrash
} from '../../utils/mailActionsHelper';

import '../../styles.css';
import '../../styles/mails/MailCard.css';

export default function MailCard({ mail, onClick, onMailDeleted, onMailUpdated }) {
  const navigate = useNavigate();
  const { token, logout, user } = useContext(AuthContext);

  const [starred, setStarred] = useState(false);
  const [read, setRead] = useState(false);

  const isSent = mail.labels?.some(label => label.name?.toLowerCase() === 'sent');
  const isTrash = mail.labels?.some(label => {
    const name = typeof label === 'object' ? label.name?.toLowerCase() : label;
    return name === 'trash';
  });

  const senderOrRecipient = isSent ? mail.toUsername : mail.fromUsername;
  const directionIcon = isSent
    ? <MdArrowForward size={20} className="mail-direction-icon" title="Sent" />
    : <MdArrowBack size={20} className="mail-direction-icon" title="Received" />;

  useEffect(() => {
    const labelNames = mail.labels?.map(label =>
      typeof label === 'object' ? label.name?.toLowerCase() : label.toLowerCase()
    ) || [];
    setStarred(labelNames.includes('star'));
    setRead(labelNames.includes('read'));
  }, [mail.labels]);

  const handleStarToggle = async (e) => {
    e.stopPropagation();
    await toggleStar(mail, token, logout, (updated) => {
      setStarred(prev => !prev);
      if (onMailUpdated) onMailUpdated(updated);
    });
  };

  const handleReadToggle = async (e) => {
    e.stopPropagation();
    await toggleRead(mail, token, logout, (updated) => {
      setRead(prev => !prev);
      if (onMailUpdated) onMailUpdated(updated);
    });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await trashOrDelete(mail, token, logout, onMailDeleted);
  };

  const handleRestore = async (e) => {
    e.stopPropagation();
    await restoreFromTrash(mail, user, token, logout, onMailUpdated, onMailDeleted);
  };

  const handleClick = async () => {
    if (!read) {
      await toggleRead(mail, token, logout, (updated) => {
        setRead(true);
        if (onMailUpdated) onMailUpdated(updated);
      });
    }

    if (onClick) onClick();
    else navigate(`/mail/${mail.id}`);
  };

  return (
 <div
  className={`mail-card ${read ? 'read' : 'unread'}`}
  onClick={handleClick}
  style={{ position: 'relative', overflow: 'visible' }} 
>
  <div className="mail-icons" onClick={(e) => e.stopPropagation()}>
    {directionIcon}

    {!isTrash && (
      <>
        <div className="tooltip-container">
          <button className="icon-button" onClick={handleStarToggle}>
            {starred ? <MdStar className="mail-star starred" /> : <MdStarBorder className="mail-star" />}
          </button>
          <span className="tooltip">{starred ? 'Unstar' : 'Star'}</span>
        </div>

        <div className="tooltip-container">
          <button className="icon-button" onClick={handleReadToggle}>
            {read
              ? <MdMarkEmailUnRead className="mail-read-toggle" />
              : <MdMarkEmailRead className="mail-read-toggle" />
            }
          </button>
          <span className="tooltip">{read ? 'Mark as unread' : 'Mark as read'}</span>
        </div>
      </>
    )}

    {isTrash && (
      <div className="tooltip-container">
        <button className="icon-button" onClick={handleRestore}>
          <MdRestoreFromTrash className="mail-restore" />
        </button>
        <span className="tooltip">Restore from Trash</span>
      </div>
    )}

    <div className="tooltip-container">
      <button className="icon-button" onClick={handleDelete}>
        <MdDelete className="mail-delete" />
      </button>
      <span className="tooltip">Delete mail</span>
    </div>
  </div>

  <div className="mail-sender">{senderOrRecipient}</div>
  <div className="mail-subject">{mail.subject}</div>
  <div className="mail-time">
    {new Date(mail.timestamp).toLocaleString()}
    {mail.labels?.some(label => label.name?.toLowerCase() === 'drafts') && (
      <span className="mail-draft-label">Draft</span>
    )}
  </div>
</div>
)
}
