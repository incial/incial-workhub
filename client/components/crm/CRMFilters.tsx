import React from 'react';
import { Filter, Search, X, Calendar as CalendarIcon } from 'lucide-react';
import { FilterState } from '../../types';

interface CRMFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onRefresh: () => void;
}

export const CRMFilters: React.FC<CRMFiltersProps> = ({ filters, setFilters, onRefresh }) => {
  const handleChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
      setFilters({
          status: '',
          assignedTo: '',
          search: '',
          dateRangeStart: '',
          dateRangeEnd: ''
      });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-white p-5 border-b border-gray-100 flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between rounded-t-2xl">
      
      {/* Left: Inputs */}
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        <div className="relative group">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
          <input
            type="text"
            placeholder="Search contacts, companies..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-72 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
            <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
            >
            <option value="">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="on progress">On Progress</option>
            <option value="Quote Sent">Quote Sent</option>
            <option value="onboarded">Onboarded</option>
            <option value="drop">Drop</option>
            </select>

            <select
            value={filters.assignedTo}
            onChange={(e) => handleChange('assignedTo', e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
            >
            <option value="">All Assignees</option>
            <option value="Vallapata">Vallapata</option>
            <option value="John Doe">John Doe</option>
            </select>
        </div>
        
        {hasFilters && (
            <button 
                onClick={clearFilters}
                className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
                <X className="h-3.5 w-3.5" /> 
                Clear
            </button>
        )}
      </div>

      {/* Right: Date Filter */}
      <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
        <div className="flex items-center gap-3 text-sm text-gray-600 bg-white pl-4 pr-2 py-2 rounded-xl border border-gray-200 shadow-sm hover:border-brand-300 transition-colors group">
            <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
                <span className="font-medium text-gray-700">Follow Up After:</span>
            </div>
            <input 
                type="date" 
                className="bg-transparent focus:outline-none text-gray-800 font-medium cursor-pointer"
                value={filters.dateRangeStart}
                onChange={(e) => handleChange('dateRangeStart', e.target.value)}
            />
        </div>
      </div>
    </div>
  );
};