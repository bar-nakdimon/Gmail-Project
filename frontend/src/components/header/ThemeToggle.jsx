import React, { useEffect, useState } from 'react';
import '../../styles.css';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const body = document.body;
    if (dark) {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="theme-toggle"
      title="Toggle theme"
    >
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
