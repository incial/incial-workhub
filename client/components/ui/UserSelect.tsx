import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, User as UserIcon } from 'lucide-react';
import { User } from '../../types';
import { createPortal } from 'react-dom';

interface UserSelectProps {
  label?: string;
  value: string | number; // Can be ID or Name (legacy)
  onChange: (value: any, name?: string) => void; // Pass back both ID and Name
  users: User[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const UserSelect: React.FC<UserSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  users, 
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

  // Determine selected user based on ID (number) or Name (string)
  const selectedUser = useMemo(() => {
      if (typeof value === 'number') {
          return users.find(u => u.id === value);
      }
      return users.find(u => u.name === value);
  }, [users, value]);

  const displayValue = selectedUser ? selectedUser.name : (value === 'Unassigned' || !value ? 'Unassigned' : value.toString());

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
        const portal = document.getElementById('user-select-portal-menu');
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

  const menuContent = isOpen && (
    <div 
        id="user-select-portal-menu"
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
            <button
                type="button"
                onClick={() => { onChange('Unassigned', 'Unassigned'); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${displayValue === 'Unassigned' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
            >
                <div className="h-9 w-9 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:border-brand-300 group-hover:text-brand-500 transition-colors">
                    <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start"><span className="text-sm font-bold text-gray-500 group-hover:text-gray-700">Unassigned</span></div>
                {displayValue === 'Unassigned' && <Check className="h-4 w-4 text-gray-400 ml-auto" />}
            </button>

            <div className="h-px bg-gray-100 my-1 mx-2" />

            {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                    <button
                        key={u.id}
                        type="button"
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            // Return ID as the primary value, and Name as secondary
                            onChange(u.id, u.name); 
                            setIsOpen(false); 
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${displayValue === u.name ? 'bg-brand-50 ring-1 ring-brand-100' : 'hover:bg-gray-50'}`}
                    >
                        {renderAvatar(u, 'md')}
                        <div className="flex flex-col items-start min-w-0">
                            <span className={`text-sm font-bold truncate ${displayValue === u.name ? 'text-brand-900' : 'text-gray-700'}`}>{u.name}</span>
                            <span className="text-[10px] text-gray-400 truncate max-w-[160px]">{u.email}</span>
                        </div>
                        {displayValue === u.name && <div className="ml-auto bg-brand-600 rounded-full p-0.5"><Check className="h-3 w-3 text-white" /></div>}
                    </button>
                ))
            ) : <div className="py-8 text-center"><p className="text-xs text-gray-400 font-medium">No team members found.</p></div>}
        </div>
        
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 font-medium text-center">Showing {filteredUsers.length} members</div>
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
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-xl text-sm transition-all duration-300 outline-none group ${isOpen ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-lg' : 'border-gray-200 hover:border-brand-300 hover:shadow-md'}`}
      >
        <div className="flex items-center gap-3 truncate">
            {selectedUser ? (
                <>
                    {renderAvatar(selectedUser)}
                    <span className="font-bold text-gray-900 leading-none">{selectedUser.name}</span>
                </>
            ) : (
                <span className="text-gray-400 font-medium flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300"><UserIcon className="h-3 w-3 text-gray-400" /></div>
                    {displayValue !== 'Unassigned' ? displayValue : placeholder}
                </span>
            )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-600' : 'group-hover:text-gray-600'}`} />
      </button>
      {isOpen && createPortal(menuContent, document.body)}
    </div>
  );
};