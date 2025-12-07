
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CompaniesTable } from '../components/companies/CompaniesTable';
import { CompaniesFilters } from '../components/companies/CompaniesFilters';
import { Company, CompanyFilterState, CRMEntry } from '../types';
import { Briefcase, Building, Archive, ArrowRight } from 'lucide-react';
import { crmApi } from '../services/api';
import { Link } from 'react-router-dom';

export const CompaniesPage: React.FC = () => {
  const [crmEntries, setCrmEntries] = useState<CRMEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'dropped'>('active');
  
  const [filters, setFilters] = useState<CompanyFilterState>({
    search: '',
    status: '',
    workType: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Source of truth is strictly the CRM
      const crmData = await crmApi.getAll();
      setCrmEntries(crmData.crmList);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Transform CRM Data to Company View Structure with Reference ID
  const transformedData = useMemo(() => {
      return crmEntries.map(entry => ({
          id: entry.id,
          // Generate Reference ID: REF-{Year}-{ID}
          referenceId: `REF-${new Date().getFullYear()}-${entry.id.toString().padStart(3, '0')}`,
          name: entry.company,
          work: entry.work.map((w: any) => typeof w === 'object' ? w.name : w),
          status: entry.status,
          createdAt: entry.lastContact,
          updatedAt: entry.lastUpdatedAt || new Date().toISOString(),
          // Use properties from CRM that map to Company interface
      } as Company));
  }, [crmEntries]);

  // Separate into Active and Dropped
  const categorizedData = useMemo(() => {
      const active = transformedData.filter(c => c.status !== 'drop');
      const dropped = transformedData.filter(c => c.status === 'drop');
      return { active, dropped };
  }, [transformedData]);

  // Filtering & Sorting
  const displayData = useMemo(() => {
    const sourceList = activeTab === 'active' ? categorizedData.active : categorizedData.dropped;

    let result = sourceList.filter(item => {
      const matchesSearch = filters.search === '' || 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.referenceId.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === '' || item.status === filters.status;
      const matchesWork = filters.workType === '' || item.work.includes(filters.workType);

      return matchesSearch && matchesStatus && matchesWork;
    });

    // Default Sort: ID Descending (Newest first)
    return result.sort((a, b) => b.id - a.id);
  }, [categorizedData, activeTab, filters]);

  // Handle Edit - Redirect to CRM since that is the source of truth
  const handleEdit = (company: Company) => {
      // We could open a modal here, but for this architecture, we might want to direct them to CRM
      // For now, I'll just log it or we could reuse the CRM modal if imported. 
      // Given the request, "CRM dashboard contains every company in full details", 
      // let's keep the Companies view read-only or simple status updates if requested later.
      console.log("Edit requested for", company.name); 
  };

  const handleDelete = async (id: number) => {
      if(!window.confirm("This will remove the company and the associated deal from CRM. Continue?")) return;
      
      // Optimistic Update
      setCrmEntries(prev => prev.filter(e => e.id !== id));
      
      try {
          await crmApi.delete(id);
      } catch (err) {
          alert("Failed to delete");
          fetchData(); // Revert
      }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                    <Briefcase className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Companies Registry</h1>
                    <p className="text-gray-500 mt-1 font-medium">Unified directory of all active and dropped accounts.</p>
                </div>
            </div>
            <div className="flex gap-3">
                <Link 
                    to="/crm"
                    className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-sm"
                >
                    Go to CRM <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'active' 
                        ? 'bg-white text-brand-600 shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                    }`}
                >
                    <Building className="h-4 w-4" />
                    Active Companies
                    <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md text-xs border border-brand-100 ml-1">
                        {categorizedData.active.length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('dropped')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'dropped' 
                        ? 'bg-white text-red-600 shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                    }`}
                >
                    <Archive className="h-4 w-4" />
                    Dropped Firms
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs border border-gray-200 ml-1">
                        {categorizedData.dropped.length}
                    </span>
                </button>
            </div>

            <CompaniesFilters filters={filters} setFilters={setFilters} onRefresh={fetchData} />
            
            <div className="flex-1 overflow-auto bg-white">
                <CompaniesTable 
                    data={displayData} 
                    isLoading={isLoading} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between">
                <span>
                    Showing {displayData.length} {activeTab === 'active' ? 'active' : 'dropped'} records
                </span>
                <span>Synced with CRM</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
