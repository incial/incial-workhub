import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CompaniesTable } from '../components/companies/CompaniesTable';
import { CompaniesFilters } from '../components/companies/CompaniesFilters';
import { CompanyDetailsModal } from '../components/companies/CompanyDetailsModal';
import { CompaniesForm } from '../components/companies/CompaniesForm';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CRMEntry, CompanyFilterState, CRMStatus } from '../types';
import { companiesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLayout } from '../context/LayoutContext';

export const CompaniesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isSidebarCollapsed } = useLayout();
  const [crmEntries, setCrmEntries] = useState<CRMEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'dropped' | 'past'>('active');
  const [viewingCompany, setViewingCompany] = useState<CRMEntry | undefined>(undefined);
  const [editingCompany, setEditingCompany] = useState<CRMEntry | undefined>(undefined);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Track which tabs have been loaded to avoid duplicate calls
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['active']));

  const [filters, setFilters] = useState<CompanyFilterState>({
    search: '',
    status: '',
    workType: ''
  });

  const fetchDataForTab = async (tab: 'active' | 'dropped' | 'past') => {
    setIsLoading(true);
    try {
      let data: CRMEntry[];
      
      switch (tab) {
        case 'active':
          data = await companiesApi.getOnboarded();
          break;
        case 'dropped':
          data = await companiesApi.getClosed();
          break;
        case 'past':
          data = await companiesApi.getDone();
          break;
        default:
          data = [];
      }
      
      setCrmEntries(data);
      setLoadedTabs(prev => new Set(prev).add(tab));
    } catch (error) {
      console.error("Failed to fetch data", error);
      showToast("Failed to load companies", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load - fetch only onboarded (active) companies
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchDataForTab('active');
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  // Handle tab changes - fetch data only if not already loaded
  useEffect(() => {
    if (!loadedTabs.has(activeTab)) {
      fetchDataForTab(activeTab);
    }
  }, [activeTab]);

  // No need for categorization - data comes pre-filtered from backend
  const displayData = useMemo(() => {
    let result = crmEntries.filter(item => {
      const matchesSearch = filters.search === '' || 
        (item.company || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.contactName && item.contactName.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.referenceId && item.referenceId.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = filters.status === '' || item.status === filters.status;
      const matchesWork = filters.workType === '' || item.work.includes(filters.workType);

      return matchesSearch && matchesStatus && matchesWork;
    });

    return result.sort((a, b) => b.id - a.id);
  }, [crmEntries, filters]);

  const handleEdit = (company: CRMEntry) => {
      setEditingCompany(company);
      setIsViewModalOpen(false);
      setIsEditModalOpen(true);
  };

  const handleUpdateCompany = async (updatedData: Partial<CRMEntry>) => {
      if (editingCompany) {
          const updatedEntry: CRMEntry = {
              ...editingCompany,
              ...updatedData,
              lastUpdatedBy: user?.name || 'Unknown',
              lastUpdatedAt: new Date().toISOString()
          };
          setCrmEntries(crmEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
          setIsEditModalOpen(false);
          try {
            await companiesApi.update(updatedEntry.id, updatedEntry);
            showToast("Company details updated", "success");
            // Refresh current tab data
            await fetchDataForTab(activeTab);
          } catch(e) {
            await fetchDataForTab(activeTab);
            showToast("Failed to update company", "error");
          }
      }
  };

  const handleStatusChange = async (company: CRMEntry, newStatus: CRMStatus) => {
      const updatedEntry = {
          ...company,
          status: newStatus,
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };
      setCrmEntries(prev => prev.map(e => e.id === company.id ? updatedEntry : e));
      try {
          await companiesApi.update(company.id, updatedEntry);
          showToast(`Status updated to ${newStatus}`, "success");
          
          // Status change may move company to different tab
          // Clear loaded tabs cache to force refresh when switching tabs
          setLoadedTabs(new Set([activeTab]));
          
          // Refresh current tab to reflect changes
          await fetchDataForTab(activeTab);
      } catch (e) {
          await fetchDataForTab(activeTab);
          showToast("Failed to update status", "error");
      }
  };

  const handleView = (company: CRMEntry) => {
      setViewingCompany(company);
      setIsViewModalOpen(true);
  };

  const confirmDelete = async () => {
      if(!deleteId) return;
      setCrmEntries(crmEntries.filter(e => e.id !== deleteId));
      setDeleteId(null);
      showToast("Company removed from registry", "info");
  };

  return (
    <div className="flex min-h-screen mesh-bg relative">
      <div className="glass-canvas" />
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
        <Navbar />
        
        <div className="px-4 lg:px-12 py-6 lg:py-10 pb-32">
          
          <div className="mb-8 lg:mb-12 animate-premium">
              <div className="flex items-center gap-3 mb-2 lg:mb-4">
                   <div className="h-1.5 lg:h-2 w-1.5 lg:w-2 rounded-full bg-indigo-500 animate-pulse" />
                   <span className="text-[9px] lg:text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em]">Central Registry</span>
              </div>
              <h1 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none display-text">Registry.</h1>
          </div>

          <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] lg:rounded-[3rem] border border-white/60 shadow-xl flex flex-col mb-12 overflow-hidden">
            
            <div className="px-4 lg:px-8 pt-4 lg:pt-8 pb-4 border-b border-gray-100 bg-white/20 rounded-t-[2rem] lg:rounded-t-[3rem]">
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/40 rounded-xl lg:rounded-2xl w-full sm:w-fit border border-white/60">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === 'active' 
                            ? 'bg-white text-brand-700 shadow-sm border border-gray-100' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Active Focus
                        {activeTab === 'active' && <span className="ml-2 px-1.5 lg:px-2 py-0.5 rounded bg-brand-50 text-brand-600 text-[9px] lg:text-[10px]">{crmEntries.length}</span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === 'past' 
                            ? 'bg-white text-brand-700 shadow-sm border border-gray-100' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Historical
                        {activeTab === 'past' && <span className="ml-2 px-1.5 lg:px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] lg:text-[10px]">{crmEntries.length}</span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('dropped')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === 'dropped' 
                            ? 'bg-white text-brand-700 shadow-sm border border-gray-100' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Archived
                        {activeTab === 'dropped' && <span className="ml-2 px-1.5 lg:px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] lg:text-[10px]">{crmEntries.length}</span>}
                    </button>
                </div>
            </div>

            <CompaniesFilters filters={filters} setFilters={setFilters} onRefresh={() => fetchDataForTab(activeTab)} />
            
            <div className="pt-4 pb-10 overflow-x-auto">
                <CompaniesTable 
                    data={displayData} 
                    isLoading={isLoading} 
                    onView={handleView}
                    onStatusChange={handleStatusChange}
                />
            </div>
            
            <div className="p-4 lg:p-6 border-t border-white/40 bg-white/20 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex justify-between rounded-b-[2rem] lg:rounded-b-[3rem]">
                <span>System Index: Optimized</span>
                <span>Entities in view: {displayData.length}</span>
            </div>
          </div>
        </div>

        <CompanyDetailsModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} onEdit={handleEdit} company={viewingCompany} />
        <CompaniesForm 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onSubmit={handleUpdateCompany} 
            initialData={editingCompany} 
            onDelete={(id) => {
                setIsEditModalOpen(false);
                setDeleteId(id);
            }}
        />
        <DeleteConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Purge Identity" message="This action will remove the client from the active registry." />
      </div>
    </div>
  );
};