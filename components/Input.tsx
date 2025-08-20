import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={props.id || props.name} className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-slate-50 dark:bg-gray-700/50 border border-slate-300 dark:border-green-800 rounded-md px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition duration-200"
      />
    </div>
  );
};

export default Input;