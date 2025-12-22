
import React, { useState } from 'react';
import { X, Lock, KeyRound, Save, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match");
        return;
    }
    
    if (formData.newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return;
    }
    
    setIsLoading(true);
    try {
        await authApi.updatePassword({ 
            currentPassword: formData.currentPassword, 
            newPassword: formData.newPassword 
        });
        showToast("Password updated successfully", "success");
        handleClose();
    } catch (e: any) {
        setError(e.message || "Failed to update password. Please check your current password.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleClose = () => {
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-600" /> Change Password
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
            </button>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Current Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input 
                            type="password" 
                            required 
                            autoFocus
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all placeholder-gray-400 font-medium"
                            placeholder="Enter current password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-2" />

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">New Password</label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input 
                            type="password" 
                            required 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all placeholder-gray-400 font-medium"
                            placeholder="Minimum 6 characters"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Confirm New Password</label>
                    <div className="relative">
                        <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input 
                            type="password" 
                            required 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all placeholder-gray-400 font-medium"
                            placeholder="Repeat new password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <>
                                <Save className="h-4 w-4" /> Update Password
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-4">
                        Secure SSL Encryption Enabled
                    </p>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
