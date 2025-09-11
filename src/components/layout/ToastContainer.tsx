'use client';

import { useToast } from '@/contexts/ToastContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-700/80 border-green-600';
      case 'error':
        return 'bg-red-700/80 border-red-600';
      case 'warning':
        return 'bg-yellow-700/80 border-yellow-600';
      case 'info':
        return 'bg-blue-700/80 border-blue-600';
      default:
        return 'bg-gray-700/80 border-gray-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            relative flex items-center p-4 rounded-lg
            text-white shadow-lg transform transition-all duration-300
            animate-slide-in-right
            ${getToastStyles(toast.type)}
          `}
          style={{ minWidth: '300px' }}>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-white hover:text-gray-200 transition-colors">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
