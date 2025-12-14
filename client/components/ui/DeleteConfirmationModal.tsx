
import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-6" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <div className="mt-2 text-sm text-gray-500">
                    <p>{message}</p>
                    {itemName && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 font-medium text-gray-700 break-all">
                            "{itemName}"
                        </div>
                    )}
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
            </button>
        </div>

        <div className="flex justify-end gap-3 mt-8">
            <button 
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={onConfirm}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 transition-colors"
            >
                <Trash2 className="h-4 w-4" />
                Delete
            </button>
        </div>
      </div>
    </div>
  );
};
