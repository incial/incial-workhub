import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20 transition-all">
      {/* Search Bar - Global */}
      <div className="relative w-96 hidden md:block group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
        </span>
        <input
          type="text"
          placeholder="Search Deals, Contacts..."
          className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all shadow-sm"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-xl transition-all duration-200 group">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200/60"></div>

        <div className="flex items-center gap-4 pl-2">
            <div className="flex flex-col text-right hidden sm:block">
                <span className="text-sm font-bold text-gray-800 tracking-tight">{user?.name}</span>
                <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">{user?.role?.replace('ROLE_', '')}</span>
            </div>
            
            <div className="relative group cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-100 to-indigo-100 flex items-center justify-center text-brand-700 font-bold border border-white shadow-md ring-2 ring-transparent group-hover:ring-brand-100 transition-all">
                    {user?.name?.charAt(0)}
                </div>
            </div>

            <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
            >
                <LogOut className="h-4 w-4" />
            </button>
        </div>
      </div>
    </header>
  );
};