import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CRMFilters } from '../components/crm/CRMFilters';
import { CRMTable } from '../components/crm/CRMTable';
import { CRMForm } from '../components/crm/CRMForm';
import { FilterState, CRMEntry } from '../types';
import { Plus } from 'lucide-react';
import { crmApi } from '../services/api';

export const CRMPage: React.FC = () => {
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
      
      const matchesStatus = filters.status === '' || item.status === filters.status;
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
      if (editingEntry) {
          // Update
          const updated = { ...editingEntry, ...data } as CRMEntry;
          // Optimistic
          setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
          
          await crmApi.update(updated.id, data);
          
          // Sync Storage for demo
          const current = JSON.parse(localStorage.getItem('mock_crm_data') || '[]');
          const newStore = current.map((e: CRMEntry) => e.id === updated.id ? updated : e);
          localStorage.setItem('mock_crm_data', JSON.stringify(newStore));

      } else {
          // Create
          const newEntry = await crmApi.create(data as CRMEntry); // Wait for ID
          setEntries(prev => [newEntry, ...prev]);
          
          // Sync Storage
          const current = JSON.parse(localStorage.getItem('mock_crm_data') || '[]');
          localStorage.setItem('mock_crm_data', JSON.stringify([newEntry, ...current]));
      }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">CRM & Leads</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your pipeline, track follow-ups, and close deals.</p>
            </div>
            <button 
                onClick={handleCreate}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all transform hover:scale-105"
            >
                <Plus className="h-5 w-5" />
                Add Deal
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
            <CRMFilters filters={filters} setFilters={setFilters} onRefresh={fetchData} />
            <div className="flex-1 overflow-auto bg-gray-50/50">
                <CRMTable 
                    data={filteredData} 
                    isLoading={isLoading} 
                    onView={handleViewDetails}
                    onDelete={handleDelete}
                />
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
                <span>Showing {filteredData.length} records</span>
                <span>Sorted by Default</span>
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