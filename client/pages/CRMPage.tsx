import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CRMFilters } from '../components/crm/CRMFilters';
import { CRMStats } from '../components/crm/CRMStats';
import { CRMForm } from '../components/crm/CRMForm';
import { CRMTable } from '../components/crm/CRMTable';
import { FilterState, CRMEntry, CRMStatus } from '../types';
import { Plus } from 'lucide-react';
import { crmApi, usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLayout } from '../context/LayoutContext';

export const CRMPage: React.FC = () => {
  const { isSidebarCollapsed } = useLayout();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<CRMEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CRMEntry | undefined>(undefined);
  const [userAvatarMap, setUserAvatarMap] = useState<Record<string, string>>({});
  
  const [filters, setFilters] = useState<FilterState>({
    status: '', assignedTo: '', search: '', dateRangeStart: '', dateRangeEnd: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [crmResponse, usersData] = await Promise.all([
        crmApi.getAll(),
        usersApi.getAll()
      ]);
      setEntries(crmResponse.crmList);

      const uMap: Record<string, string> = {};
      usersData.forEach(u => { if (u.avatarUrl) uMap[u.name] = u.avatarUrl; });
      setUserAvatarMap(uMap);

    } catch (e) { showToast("Sync connection failed.", 'error'); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = useMemo(() => {
    return entries.filter(item => {
      const matchesSearch = filters.search === '' || 
        (item.company || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.contactName || '').toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'ALL' ? true : 
                         filters.status === '' ? !['drop', 'completed', 'onboarded'].includes(item.status) : 
                         item.status === filters.status;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.id - a.id);
  }, [entries, filters]);

  const handleSave = async (data: Partial<CRMEntry>) => {
      try {
          if (editingEntry) {
              await crmApi.update(editingEntry.id, data);
              showToast("Identity synchronized.", 'success');
          } else {
              await crmApi.create(data as CRMEntry);
              showToast("New deal deployed.", 'success');
          }
          fetchData();
      } catch (e) { showToast("Action failed.", 'error'); }
  };

  const handleStatusChange = async (entry: CRMEntry, newStatus: CRMStatus) => {
    try {
      await crmApi.update(entry.id, { status: newStatus });
      fetchData();
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (e) { showToast("Update failed", 'error'); }
  };

  const handleDelete = async (id: number) => {
      if(!confirm("Are you sure?")) return;
      try { await crmApi.delete(id); showToast("Deal purged.", 'success'); fetchData(); }
      catch(e) { showToast("Purge failed.", 'error'); }
  };

  return (
    <div className="flex min-h-screen mesh-bg relative">
      <div className="glass-canvas" />
      <Sidebar />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
        <Navbar />
        
        <div className="px-4 lg:px-12 py-6 lg:py-10 pb-32">
          
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 lg:gap-8 mb-8 lg:mb-12 animate-premium">
             <div>
                <h1 className="text-4xl lg:text-7xl font-black text-slate-950 tracking-tighter leading-none display-text">Market Engine.</h1>
                <p className="text-slate-500 text-sm lg:text-lg mt-2 lg:mt-4 font-medium">Manage your global lead pipeline with precision.</p>
             </div>
             
             <button 
                onClick={() => { setEditingEntry(undefined); setIsModalOpen(true); }}
                className="bg-slate-950 hover:bg-slate-900 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl lg:rounded-3xl flex items-center justify-center gap-3 lg:gap-4 font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all w-full sm:w-auto text-xs lg:text-sm"
             >
                <Plus className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-400" /> Initialize Deal
             </button>
          </div>

          <CRMStats entries={entries} />

          <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] lg:rounded-[3rem] border border-white/60 shadow-xl flex flex-col mb-12 overflow-hidden">
            <CRMFilters filters={filters} setFilters={setFilters} onRefresh={fetchData} />
            
            <div className="pt-4 pb-10 overflow-x-auto">
                <CRMTable 
                    data={filteredData} 
                    isLoading={isLoading} 
                    userAvatarMap={userAvatarMap}
                    onView={(e) => { setEditingEntry(e); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                />
            </div>
            
            <div className="p-4 lg:p-5 border-t border-white/40 bg-white/20 text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex justify-between rounded-b-[2rem] lg:rounded-b-[3rem]">
                <span>System Index: Active</span>
                <span>Registry Records: {filteredData.length}</span>
            </div>
          </div>
        </div>

        <CRMForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} initialData={editingEntry} />
      </div>
    </div>
  );
};