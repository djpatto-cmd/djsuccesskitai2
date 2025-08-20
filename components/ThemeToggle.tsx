import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-900 focus:ring-green-500 transition-all duration-300"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <SunIcon
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            theme === 'light' ? 'opacity-100 transform scale-100 rotate-0' : 'opacity-0 transform scale-50 -rotate-90'
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            theme === 'dark' ? 'opacity-100 transform scale-100 rotate-0' : 'opacity-0 transform scale-50 rotate-90'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
