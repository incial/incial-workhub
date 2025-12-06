
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, LogOut, ChevronDown, User, Settings, CreditCard, Menu, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 transition-all">
      
      {/* Mobile Menu Trigger (Visual only) */}
      <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
        <Menu className="h-6 w-6" />
      </button>

      {/* Search Bar - Global */}
      <div className="relative w-full max-w-md hidden md:block group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="h-4.5 w-4.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
        </span>
        <input
          type="text"
          placeholder="Search for anything..."
          className="w-full pl-11 pr-14 py-2.5 bg-gray-50 border border-transparent hover:border-gray-200 focus:border-brand-500 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all duration-300"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 shadow-sm">⌘ K</span>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 lg:gap-6 ml-auto">
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${isNotifOpen ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            >
                <Bell className="h-5.5 w-5.5" />
                <span className="absolute top-2.5 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-white ring-1 ring-white"></span>
            </button>
            
            {/* Notifications Dropdown */}
            {isNotifOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        <span className="text-xs font-medium text-brand-600 cursor-pointer hover:underline">Mark all read</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                         <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium">New lead assigned</p>
                                    <p className="text-xs text-gray-500 mt-0.5">John Doe assigned "Acme Corp" to you.</p>
                                    <p className="text-[10px] text-gray-400 mt-1">2 min ago</p>
                                </div>
                            </div>
                         </div>
                         <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                    <Check className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium">Task Completed</p>
                                    <p className="text-xs text-gray-500 mt-0.5">"Website Redesign" marked as done.</p>
                                    <p className="text-[10px] text-gray-400 mt-1">1 hour ago</p>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
                        <button className="text-xs font-semibold text-gray-500 hover:text-brand-600 transition-colors">View all notifications</button>
                    </div>
                </div>
            )}
        </div>
        
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
            <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group outline-none"
            >
                <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="hidden sm:block">
                    <span className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-brand-600 transition-colors">{user?.name}</span>
                </div>
                
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="p-2 border-b border-gray-50">
                        <div className="px-3 py-2 bg-gray-50 rounded-xl">
                             <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                             <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-brand-600 transition-colors group">
                            <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-brand-100 text-gray-500 group-hover:text-brand-600 transition-colors">
                                <User className="h-4 w-4" />
                            </div>
                            My Profile
                        </button>
                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-brand-600 transition-colors group">
                             <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-brand-100 text-gray-500 group-hover:text-brand-600 transition-colors">
                                <Settings className="h-4 w-4" />
                            </div>
                            Settings
                        </button>
                         <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-brand-600 transition-colors group">
                             <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-brand-100 text-gray-500 group-hover:text-brand-600 transition-colors">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            Billing
                        </button>
                    </div>
                    <div className="p-1.5 border-t border-gray-50">
                        <button 
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 text-red-500 transition-colors">
                                <LogOut className="h-4 w-4" />
                            </div>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};
