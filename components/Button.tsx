import React from 'react';
import Loader from './Loader';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, isLoading, ...props }) => {
  return (
    <button
      {...props}
      className="w-full flex justify-center items-center bg-green-700 hover:bg-green-600 disabled:bg-green-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-900 focus:ring-green-500"
    >
      {isLoading ? <Loader /> : children}
    </button>
  );
};

export default Button;