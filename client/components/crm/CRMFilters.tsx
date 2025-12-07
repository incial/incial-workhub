
import React from 'react';
import { Search, X } from 'lucide-react';
import { FilterState } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';
import { CustomDatePicker } from '../ui/CustomDatePicker';

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

  const statusOptions = [
    { label: "Active Pipeline", value: "" },
    { label: "Lead", value: "lead" },
    { label: "On Progress", value: "on progress" },
    { label: "Quote Sent", value: "Quote Sent" },
    { label: "Onboarded", value: "onboarded" },
    { label: "Completed", value: "completed" },
    { label: "Drop", value: "drop" },
  ];

  const assigneeOptions = [
    { label: "All Assignees", value: "" },
    { label: "Vallapata", value: "Vallapata" },
    { label: "John Doe", value: "John Doe" },
  ];

  return (
    <div className="p-4 border-b border-gray-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-white z-20">
      
      {/* Left: Inputs */}
      <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Search</label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              placeholder="Search contacts, companies..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="w-40">
           <CustomSelect 
                label="Status"
                value={filters.status}
                onChange={(val) => handleChange('status', val)}
                options={statusOptions}
                placeholder="Active Pipeline"
           />
        </div>

        <div className="w-40">
            <CustomSelect 
                label="Assigned To"
                value={filters.assignedTo}
                onChange={(val) => handleChange('assignedTo', val)}
                options={assigneeOptions}
                placeholder="All Assignees"
            />
        </div>
        
        {hasFilters && (
            <button 
                onClick={clearFilters}
                className="mb-1 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors self-end"
            >
                <X className="h-3.5 w-3.5" /> 
                Clear
            </button>
        )}
      </div>

      {/* Right: Date Filter */}
      <div className="flex items-end gap-3 w-full xl:w-auto justify-end">
        <div className="w-full sm:w-auto">
             <CustomDatePicker 
                label="Follow Up After"
                value={filters.dateRangeStart}
                onChange={(val) => handleChange('dateRangeStart', val)}
                placeholder="Select date..."
                className="sm:w-64"
             />
        </div>
      </div>
    </div>
  );
};
