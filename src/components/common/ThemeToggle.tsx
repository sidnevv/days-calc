'use client';

import { useEffect, useState } from 'react';

import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialIsDark = savedTheme ? savedTheme === 'dark' : systemIsDark;

    setIsDark(initialIsDark);
    document.documentElement.classList.toggle('dark', initialIsDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-2.5 py-1.5 cursor-pointer rounded-xl shadow-lg border border-gray-700  bg-gray-800 hover:bg-gray-800/80 transition-all duration-300 hover:shadow-md text-center"
      title={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}>
      {isDark ? (
        <span className="w-5 h-5 cursor-pointer">
          <Sun />
        </span>
      ) : (
        <span className="w-5 h-5 cursor-pointer">
          <Moon />︎
        </span>
      )}
    </button>
  );
}
