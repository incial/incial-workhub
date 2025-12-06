
import React from 'react';
import { CRMEntry } from '../../types';
import { getStatusStyles, formatDate, getFollowUpColor } from '../../utils';
import { Phone, Mail, Eye, Trash2 } from 'lucide-react';

interface CRMTableProps {
  data: CRMEntry[];
  isLoading: boolean;
  onView: (entry: CRMEntry) => void;
  onDelete: (id: number) => void;
}

export const CRMTable: React.FC<CRMTableProps> = ({ data, isLoading, onView, onDelete }) => {
  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading CRM data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-lg border border-gray-200 border-dashed m-4">
        <p className="text-gray-500 font-medium">No records found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Contact / Company</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Source</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags / Work</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Follow Up</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-brand-50/30 transition-colors group">
              {/* Name & Company - Sticky Column */}
              <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-brand-50/30 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-transparent">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 text-sm">{row.contactName}</span>
                  <span className="text-xs text-gray-500">{row.company}</span>
                  <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`tel:${row.phone}`} className="text-gray-400 hover:text-brand-600"><Phone className="h-3 w-3" /></a>
                      <a href={`mailto:${row.email}`} className="text-gray-400 hover:text-brand-600"><Mail className="h-3 w-3" /></a>
                  </div>
                </div>
              </td>

              {/* Lead Source */}
              <td className="px-4 py-3">
                {row.leadSources && row.leadSources.length > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                    {row.leadSources[0]}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(row.status)}`}>
                  {row.status}
                </span>
              </td>

              {/* Tags/Work */}
              <td className="px-4 py-3">
                 <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {row.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded border border-purple-100">{tag}</span>
                    ))}
                    {row.work.slice(0, 2).map((w: any) => {
                        // Handle legacy object if present
                        const label = typeof w === 'object' ? w.name : w;
                        return (
                            <span key={label} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-100">{label}</span>
                        );
                    })}
                    {(row.tags.length + row.work.length) > 4 && (
                        <span className="text-[10px] text-gray-400">+{row.tags.length + row.work.length - 4}</span>
                    )}
                 </div>
              </td>

              {/* Follow Up */}
              <td className="px-4 py-3">
                <div className="flex flex-col">
                    <span className={`text-xs ${getFollowUpColor(row.nextFollowUp)}`}>
                        {formatDate(row.nextFollowUp)}
                    </span>
                    <span className="text-[10px] text-gray-400">Last: {formatDate(row.lastContact)}</span>
                </div>
              </td>

              {/* Assigned */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-gray-200 text-[10px] flex items-center justify-center text-gray-600 font-bold">
                        {row.assignedTo.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-600">{row.assignedTo}</span>
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onView(row)} 
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(row.id)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
