import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowForward,
  MdArrowBack,
  MdStarBorder,
  MdStar,
  MdMailOutline,
  MdMarkEmailRead,
  MdDelete,
  MdRestoreFromTrash
} from 'react-icons/md';
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

  const starIcon = !isTrash && (
    starred
      ? <MdStar size={20} className="mail-star starred" title="Unstar" onClick={handleStarToggle} />
      : <MdStarBorder size={20} className="mail-star" title="Star" onClick={handleStarToggle} />
  );

  const readToggleIcon = read
    ? <MdMarkEmailRead size={20} className="mail-read-toggle" title="Mark as unread" onClick={handleReadToggle} />
    : <MdMailOutline size={20} className="mail-read-toggle" title="Mark as read" onClick={handleReadToggle} />;

  const deleteIcon = <MdDelete size={20} className="mail-delete" title="Delete mail" onClick={handleDelete} />;
  const restoreIcon = isTrash && (
    <MdRestoreFromTrash size={20} className="mail-restore" title="Restore from Trash" onClick={handleRestore} />
  );

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
    >
      <div className="mail-icons">
        {directionIcon}
        {starIcon}
        {readToggleIcon}
        {restoreIcon}
        {deleteIcon}
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
  );
}
