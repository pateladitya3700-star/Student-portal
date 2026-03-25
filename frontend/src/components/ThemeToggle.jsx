import React, { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        backgroundColor: 'var(--surface-primary)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: 'var(--text-sm)',
        transition: 'var(--transition-base)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontWeight: 'var(--font-medium)'
      }}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span style={{ fontSize: '18px' }}>{isDark ? '🌙' : '☀️'}</span>
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
