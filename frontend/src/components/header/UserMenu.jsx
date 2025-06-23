import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import '../../styles.css';

export default function UserMenu({ user, logout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return <div className="user-avatar animate-pulse" style={{ backgroundColor: '#ccc' }} />;
  }

  const handleProfileClick = () => {
    navigate('/profile'); 
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <img
        src={user.avatarUrl}
        alt="avatar"
        onClick={() => setOpen(!open)}
        className="user-avatar"
      />
      {open && (
        <div className="user-dropdown">
          <div className="info" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm">@{user.username}</p>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
