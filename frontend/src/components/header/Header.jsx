import { useContext } from 'react';
import UserMenu from './UserMenu';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles.css';
import logo from '../../assets/logo.svg';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      {/* Right side – logo and text */}
      <div className="header-left">
        <img src={logo} alt="Gmail logo" />
        <span>Gmail</span>
      </div>

      {/* Center – search bar */}
      <div className="header-center">
        <SearchBar />
      </div>

      {/* Left side – theme + avatar */}
      <div className="header-right">
        <ThemeToggle />
        <UserMenu user={user} logout={logout} />
      </div>
    </header>
  );
}

