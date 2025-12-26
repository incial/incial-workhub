import React, { useState, useEffect } from 'react';
import { X, Save, Building, Hash, Check, History, HardDrive, Globe, Linkedin, Instagram, Facebook, Twitter, Link as LinkIcon, User, Plus, Briefcase, Image, Trash2 } from 'lucide-react';
import { CRMEntry, CRMStatus, SocialLinks } from '../../types';
import { getWorkTypeStyles, formatDateTime } from '../../utils';
import { CustomSelect } from '../ui/CustomSelect';

interface CompaniesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CRMEntry>) => void;
  initialData?: CRMEntry;
  onDelete?: (id: number) => void;
}

const PREDEFINED_WORK = [
  "Marketing", "Website", "Poster", "Video", "VFX", 
  "LinkedIn", "Other", "Ads", "Branding", "UI/UX"
];

// Restricted statuses allowed for "Companies" view
const STATUS_OPTIONS: { label: string; value: CRMStatus }[] = [
    { label: "Onboarded", value: "onboarded" },
    { label: "Completed", value: "completed" },
    { label: "Dropped", value: "drop" },
];

export const CompaniesForm: React.FC<CompaniesFormProps> = ({ isOpen, onClose, onSubmit, initialData, onDelete }) => {
  const [formData, setFormData] = useState<Partial<CRMEntry>>({});
  const [customWork, setCustomWork] = useState('');
  
  useEffect(() => {
    if (isOpen && initialData) {
        // If referenceId is missing (it was showing as fallback in table), pre-fill it here
        const fallbackRefId = `REF-${new Date().getFullYear()}-${String(initialData.id).padStart(3, '0')}`;
        
        setFormData({
            ...initialData,
            referenceId: initialData.referenceId || fallbackRefId
        });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.status) {
        alert("Please fill in required fields");
        return;
    }
    onSubmit(formData);
    onClose();
  };

  const toggleWork = (workLabel: string) => {
      const currentWork = formData.work || [];
      // Defensive mapping to handle legacy object structures or raw strings
      const cleanWork = currentWork.filter(Boolean).map((w: any) => (w && typeof w === 'object') ? w.name : w);
      
      const exists = cleanWork.includes(workLabel);
      if (exists) {
          setFormData(prev => ({ ...prev, work: cleanWork.filter(w => w !== workLabel) }));
      } else {
          setFormData(prev => ({ ...prev, work: [...cleanWork, workLabel] }));
      }
  };

  const addCustomWork = () => {
      if (!customWork.trim()) return;
      const currentWork = formData.work || [];
      const cleanWork = currentWork.filter(Boolean).map((w: any) => (w && typeof w === 'object') ? w.name : w);
      
      if (!cleanWork.includes(customWork.trim())) {
          setFormData(prev => ({ ...prev, work: [...cleanWork, customWork.trim()] }));
      }
      setCustomWork('');
  };

  const updateSocials = (key: keyof SocialLinks, value: string) => {
    setFormData(prev => ({
        ...prev,
        socials: {
            ...prev.socials,
            [key]: value
        }
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white/90 backdrop-blur-3xl rounded-[2rem] lg:rounded-[3rem] shadow-2xl w-full max-w-3xl max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-white/60 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 lg:p-8 border-b border-slate-100 bg-white/40">
          <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building className="h-5 lg:h-6 w-5 lg:w-6 text-indigo-600" />
            Edit Registry Profile
          </h2>
          <button onClick={onClose} className="p-2 lg:p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all">
              <X className="h-5 lg:h-6 w-5 lg:w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 lg:p-8 flex-1 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 animate-premium">
                
                {/* Reference ID & Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Reference ID</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input 
                                required 
                                type="text" 
                                className="w-full pl-12 pr-6 py-3 lg:py-4 bg-slate-50 border border-slate-200 rounded-2xl lg:rounded-[1.5rem] text-sm font-bold font-mono text-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" 
                                value={formData.referenceId || ''} 
                                onChange={e => setFormData({...formData, referenceId: e.target.value})}
                                placeholder="Auto-generated"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Client Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                             <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input 
                                required 
                                type="text" 
                                className="w-full pl-12 pr-6 py-3 lg:py-4 bg-white border border-slate-200 rounded-2xl lg:rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" 
                                value={formData.company || ''} 
                                onChange={e => setFormData({...formData, company: e.target.value})}
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Company Logo URL</label>
                        <div className="relative">
                            <Image className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input type="url" className="w-full pl-12 pr-6 py-3 lg:py-4 bg-white border border-slate-200 rounded-2xl lg:rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" 
                                value={formData.companyImageUrl || ''} onChange={e => setFormData({...formData, companyImageUrl: e.target.value})} placeholder="https://..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contact Person</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input 
                                type="text" 
                                className="w-full pl-12 pr-6 py-3 lg:py-4 bg-white border border-slate-200 rounded-2xl lg:rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" 
                                value={formData.contactName || ''} 
                                onChange={e => setFormData({...formData, contactName: e.target.value})}
                                placeholder="Primary Contact Name"
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="p-4 lg:p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 shadow-inner">
                    <CustomSelect 
                        label="Registry Status"
                        value={formData.status || ''}
                        onChange={(val) => setFormData({...formData, status: val as any})}
                        options={STATUS_OPTIONS}
                        placeholder="Select or type Status"
                        allowCustom={true}
                        required
                    />
                </div>

                {/* Work Tags Section */}
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Briefcase className="h-3.5 w-3.5" /> Scope of Work <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 lg:p-6 bg-white/40 border border-white rounded-[2rem] shadow-sm">
                        {PREDEFINED_WORK.map(type => {
                            const cleanWork = (formData.work || []).filter(Boolean).map((w: any) => (w && typeof w === 'object') ? w.name : w);
                            const isSelected = cleanWork.includes(type);
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => toggleWork(type)}
                                    className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest border transition-all duration-200 ${
                                        isSelected
                                            ? getWorkTypeStyles(type) + ' scale-105 shadow-md'
                                            : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                    }`}
                                >
                                    {type}
                                </button>
                            );
                        })}
                        
                        {(formData.work || []).filter(Boolean).filter((w: any) => {
                            const val = (w && typeof w === 'object') ? w.name : w;
                            return val && !PREDEFINED_WORK.includes(val);
                        }).map((opt: any) => {
                            const label = (opt && typeof opt === 'object') ? opt.name : opt;
                            if (!label) return null;
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => toggleWork(label)}
                                    className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest border bg-slate-900 text-white border-slate-800 shadow-md"
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    {/* Add Custom Input */}
                    <div className="flex gap-2 lg:gap-3">
                        <input 
                            type="text" 
                            placeholder="Add custom scope..." 
                            className="flex-1 px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-bold border border-slate-200 rounded-2xl lg:rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white transition-all shadow-inner"
                            value={customWork} 
                            onChange={e => setCustomWork(e.target.value)} 
                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomWork())} 
                        />
                        <button 
                            type="button" 
                            onClick={addCustomWork} 
                            className="p-3 lg:p-4 bg-slate-900 text-white rounded-2xl lg:rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Drive Link Input */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
                        <HardDrive className="h-3.5 w-3.5" /> Google Drive Link
                    </label>
                    <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input 
                            type="url" 
                            className="w-full pl-12 pr-6 py-3 lg:py-4 bg-white border border-slate-200 rounded-2xl lg:rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner placeholder-slate-300"
                            value={formData.driveLink || ''} 
                            onChange={e => setFormData({...formData, driveLink: e.target.value})} 
                            placeholder="https://drive.google.com/..."
                        />
                    </div>
                </div>

                {/* Social Media Inputs */}
                <div className="bg-white/40 p-6 lg:p-8 rounded-[2rem] border border-white shadow-sm space-y-6">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-500" /> Online Presence
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input 
                                type="url" 
                                placeholder="Website URL"
                                className="w-full pl-12 pr-4 py-3 lg:py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                value={formData.socials?.website || ''}
                                onChange={e => updateSocials('website', e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input 
                                type="url" 
                                placeholder="LinkedIn URL"
                                className="w-full pl-12 pr-4 py-3 lg:py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                value={formData.socials?.linkedin || ''}
                                onChange={e => updateSocials('linkedin', e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input 
                                type="url" 
                                placeholder="Instagram URL"
                                className="w-full pl-12 pr-4 py-3 lg:py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                value={formData.socials?.instagram || ''}
                                onChange={e => updateSocials('instagram', e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input 
                                type="url" 
                                placeholder="Facebook URL"
                                className="w-full pl-12 pr-4 py-3 lg:py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                value={formData.socials?.facebook || ''}
                                onChange={e => updateSocials('facebook', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Update History Footer */}
                {formData.lastUpdatedBy && (
                    <div className="flex items-center justify-end pt-4 border-t border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <History className="h-3 w-3 mr-2" />
                        <span>Last updated by <span className="text-indigo-600">{formData.lastUpdatedBy}</span> on {formatDateTime(formData.lastUpdatedAt || '')}</span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-6 lg:pt-8 border-t border-slate-100 mt-2">
                    {initialData && onDelete ? (
                        <button type="button" onClick={() => onDelete(initialData.id)} className="flex items-center gap-2 text-[10px] lg:text-[11px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors">
                            <Trash2 className="h-4 w-4" /> Purge
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-3 lg:gap-4">
                        <button type="button" onClick={onClose} className="px-6 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">
                            Discard
                        </button>
                        <button type="submit" className="px-8 lg:px-10 py-3 lg:py-4 bg-slate-950 text-white rounded-2xl lg:rounded-[1.5rem] text-[10px] lg:text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">
                            <Save className="h-4 w-4 text-indigo-400" /> Committ
                        </button>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};