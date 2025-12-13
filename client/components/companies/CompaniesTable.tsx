
import React, { useState, useRef, useEffect } from 'react';
import { CRMEntry, CRMStatus } from '../../types';
import { getCompanyStatusStyles, getWorkTypeStyles } from '../../utils';
import { Trash2, MoreHorizontal, Hash, User, Eye, HardDrive, Globe, Linkedin, Instagram, Facebook, Twitter, Link as LinkIcon, Edit2, ChevronDown, Check } from 'lucide-react';

interface CompaniesTableProps {
  data: CRMEntry[];
  isLoading: boolean;
  onEdit: (company: CRMEntry) => void;
  onView: (company: CRMEntry) => void;
  onDelete: (id: number) => void;
  onStatusChange: (company: CRMEntry, newStatus: CRMStatus) => void;
}

const CompanyStatusDropdown = ({ company, onStatusChange }: { company: CRMEntry; onStatusChange: (c: CRMEntry, s: CRMStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    
    // Statuses relevant to companies view
    const options: CRMStatus[] = [
        'onboarded', 
        'on progress', 
        'Quote Sent', 
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
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ring-1 inset ring-opacity-10 capitalize whitespace-nowrap transition-all hover:opacity-90 active:scale-95 ${getCompanyStatusStyles(company.status)}`}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                {formatStatus(company.status)}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={(e) => { e.stopPropagation(); onStatusChange(company, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors capitalize ${
                                    company.status === opt 
                                    ? 'bg-brand-50 text-brand-700 font-bold' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {formatStatus(opt)}
                                {company.status === opt && <Check className="h-3 w-3 text-brand-600 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const CompaniesTable: React.FC<CompaniesTableProps> = ({ data, isLoading, onEdit, onView, onDelete, onStatusChange }) => {
  if (isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-100 border-t-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-400 font-medium animate-pulse">Loading Companies...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-20 text-center bg-white">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MoreHorizontal className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg">No companies found</h3>
        <p className="text-gray-500 mt-1">This section displays active onboarded deals from CRM.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar bg-white min-h-[500px] pb-32">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16 text-center">SL No</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reference ID</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Company Name</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact Person</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Work Info</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, index) => {
             // Generate a fallback Reference ID if missing
             const refId = row.referenceId || `REF-${new Date().getFullYear()}-${row.id.toString().padStart(3, '0')}`;
             
             return (
            <tr key={row.id} className="group hover:bg-gray-50/80 transition-all duration-200">
              
              {/* SL No */}
              <td className="px-6 py-4 text-center">
                <span className="text-xs font-medium text-gray-400">{(index + 1).toString().padStart(2, '0')}</span>
              </td>

              {/* Reference ID */}
              <td className="px-6 py-4">
                 <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 flex w-fit items-center gap-2">
                    <Hash className="h-3 w-3 opacity-50" />
                    {refId}
                 </span>
              </td>

              {/* Company Name & Links */}
              <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                    {/* Logo Thumbnail */}
                    <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {row.companyImageUrl ? (
                            <>
                                <img 
                                    src={row.companyImageUrl} 
                                    alt={row.company} 
                                    className="h-full w-full object-cover" 
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <div className="hidden h-full w-full flex items-center justify-center text-xs font-bold text-gray-400">
                                    {row.company.charAt(0)}
                                </div>
                            </>
                        ) : (
                            <span className="text-xs font-bold text-gray-400">{row.company.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <button 
                            onClick={() => onView(row)}
                            className="font-bold text-gray-900 text-sm hover:text-brand-600 hover:underline transition-colors text-left"
                        >
                            {row.company}
                        </button>
                        {/* Quick Links Row */}
                        <div className="flex items-center gap-2">
                            {row.driveLink && (
                                <a href={row.driveLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Google Drive">
                                    <HardDrive className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.website && (
                                <a href={row.socials.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-600 transition-colors" title="Website">
                                    <Globe className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.linkedin && (
                                <a href={row.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors" title="LinkedIn">
                                    <Linkedin className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.instagram && (
                                <a href={row.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors" title="Instagram">
                                    <Instagram className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.facebook && (
                                <a href={row.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Facebook">
                                    <Facebook className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.twitter && (
                                <a href={row.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors" title="Twitter">
                                    <Twitter className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {row.socials?.other && (
                                <a href={row.socials.other} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 transition-colors" title="Other">
                                    <LinkIcon className="h-3.5 w-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
              </td>

              {/* Contact Person */}
              <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{row.contactName || 'N/A'}</span>
                  </div>
              </td>

              {/* Work Info (Chips) */}
              <td className="px-6 py-4">
                 <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                    {row.work.map((w: any) => {
                         const label = typeof w === 'object' ? w.name : w;
                         return (
                            <span key={label} className={`px-2 py-1 text-[10px] font-semibold rounded-md border ${getWorkTypeStyles(label)}`}>
                                {label}
                            </span>
                         );
                    })}
                    {row.work.length === 0 && <span className="text-gray-300 text-xs">-</span>}
                 </div>
              </td>

              {/* Status Badge (Dropdown) */}
              <td className="px-6 py-4">
                <CompanyStatusDropdown company={row} onStatusChange={onStatusChange} />
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
                        onClick={() => onEdit(row)} 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Edit Details"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(row.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Remove from List"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
};
