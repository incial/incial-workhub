
import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
    
    // Auto dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300); // Wait for exit animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const styles = {
    success: 'bg-white border-l-4 border-emerald-500 text-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
    error: 'bg-white border-l-4 border-red-500 text-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
    info: 'bg-gray-900 border-l-4 border-blue-500 text-white shadow-xl',
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  return (
    <div 
      className={`
        flex items-center gap-4 p-4 rounded-xl min-w-[320px] max-w-md pointer-events-auto
        transform transition-all duration-300 ease-out border border-gray-100/10
        ${styles[toast.type]}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-semibold leading-relaxed tracking-wide">
        {toast.message}
      </div>
      <button 
        onClick={handleDismiss} 
        className={`p-1 rounded-full transition-colors ${toast.type === 'info' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
