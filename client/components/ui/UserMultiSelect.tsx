import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, User as UserIcon, X } from 'lucide-react';
import { User } from '../../types';
import { createPortal } from 'react-dom';

interface UserMultiSelectProps {
  label?: string;
  value: string[]; // Array of user emails
  onChange: (emails: string[]) => void;
  users: User[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const UserMultiSelect: React.FC<UserMultiSelectProps> = ({ 
  label, 
  value = [], 
  onChange, 
  users = [], 
  placeholder = "Assign to...",
  className = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected users from emails
  const selectedUsers = useMemo(() => {
    return users.filter(u => value.includes(u.email));
  }, [users, value]);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 320)
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portal = document.getElementById('user-multi-select-portal-menu');
        if (portal && portal.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch('');
    }
    
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const renderAvatar = (u: User | undefined, size: 'sm' | 'md' = 'sm') => {
    const sizeClasses = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-9 w-9 text-xs';
    if (u?.avatarUrl) return <img src={u.avatarUrl} alt={u.name} referrerPolicy="no-referrer" className={`${sizeClasses} rounded-full object-cover border border-gray-200`} />;
    const initials = u?.name ? u.name.slice(0, 2).toUpperCase() : '??';
    return <div className={`${sizeClasses} rounded-full flex items-center justify-center font-bold bg-indigo-50 text-indigo-600 border border-white/50 shadow-sm`}>{initials}</div>;
  };

  const toggleUser = (userEmail: string) => {
    if (value.includes(userEmail)) {
      onChange(value.filter(email => email !== userEmail));
    } else {
      onChange([...value, userEmail]);
    }
  };

  const removeUser = (userEmail: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(email => email !== userEmail));
  };

  const menuContent = isOpen && (
    <div 
      id="user-multi-select-portal-menu"
      className="fixed z-[9999] bg-white border border-gray-100/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5"
      style={{ top: coords.top, left: coords.left, width: coords.width }}
    >
      <div className="p-3 border-b border-gray-100 bg-gray-50/50 backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            ref={inputRef}
            type="text" 
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-gray-400"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-2 space-y-1 bg-white">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => {
            const isSelected = value.includes(u.email);
            return (
              <button
                key={u.id}
                type="button"
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation();
                  toggleUser(u.email);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${isSelected ? 'bg-brand-50 ring-1 ring-brand-100' : 'hover:bg-gray-50'}`}
              >
                {renderAvatar(u, 'md')}
                <div className="flex flex-col items-start min-w-0">
                  <span className={`text-sm font-bold truncate ${isSelected ? 'text-brand-900' : 'text-gray-700'}`}>{u.name}</span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[160px]">{u.email}</span>
                </div>
                {isSelected && <div className="ml-auto bg-brand-600 rounded-full p-0.5"><Check className="h-3 w-3 text-white" /></div>}
              </button>
            );
          })
        ) : <div className="py-8 text-center"><p className="text-xs text-gray-400 font-medium">No team members found.</p></div>}
      </div>
      
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 font-medium text-center">
        {selectedUsers.length} selected • {filteredUsers.length} available
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{label} {required && <span className="text-rose-500">*</span>}</label>}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !isOpen && setIsOpen(true)}
        onMouseDown={(e) => {
          if (isOpen) {
            e.preventDefault();
            setIsOpen(false);
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-xl text-sm transition-all duration-300 outline-none group min-h-[42px] ${isOpen ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-lg' : 'border-gray-200 hover:border-brand-300 hover:shadow-md'}`}
      >
        <div className="flex items-center gap-2 flex-wrap truncate flex-1">
          {selectedUsers.length > 0 ? (
            selectedUsers.map(u => (
              <span key={u.id} className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-2 py-1 rounded-lg text-xs font-bold">
                {renderAvatar(u, 'sm')}
                {u.name}
                <button
                  type="button"
                  onClick={(e) => removeUser(u.email, e)}
                  className="hover:bg-brand-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 font-medium flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                <UserIcon className="h-3 w-3 text-gray-400" />
              </div>
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ml-2 flex-shrink-0 ${isOpen ? 'rotate-180 text-brand-600' : 'group-hover:text-gray-600'}`} />
      </button>
      {isOpen && createPortal(menuContent, document.body)}
    </div>
  );
};
