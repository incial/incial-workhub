
import React from 'react';
import { X, Hash, User, Calendar, Tag, Clock } from 'lucide-react';
import { Company } from '../../types';
import { getCompanyStatusStyles, getWorkTypeStyles, formatDate } from '../../utils';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: Company;
}

export const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ isOpen, onClose, company }) => {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
            <div>
                 <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                 <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                        <Hash className="h-3 w-3" /> {company.referenceId}
                     </span>
                 </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="h-5 w-5" />
            </button>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Status Section */}
            <div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Project Status</h3>
                 <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm capitalize ${getCompanyStatusStyles(company.status)}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-60"></span>
                    {company.status}
                </span>
            </div>

            {/* Key Contact */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" /> Key Contact
                </h3>
                <p className="text-gray-900 font-medium text-lg">
                    {company.contactPerson || <span className="text-gray-400 italic text-sm">No contact person listed</span>}
                </p>
            </div>

            {/* Work Scope */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Scope of Work
                </h3>
                <div className="flex flex-wrap gap-2">
                    {company.work && company.work.length > 0 ? (
                        company.work.map((w: any) => {
                             const label = typeof w === 'object' ? w.name : w;
                             return (
                                <span key={label} className={`px-3 py-1 rounded-full text-xs font-bold border ${getWorkTypeStyles(label)}`}>
                                    {label}
                                </span>
                             );
                        })
                    ) : (
                        <span className="text-sm text-gray-400 italic">No work types assigned</span>
                    )}
                </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Created On
                    </p>
                    <p className="text-sm font-medium text-gray-700">{formatDate(company.createdAt)}</p>
                </div>
                {company.lastUpdatedBy && (
                    <div>
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Last Update
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                            {formatDate(company.updatedAt)} <span className="text-gray-400 text-xs">by {company.lastUpdatedBy}</span>
                        </p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};
