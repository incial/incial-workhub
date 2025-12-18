
import React from 'react';
import { X, User, Mail, Calendar, Trash2 } from 'lucide-react';
import { User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CustomSelect } from '../ui/CustomSelect';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onDeleteRequest: (user: UserType) => void;
  onRoleUpdate: (userId: number, newRole: string) => void;
}

const ROLE_OPTIONS = [
    { label: 'Super Admin', value: 'ROLE_SUPER_ADMIN' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Employee', value: 'ROLE_EMPLOYEE' },
    { label: 'Client', value: 'ROLE_CLIENT' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onDeleteRequest, onRoleUpdate }) => {
  const { user: currentUser } = useAuth();

  if (!isOpen || !user) return null;

  const isSelf = currentUser?.id === user.id;

  const getRoleBadge = (role: string) => {
      let styles = 'bg-gray-100 text-gray-600 border-gray-200';
      if (role === 'ROLE_SUPER_ADMIN') styles = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      if (role === 'ROLE_ADMIN') styles = 'bg-purple-50 text-purple-700 border-purple-200';
      if (role === 'ROLE_EMPLOYEE') styles = 'bg-blue-50 text-blue-700 border-blue-200';

      const label = role.replace('ROLE_', '').replace('_', ' ');
      return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${styles}`}>{label}</span>;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all scale-100 relative border border-gray-100" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button - Z-Index 50 to stay above banner */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors backdrop-blur-md"
        >
            <X className="h-5 w-5" />
        </button>

        {/* Cover Background */}
        <div className="h-48 relative bg-gradient-to-r from-brand-600 to-indigo-600 shrink-0">
            <img 
                src="/banner.png" 
                alt="Profile Banner" 
                className="w-full h-full object-cover absolute inset-0 z-10"
                onError={(e) => e.currentTarget.style.display = 'none'}
            />
            {/* Avatar - Absolute to banner but hanging off bottom */}
            <div className="absolute -bottom-12 left-8 z-30">
                <div className="h-24 w-24 rounded-3xl bg-white p-1.5 shadow-xl border border-gray-100">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-2xl object-cover bg-gray-100" />
                    ) : (
                        <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400 uppercase tracking-tighter">
                            {user.name.charAt(0)}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* User Info */}
        <div className="pt-16 pb-8 px-8">
            <div className="mb-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        <div className="mt-3">
                            {isSelf ? (
                                <div title="You cannot change your own role.">
                                    {getRoleBadge(user.role)}
                                </div>
                            ) : (
                                <div className="w-full">
                                    <CustomSelect 
                                        value={user.role}
                                        onChange={(val) => onRoleUpdate(user.id, val)}
                                        options={ROLE_OPTIONS}
                                        placeholder="Select Role"
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                        <Mail className="h-5 w-5 text-gray-400" /> 
                        <span className="font-medium">{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                        <Calendar className="h-5 w-5 text-gray-400" /> 
                        <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                        <img src="/logo.png" alt="Organisation" className="h-5 w-5 grayscale opacity-60" />
                        <span>System ID: <span className="font-mono text-xs font-bold bg-gray-200 px-2 py-0.5 rounded text-gray-600">{user.id}</span></span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
                {isSelf ? (
                    <div className="text-xs text-gray-400 italic">You cannot delete your own account.</div>
                ) : (
                    <button 
                        onClick={() => onDeleteRequest(user)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors border border-red-100"
                    >
                        <Trash2 className="h-4 w-4" /> Delete User
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
