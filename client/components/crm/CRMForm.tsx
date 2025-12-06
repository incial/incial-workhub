import React, { useState, useEffect } from 'react';
import { X, Save, Edit2, Plus } from 'lucide-react';
import { CRMEntry } from '../../types';

interface CRMFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CRMEntry>) => void;
  initialData?: CRMEntry;
}

const LEAD_SOURCES = [
  'Google Business',
  'Direct Call',
  'Website',
  'Referral',
  'Social Media',
  'Email Campaign',
  'Cold Call',
  'Event',
  'Partner',
  'Direct Mail'
];

const TAG_OPTIONS = [
  { label: 'Lead', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Customer', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'VIP', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Follow-up', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Cold', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { label: 'Hot', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Inactive', color: 'bg-stone-100 text-stone-700 border-stone-200' },
  { label: 'Partner', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

const WORK_OPTIONS = [
  { label: 'branding', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'poster', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'video', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { label: 'design', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'ui ux', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { label: 'shopify', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { label: 'website', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'marketing', color: 'bg-gray-700 text-white border-gray-600' },
  { label: 'Logo design', color: 'bg-gray-200 text-gray-800 border-gray-300' },
];

export const CRMForm: React.FC<CRMFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<CRMEntry>>({});
  const [mode, setMode] = useState<'view' | 'edit'>('edit');

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
            setMode('view');
        } else {
            // Reset for Create Mode
            setFormData({
                company: '',
                contactName: '',
                email: '',
                phone: '',
                status: 'lead',
                assignedTo: 'Vallapata',
                dealValue: 0,
                tags: [],
                work: [],
                leadSources: [],
                lastContact: new Date().toISOString().split('T')[0],
                nextFollowUp: new Date().toISOString().split('T')[0],
                notes: '',
            });
            setMode('edit');
        }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const toggleTag = (tag: string) => {
      const currentTags = formData.tags || [];
      if (currentTags.includes(tag)) {
          setFormData(prev => ({ ...prev, tags: currentTags.filter(t => t !== tag) }));
      } else {
          setFormData(prev => ({ ...prev, tags: [...currentTags, tag] }));
      }
  };

  const toggleWork = (work: string) => {
      const currentWork = formData.work || [];
      if (currentWork.includes(work)) {
          setFormData(prev => ({ ...prev, work: currentWork.filter(w => w !== work) }));
      } else {
          setFormData(prev => ({ ...prev, work: [...currentWork, work] }));
      }
  };

  const toggleEdit = () => {
    setMode('edit');
  };

  const handleCancel = () => {
    if (initialData && mode === 'edit') {
        // If we were editing an existing item, revert to view
        setFormData(initialData);
        setMode('view');
    } else {
        // If creating new or viewing, just close
        onClose();
    }
  };

  const isView = mode === 'view';

  // Helper for conditional rendering
  const FormField = ({ label, children, valueDisplay }: { label: string, children?: React.ReactNode, valueDisplay?: React.ReactNode }) => (
    <div className="w-full">
        <label className={`block mb-1.5 ${isView ? 'text-xs font-semibold text-gray-500 uppercase tracking-wider' : 'text-sm font-medium text-gray-700'}`}>
            {label}
        </label>
        {isView ? (
            <div className="text-gray-900 text-sm py-1 min-h-[24px] break-words">
                {valueDisplay}
            </div>
        ) : children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {initialData ? (isView ? 'Deal Details' : 'Edit Deal') : 'New CRM Entry'}
          </h2>
          <div className="flex items-center gap-2">
            {isView && (
                <button onClick={toggleEdit} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                    <Edit2 className="h-4 w-4" /> Edit
                </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Contact Info */}
            <div className="space-y-6">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Contact Information</h3>
               
               <FormField label="Company" valueDisplay={formData.company}>
                 <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                   value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} />
               </FormField>

               <FormField label="Contact Person" valueDisplay={formData.contactName}>
                 <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                   value={formData.contactName || ''} onChange={e => setFormData({...formData, contactName: e.target.value})} />
               </FormField>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField label="Email" valueDisplay={formData.email ? <a href={`mailto:${formData.email}`} className="text-brand-600 hover:underline">{formData.email}</a> : '-'}>
                        <input type="email" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                        value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </FormField>
                    
                    <FormField label="Phone" valueDisplay={formData.phone ? <a href={`tel:${formData.phone}`} className="text-brand-600 hover:underline">{formData.phone}</a> : '-'}>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                        value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </FormField>
               </div>
            </div>

            {/* Deal Info */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Deal Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField label="Deal Value (₹)" valueDisplay={formData.dealValue?.toLocaleString('en-IN')}>
                        <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                        value={formData.dealValue} onChange={e => setFormData({...formData, dealValue: Number(e.target.value)})} />
                    </FormField>

                    <FormField label="Status" valueDisplay={
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700`}>{formData.status}</span>
                    }>
                            <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="lead">Lead</option>
                                <option value="on progress">On Progress</option>
                                <option value="Quote Sent">Quote Sent</option>
                                <option value="onboarded">Onboarded</option>
                                <option value="drop">Drop</option>
                            </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField label="Lead Source" valueDisplay={
                         formData.leadSources && formData.leadSources[0] ? (
                             <span className="inline-block px-2.5 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                 {formData.leadSources[0]}
                             </span>
                         ) : <span className="text-gray-400">-</span>
                    }>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                            value={formData.leadSources?.[0] || ''} 
                            onChange={e => setFormData({...formData, leadSources: [e.target.value]})}
                        >
                            <option value="">Select Source...</option>
                            {LEAD_SOURCES.map(source => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label="Assigned To" valueDisplay={formData.assignedTo}>
                            <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                                value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                            >
                                <option value="Vallapata">Vallapata</option>
                                <option value="John Doe">John Doe</option>
                            </select>
                    </FormField>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField label="Last Contact" valueDisplay={formData.lastContact || '-'}>
                        <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                            value={formData.lastContact || ''} onChange={e => setFormData({...formData, lastContact: e.target.value})} />
                    </FormField>

                    <FormField label="Next Follow Up" valueDisplay={formData.nextFollowUp}>
                            <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                                value={formData.nextFollowUp || ''} onChange={e => setFormData({...formData, nextFollowUp: e.target.value})} />
                    </FormField>
               </div>
            </div>
          </div>
          
          <div className="space-y-6 border-t border-gray-100 pt-6">
             <FormField label="Notes" valueDisplay={<p className="whitespace-pre-wrap text-gray-600">{formData.notes || 'No notes available.'}</p>}>
                 <textarea className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none h-24"
                    value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}
                 ></textarea>
             </FormField>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Tags" valueDisplay={
                    <div className="flex flex-wrap gap-2">
                        {formData.tags?.length ? formData.tags.map(tag => {
                             const tagOption = TAG_OPTIONS.find(opt => opt.label === tag);
                             return (
                                <span key={tag} className={`px-2.5 py-0.5 text-xs rounded border font-medium ${tagOption ? tagOption.color : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                    {tag}
                                </span>
                             );
                        }) : <span className="text-gray-400 italic">None</span>}
                    </div>
                }>
                    <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map(option => {
                            const isSelected = formData.tags?.includes(option.label);
                            return (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => toggleTag(option.label)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                        isSelected
                                            ? option.color + ' ring-2 ring-offset-1 ring-brand-300'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </FormField>

                <FormField label="Work Types" valueDisplay={
                    <div className="flex flex-wrap gap-2">
                        {formData.work?.length ? formData.work.map(w => {
                             const workOption = WORK_OPTIONS.find(opt => opt.label === w);
                             return (
                                <span key={w} className={`px-2.5 py-0.5 text-xs rounded border font-medium ${workOption ? workOption.color : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {w}
                                </span>
                             );
                        }) : <span className="text-gray-400 italic">None</span>}
                    </div>
                }>
                    <div className="flex flex-wrap gap-2">
                        {WORK_OPTIONS.map(option => {
                            const isSelected = formData.work?.includes(option.label);
                            return (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => toggleWork(option.label)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                        isSelected
                                            ? option.color + ' ring-2 ring-offset-1 ring-brand-300'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </FormField>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
             {isView ? (
                 <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                     Close
                 </button>
             ) : (
                 <>
                    <button type="button" onClick={handleCancel} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors font-medium flex items-center gap-2">
                        <Save className="h-4 w-4" /> Save Record
                    </button>
                 </>
             )}
          </div>
        </form>
      </div>
    </div>
  );
};