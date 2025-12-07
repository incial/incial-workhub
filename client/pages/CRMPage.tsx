
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CRMFilters } from '../components/crm/CRMFilters';
import { CRMTable } from '../components/crm/CRMTable';
import { CRMStats } from '../components/crm/CRMStats';
import { CRMForm } from '../components/crm/CRMForm';
import { FilterState, CRMEntry } from '../types';
import { Plus } from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CRMPage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CRMEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CRMEntry | undefined>(undefined);
  
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    assignedTo: '',
    search: '',
    dateRangeStart: '',
    dateRangeEnd: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await crmApi.getAll();
      setEntries(response.crmList);
      // In a real app with localStorage persistence for demo:
      localStorage.setItem('mock_crm_data', JSON.stringify(response.crmList));
    } catch (error) {
      console.error("Failed to fetch CRM data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Client-side Filtering
  const filteredData = useMemo(() => {
    return entries.filter(item => {
      const matchesSearch = filters.search === '' || 
        item.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.contactName.toLowerCase().includes(filters.search.toLowerCase());
      
      // Default View (filters.status === ''): Show only Active Pipeline (exclude closed/won/lost)
      // Specific View: Show matches
      const matchesStatus = filters.status !== '' 
        ? item.status === filters.status 
        : !['onboarded', 'drop', 'completed'].includes(item.status);

      const matchesAssigned = filters.assignedTo === '' || item.assignedTo === filters.assignedTo;
      
      const matchesDate = filters.dateRangeStart === '' || (
          new Date(item.nextFollowUp) >= new Date(filters.dateRangeStart)
      );

      return matchesSearch && matchesStatus && matchesAssigned && matchesDate;
    });
  }, [entries, filters]);

  // CRUD Handlers
  const handleCreate = () => {
      setEditingEntry(undefined);
      setIsModalOpen(true);
  };

  const handleViewDetails = (entry: CRMEntry) => {
      setEditingEntry(entry);
      setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
      if(!window.confirm("Are you sure you want to delete this record?")) return;
      
      // Optimistic Update
      setEntries(prev => prev.filter(e => e.id !== id));
      
      try {
          await crmApi.delete(id);
          // Sync simulated storage
          const current = JSON.parse(localStorage.getItem('mock_crm_data') || '[]');
          const updated = current.filter((e: CRMEntry) => e.id !== id);
          localStorage.setItem('mock_crm_data', JSON.stringify(updated));
      } catch (err) {
          alert("Failed to delete");
          fetchData(); // Revert
      }
  };

  const handleFormSubmit = async (data: Partial<CRMEntry>) => {
      // Add Audit Data
      const auditData = {
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };

      const finalData = { ...data, ...auditData };

      if (editingEntry) {
          // Update
          const updated = { ...editingEntry, ...finalData } as CRMEntry;
          // Optimistic
          setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
          
          await crmApi.update(updated.id, finalData);
          
          // Sync Storage for demo
          const current = JSON.parse(localStorage.getItem('mock_crm_data') || '[]');
          const newStore = current.map((e: CRMEntry) => e.id === updated.id ? updated : e);
          localStorage.setItem('mock_crm_data', JSON.stringify(newStore));

      } else {
          // Create
          const newEntry = await crmApi.create(finalData as CRMEntry); // Wait for ID
          setEntries(prev => [newEntry, ...prev]);
          
          // Sync Storage
          const current = JSON.parse(localStorage.getItem('mock_crm_data') || '[]');
          localStorage.setItem('mock_crm_data', JSON.stringify([newEntry, ...current]));
      }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CRM Dashboard</h1>
                <p className="text-gray-500 mt-1 font-medium">Welcome back, track your team's progress and active deals.</p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handleCreate}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-brand-500/30 transition-all active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    New Deal
                </button>
            </div>
          </div>

          <CRMStats entries={entries} />

          <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden">
            <CRMFilters filters={filters} setFilters={setFilters} onRefresh={fetchData} />
            <div className="flex-1 overflow-auto bg-white">
                <CRMTable 
                    data={filteredData} 
                    isLoading={isLoading} 
                    onView={handleViewDetails}
                    onDelete={handleDelete}
                />
            </div>
            <div className="p-4 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between">
                <span>Showing {filteredData.length} records</span>
                <span>Incial CRM v1.0</span>
            </div>
          </div>
        </main>
      </div>

      <CRMForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingEntry}
      />
    </div>
  );
};
