import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className="flex min-w-[250px] items-center gap-3 rounded-md bg-[#0a1521] border border-vscode-border p-3 text-sm shadow-xl animate-in slide-in-from-right-4 fade-in duration-300"
        >
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-green-400" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
          {toast.type === 'info' && <Info size={16} className="text-blue-400" />}
          
          <span className="flex-1 text-white">{toast.message}</span>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-vscode-text/60 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
