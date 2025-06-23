import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search/${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <input
      type="text"
      placeholder="Search mails..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      className="search-bar"
    />
  );
}
