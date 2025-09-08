import React from 'react';

interface AuthLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ size = 'md', text = 'Авторизация...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="bg-gray-700 rounded-lg p-6 flex flex-col items-center space-y-4">
        <div
          className={`${sizeClasses[size]} border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin`}
        ></div>
        {text && <p className="text-gray-200 font-medium">{text}</p>}
      </div>
    </div>
  );
};

export default AuthLoader;
