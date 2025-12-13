
import React, { useState, useRef, useEffect } from 'react';
import { CRMEntry, CRMStatus } from '../../types';
import { getStatusStyles, formatDate, getFollowUpColor } from '../../utils';
import { Phone, Mail, Eye, Trash2, MoreHorizontal, ChevronDown, Check } from 'lucide-react';

interface CRMTableProps {
  data: CRMEntry[];
  isLoading: boolean;
  onView: (entry: CRMEntry) => void;
  onDelete: (id: number) => void;
  onStatusChange: (entry: CRMEntry, newStatus: CRMStatus) => void;
}

const AvatarPlaceholder = ({ name }: { name?: string }) => {
    const safeName = name || 'Unknown';
    const initials = safeName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    
    // Generate a consistent pastel color based on name length
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-indigo-100 text-indigo-700',
        'bg-emerald-100 text-emerald-700',
        'bg-amber-100 text-amber-700',
        'bg-rose-100 text-rose-700',
        'bg-violet-100 text-violet-700'
    ];
    const colorClass = colors[safeName.length % colors.length];

    return (
        <div className={`h-9 w-9 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm`}>
            {initials}
        </div>
    );
};

const StatusDropdown = ({ entry, onStatusChange }: { entry: CRMEntry; onStatusChange: (e: CRMEntry, s: CRMStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    
    const options: CRMStatus[] = [
        'lead', 
        'on progress', 
        'Quote Sent', 
        'onboarded', 
        'completed', 
        'drop'
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatStatus = (s: string) => {
        if (s === 'Quote Sent') return 'Quote Sent';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    return (
        <div className="relative inline-block" ref={ref}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm transition-all hover:opacity-90 active:scale-95 capitalize whitespace-nowrap ${getStatusStyles(entry.status)}`}
            >
                {formatStatus(entry.status)}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={(e) => { e.stopPropagation(); onStatusChange(entry, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors capitalize ${
                                    entry.status === opt 
                                    ? 'bg-brand-50 text-brand-700 font-bold' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {formatStatus(opt)}
                                {entry.status === opt && <Check className="h-3 w-3 text-brand-600 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const CRMTable: React.FC<CRMTableProps> = ({ data, isLoading, onView, onDelete, onStatusChange }) => {
  if (isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-100 border-t-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-400 font-medium animate-pulse">Loading Pipeline...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-20 text-center bg-white">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MoreHorizontal className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg">No records found</h3>
        <p className="text-gray-500 mt-1">Try adjusting your filters or create a new deal.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar bg-white min-h-[500px] pb-32">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50/95 backdrop-blur-sm z-10">Contact / Company</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Lead Source</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tags & Work</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Follow Up</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assigned</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row) => (
            <tr key={row.id} className="group hover:bg-gray-50/80 transition-all duration-200">
              {/* Name & Company - Sticky Column */}
              <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50/80 transition-all border-r border-transparent group-hover:border-gray-100 z-10">
                <div className="flex items-center gap-4">
                  <AvatarPlaceholder name={row.contactName} />
                  <div className="flex flex-col">
                    <button onClick={() => onView(row)} className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors text-left">{row.contactName || 'No Name'}</button>
                    <span className="text-xs font-medium text-gray-500">{row.company || 'No Company'}</span>
                    
                    {/* Hover Quick Actions */}
                    <div className="flex gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <a href={`tel:${row.phone}`} className="text-gray-400 hover:text-brand-600 transition-colors" title={row.phone}><Phone className="h-3.5 w-3.5" /></a>
                        <a href={`mailto:${row.email}`} className="text-gray-400 hover:text-brand-600 transition-colors" title={row.email}><Mail className="h-3.5 w-3.5" /></a>
                    </div>
                  </div>
                </div>
              </td>

              {/* Lead Source */}
              <td className="px-6 py-4">
                {row.leadSources && row.leadSources.length > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    {row.leadSources[0]}
                  </span>
                ) : (
                  <span className="text-gray-300 text-xs">-</span>
                )}
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <StatusDropdown entry={row} onStatusChange={onStatusChange} />
              </td>

              {/* Tags/Work */}
              <td className="px-6 py-4">
                 <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                    {(row.tags || []).slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-md border border-purple-100/50">{tag}</span>
                    ))}
                    {(row.work || []).slice(0, 2).map((w: any) => {
                         const label = typeof w === 'object' ? w.name : w;
                         return (
                            <span key={label} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md border border-blue-100/50">{label}</span>
                         );
                    })}
                    {((row.tags || []).length + (row.work || []).length) > 4 && (
                        <span className="px-2 py-1 text-[10px] font-medium text-gray-400 bg-gray-50 rounded-md">+{ (row.tags || []).length + (row.work || []).length - 4}</span>
                    )}
                 </div>
              </td>

              {/* Follow Up */}
              <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className={`text-xs font-semibold ${getFollowUpColor(row.nextFollowUp)}`}>
                        {formatDate(row.nextFollowUp)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">Last: {formatDate(row.lastContact)}</span>
                </div>
              </td>

              {/* Assigned */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-[10px] flex items-center justify-center text-gray-600 font-bold border border-white shadow-sm">
                        {row.assignedTo ? row.assignedTo.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{row.assignedTo || 'Unassigned'}</span>
                </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={() => onView(row)} 
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(row.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
