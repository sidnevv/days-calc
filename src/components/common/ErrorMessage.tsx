import React from 'react';

interface ErrorMessageProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  children?: React.ReactNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title, message, icon, action, children }) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
    danger: 'bg-rose-600 hover:bg-red-700',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-700 rounded-xl shadow-lg p-6 max-w-md w-full text-center">
        {icon && (
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-200 mb-2">{title}</h2>
        <p className="text-gray-100 mb-4">{message}</p>
        {children}
        {action && (
          <button
            onClick={action.onClick}
            className={`${variantClasses[action.variant || 'primary']} text-white font-medium py-2 px-4 rounded-lg transition-colors`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
