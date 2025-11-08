'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Mặc định dark nếu chưa có cấu hình lưu
    const initialDark = saved ? saved === 'dark' : true;
    document.documentElement.classList.toggle('dark', initialDark);
    setIsDark(initialDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
      className="fixed top-4 right-4 z-50 rounded-md border bg-card text-card-foreground p-2 shadow-sm hover:bg-muted"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}