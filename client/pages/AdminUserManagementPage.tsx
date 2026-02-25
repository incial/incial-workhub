
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { usersApi } from '../services/api';
import { User, UserRole } from '../types';
import { Plus, Search, ChevronRight, Shield, User as UserIcon, Mail, Settings } from 'lucide-react';
import { CreateUserModal } from '../components/admin/CreateUserModal';
import { UserProfileModal } from '../components/admin/UserProfileModal';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useToast } from '../context/ToastContext';
import { useLayout } from '../context/LayoutContext';
import { useAuth } from '../context/AuthContext';

const ROLE_FILTER_OPTIONS = [
    { label: 'All Roles', value: '' },
    { label: 'Super Admin', value: 'ROLE_SUPER_ADMIN' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Employee', value: 'ROLE_EMPLOYEE' },
    { label: 'Client', value: 'ROLE_CLIENT' },
];

const ROLE_PRIORITY: Record<string, number> = {
    'ROLE_SUPER_ADMIN': 1,
    'ROLE_ADMIN': 2,
    'ROLE_EMPLOYEE': 3,
    'ROLE_CLIENT': 4
};

export const AdminUserManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const { isSidebarCollapsed } = useLayout();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const data = await usersApi.getAll();
        setUsers(data);
    } catch (e) {
        console.error("Failed to fetch users", e);
        showToast("Failed to load users", "error");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchUsers();
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name && u.name.toLowerCase().includes(search.toLowerCase())) || 
                          (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = filterRole === '' || u.role === filterRole;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
      const priorityA = ROLE_PRIORITY[a.role] || 99;
      const priorityB = ROLE_PRIORITY[b.role] || 99;
      
      if (priorityA !== priorityB) {
          return priorityA - priorityB;
      }
      return a.name.localeCompare(b.name);
  });

  const handleDeleteUser = async () => {
      if (!userToDelete) return;
      try {
          await usersApi.delete(userToDelete.id);
          showToast(`User ${userToDelete.name} deleted`, "success");
          fetchUsers();
      } catch (e) {
          showToast("Purge failed", "error");
      }
      setUserToDelete(null);
  };

  const handleRoleUpdate = async (userId: number, newRole: string) => {
      try {
          await usersApi.update(userId, { 
              role: newRole as UserRole,
              lastUpdatedBy: currentUser?.name || 'Admin',
              lastUpdatedAt: new Date().toISOString()
          });
          showToast("Identity permission updated", "success");
          fetchUsers();
      } catch (e) {
          showToast("Update failed", "error");
      }
  };

  return (
    <div className="flex min-h-screen mesh-bg relative">
      <div className="glass-canvas" />
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
        <Navbar />
        
        <div className="px-4 lg:px-12 py-6 lg:py-10 pb-32">
           <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 lg:gap-8 mb-8 lg:mb-16 animate-premium">
             <div>
                <div className="flex items-center gap-3 mb-2 lg:mb-4">
                     <div className="h-1.5 lg:h-2 w-1.5 lg:w-2 rounded-full bg-brand-500 animate-pulse" />
                     <span className="text-[9px] lg:text-[10px] font-black text-brand-600 uppercase tracking-[0.5em]">Identity Management</span>
                </div>
                <h1 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none display-text">Directory.</h1>
                <p className="text-sm lg:text-lg text-slate-500 mt-2 lg:mt-6 font-medium max-w-xl">Global access control and team synchronisation nexus.</p>
             </div>
             
             <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-slate-950 hover:bg-slate-900 text-white px-6 lg:px-10 py-3 lg:py-5 rounded-2xl lg:rounded-[2rem] flex items-center justify-center gap-3 lg:gap-4 font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all w-full sm:w-auto text-xs lg:text-sm"
             >
                <Plus className="h-5 w-5 text-brand-400" /> New Identity
             </button>
           </div>

           <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] lg:rounded-[3rem] border border-white/60 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
               <div className="p-4 lg:p-6 border-b border-gray-100 bg-white/40 flex flex-col sm:flex-row gap-4 lg:gap-6 justify-between items-start sm:items-center">
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 h-4 lg:h-5 w-4 lg:w-5 text-gray-300 group-focus-within:text-brand-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find team members..." 
                            className="w-full pl-12 lg:pl-16 pr-6 py-3 lg:py-4 bg-white border border-gray-200 rounded-xl lg:rounded-2xl text-xs lg:text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-bold shadow-inner"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="w-full sm:w-64">
                        <CustomSelect 
                            value={filterRole}
                            onChange={(val) => setFilterRole(val)}
                            options={ROLE_FILTER_OPTIONS}
                            placeholder="Global Permission"
                            className="w-full"
                        />
                    </div>
               </div>

               <div className="flex-1 overflow-x-auto custom-scrollbar">
                   {isLoading ? (
                       <div className="p-32 flex justify-center flex-col items-center gap-6">
                           <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-brand-600" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Directory...</p>
                       </div>
                   ) : (
                       <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                           <thead>
                               <tr className="border-b border-gray-100/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white/20">
                                   <th className="px-6 lg:px-8 py-4 lg:py-6">Identity</th>
                                   <th className="px-6 lg:px-8 py-4 lg:py-6">Access Role</th>
                                   <th className="px-6 lg:px-8 py-4 lg:py-6">System ID</th>
                                   <th className="px-6 lg:px-8 py-4 lg:py-6 text-right">Actions</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50/50">
                               {filteredUsers.map(user => (
                                   <tr 
                                       key={user.id} 
                                       onClick={() => setSelectedUser(user)}
                                       className="group hover:bg-white/60 transition-all duration-200 cursor-pointer"
                                   >
                                       <td className="px-6 lg:px-8 py-4 lg:py-5">
                                           <div className="flex items-center gap-4 lg:gap-6">
                                               <div className="h-10 lg:h-12 w-10 lg:w-12 rounded-xl lg:rounded-2xl bg-white p-0.5 shadow-sm border border-slate-100 shrink-0 overflow-hidden">
                                                   {user.avatarUrl ? (
                                                       <img src={user.avatarUrl} className="h-full w-full object-cover rounded-xl" alt={user.name} />
                                                   ) : (
                                                       <div className="h-full w-full rounded-xl bg-slate-50 flex items-center justify-center text-xs lg:text-sm font-black text-slate-400 uppercase">
                                                           {user.name.charAt(0)}
                                                       </div>
                                                   )}
                                               </div>
                                               <div>
                                                   <p className="font-bold text-slate-900 text-sm lg:text-base group-hover:text-brand-600 transition-colors">{user.name}</p>
                                                   <p className="text-[10px] lg:text-xs text-slate-500 font-medium">{user.email}</p>
                                               </div>
                                           </div>
                                       </td>
                                       <td className="px-6 lg:px-8 py-4 lg:py-5">
                                           <span className={`inline-flex items-center px-3 lg:px-4 py-1 lg:py-1.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest border ${
                                               user.role === 'ROLE_SUPER_ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                               user.role === 'ROLE_ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                               user.role === 'ROLE_CLIENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                               'bg-slate-50 text-slate-600 border-slate-100'
                                           }`}>
                                               {user.role ? user.role.replace('ROLE_', '').replace('_', ' ') : 'Unknown'}
                                           </span>
                                       </td>
                                       <td className="px-6 lg:px-8 py-4 lg:py-5">
                                           <span className="font-mono text-[10px] lg:text-xs font-bold text-slate-400 bg-slate-50/50 px-2 py-1 rounded border border-slate-100/50">
                                               INC-{(user.id || 0).toString().padStart(6, '0')}
                                           </span>
                                       </td>
                                       <td className="px-6 lg:px-8 py-4 lg:py-5 text-right">
                                           <div className="inline-flex items-center justify-center h-8 lg:h-10 w-8 lg:w-10 rounded-xl lg:rounded-2xl text-slate-300 group-hover:bg-white group-hover:text-brand-600 group-hover:shadow-md border border-transparent group-hover:border-slate-100 transition-all">
                                               <ChevronRight className="h-4 lg:h-5 w-4 lg:w-5" />
                                           </div>
                                       </td>
                                   </tr>
                               ))}
                               {filteredUsers.length === 0 && (
                                   <tr>
                                       <td colSpan={4} className="py-32 text-center">
                                           <div className="flex flex-col items-center gap-4">
                                               <div className="h-16 w-16 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100">
                                                   <Search className="h-8 w-8 text-slate-300" />
                                               </div>
                                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No matching identities found</p>
                                           </div>
                                       </td>
                                   </tr>
                               )}
                           </tbody>
                       </table>
                   )}
               </div>
           </div>
        </div>

        <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchUsers} />
        <UserProfileModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} onDeleteRequest={(u) => setUserToDelete(u)} onRoleUpdate={handleRoleUpdate} />
        <DeleteConfirmationModal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleDeleteUser} title="Purge Identity" itemName={userToDelete?.email} />
      </div>
    </div>
  );
};
