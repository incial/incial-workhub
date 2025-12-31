
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Edit2, User, Phone, Mail, Calendar, Briefcase, FileText, Tag, DollarSign, CheckCircle, Clock, AlertCircle, History, ExternalLink, HardDrive, Linkedin, Instagram, Facebook, Twitter, Globe, Link as LinkIcon, Maximize2, Minimize2, MapPin, Hash, Building, Megaphone, Plus, Image } from 'lucide-react';
import { CRMEntry, SocialLinks, CRMStatus, User as UserType } from '../../types';
import { getStatusStyles, formatDate, getFollowUpColor, formatMoney, getWorkTypeStyles, formatDateTime } from '../../utils';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { CustomSelect } from '../ui/CustomSelect';
import { UserSelect } from '../ui/UserSelect';
import { usersApi } from '../../services/api';
import { useLayout } from '../../context/LayoutContext';

interface CRMFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CRMEntry>) => void;
  initialData?: CRMEntry;
}

const STATUS_OPTIONS: { label: string; value: CRMStatus }[] = [
    { label: 'Lead', value: 'lead' },
    { label: 'On Progress', value: 'on progress' },
    { label: 'Quote Sent', value: 'Quote Sent' },
    { label: 'Onboarded', value: 'onboarded' },
    { label: 'Completed', value: 'completed' },
    { label: 'Dropped', value: 'drop' },
];

const SOURCE_OPTIONS = [
    { label: 'Website', value: 'Website' },
    { label: 'Referral', value: 'Referral' },
    { label: 'LinkedIn', value: 'LinkedIn' },
    { label: 'Cold Call', value: 'Cold Call' },
    { label: 'Email Campaign', value: 'Email Campaign' },
    { label: 'Google Ads', value: 'Google Ads' },
    { label: 'Event', value: 'Event' },
];

const PREDEFINED_TAGS = ['Lead', 'Customer', 'VIP', 'Follow-up', 'Cold', 'Hot', 'Inactive', 'Partner'];
const PREDEFINED_WORK = ['branding', 'poster', 'video', 'design', 'ui ux', 'shopify', 'website', 'marketing', 'software', 'consulting', 'development'];

export const CRMForm: React.FC<CRMFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { isSidebarCollapsed } = useLayout();
  const [formData, setFormData] = useState<Partial<CRMEntry>>({});
  const [mode, setMode] = useState<'view' | 'edit'>('edit');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  
  const [customTag, setCustomTag] = useState('');
  const [customWork, setCustomWork] = useState('');
  
  // Removed editorRef auto-resize logic to prevent layout jumping

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const fetchedUsers = await usersApi.getAll();
            setUsers(fetchedUsers);
        } catch (e) {
            console.error("Failed to fetch assignees", e);
        }
    };
    if (isOpen) fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData({
                ...initialData,
                socials: initialData.socials || { website: '', linkedin: '', instagram: '', facebook: '' }
            });
            setMode('view');
        } else {
            const todayStr = new Date().toISOString().split('T')[0];
            setFormData({
                company: '', contactName: '', email: '', phone: '', status: 'lead', assignedTo: '', assigneeId: undefined,
                dealValue: 0, tags: [], work: [], leadSources: [], driveLink: '', address: '',
                referenceId: '', companyImageUrl: '', socials: { website: '', linkedin: '', instagram: '', facebook: '' },
                lastContact: todayStr, nextFollowUp: todayStr, notes: '',
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
      const isSelected = currentTags.includes(tag);
      setFormData(prev => ({ 
          ...prev, 
          tags: isSelected ? currentTags.filter(t => t !== tag) : [...currentTags, tag] 
      }));
  };

  const toggleWork = (workLabel: string) => {
      const currentWork = formData.work || [];
      const isSelected = currentWork.includes(workLabel);
      setFormData(prev => ({ 
          ...prev, 
          work: isSelected ? currentWork.filter(w => w !== workLabel) : [...currentWork, workLabel] 
      }));
  };

  const handleAddCustomTag = () => {
      const val = customTag.trim();
      if (!val) return;
      const currentTags = formData.tags || [];
      if (!currentTags.includes(val)) {
          setFormData(prev => ({ ...prev, tags: [...currentTags, val] }));
      }
      setCustomTag('');
  };

  const handleAddCustomWork = () => {
      const val = customWork.trim();
      if (!val) return;
      const currentWork = formData.work || [];
      if (!currentWork.includes(val)) {
          setFormData(prev => ({ ...prev, work: [...currentWork, val] }));
      }
      setCustomWork('');
  };

  const handleUserChange = (userId: number, userName: string) => {
      setFormData(prev => ({ ...prev, assigneeId: userId, assignedTo: userName }));
  };

  const renderView = () => (
    <div className="space-y-6 md:space-y-8 animate-premium">
        <div className="bg-slate-50/50 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 border border-slate-100 shadow-inner">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-md shrink-0">
                        {formData.companyImageUrl ? <img src={formData.companyImageUrl} className="h-full w-full object-cover" /> : <Building className="h-8 w-8 text-slate-300" />}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                             <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none truncate">{formData.company}</h2>
                             {formData.referenceId && (
                                <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-lg bg-slate-900 text-white text-[8px] md:text-[10px] font-mono font-black uppercase tracking-widest shadow-lg">
                                    {formData.referenceId}
                                </span>
                             )}
                        </div>
                        <div className="flex items-center gap-2">
                             <User className="h-3.5 w-3.5 text-indigo-400" />
                             <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">{formData.contactName}</span>
                        </div>
                    </div>
                </div>
                <div className={`px-4 py-1.5 md:px-5 md:py-2 rounded-2xl text-[9px] md:text-[10px] font-black border shadow-sm capitalize tracking-widest ${getStatusStyles(formData.status || '')}`}>
                    {formData.status}
                </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mt-6 md:mt-10 pt-6 md:pt-8 border-t border-slate-200/60">
                <div>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Deal Alpha</p>
                    <p className="text-sm md:text-xl font-black text-slate-900">{formatMoney(formData.dealValue || 0)}</p>
                </div>
                <div>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assignee</p>
                    <p className="text-sm md:text-xl font-black text-slate-900 truncate">{formData.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Pulse</p>
                    <p className={`text-sm md:text-xl font-black ${getFollowUpColor(formData.nextFollowUp || '')}`}>{formatDate(formData.nextFollowUp || '')}</p>
                </div>
                <div>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry ID</p>
                    <p className="text-sm md:text-xl font-black text-slate-900 font-mono tracking-tighter">#INC-{formData.id || 'NEW'}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white/40 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white shadow-sm space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><MapPin className="h-4 w-4 text-indigo-500" /> Tactical HQ</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                        <div className="p-2.5 md:p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors"><Mail className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" /></div>
                        <span className="text-xs md:text-sm font-bold text-slate-700 truncate">{formData.email || 'No Email'}</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="p-2.5 md:p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors"><Phone className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" /></div>
                        <span className="text-xs md:text-sm font-bold text-slate-700">{formData.phone || 'No Phone'}</span>
                    </div>
                    <div className="flex items-start gap-4 group">
                        <div className="p-2.5 md:p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors shrink-0"><MapPin className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" /></div>
                        <span className="text-xs md:text-sm font-bold text-slate-700 leading-relaxed">{formData.address || 'Physical location not logged'}</span>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><History className="h-2.5 w-2.5" /> Last Contact Date</p>
                    <p className="text-[10px] md:text-xs font-bold text-slate-700">{formatDate(formData.lastContact || '')}</p>
                </div>
            </div>

            <div className="bg-white/40 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white shadow-sm space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><Globe className="h-4 w-4 text-indigo-500" /> System Integration</h3>
                <div className="flex flex-wrap gap-2">
                    {formData.socials && Object.entries(formData.socials).map(([key, val]) => val && (
                        <a key={key} href={val as string} target="_blank" className="px-3 md:px-4 py-2 bg-white border border-slate-100 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-2 shadow-sm">
                            <ExternalLink className="h-3 w-3" /> {key}
                        </a>
                    ))}
                    {formData.driveLink && (
                        <a href={formData.driveLink} target="_blank" className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl">
                            <HardDrive className="h-3 w-3" /> Digital Vault
                        </a>
                    )}
                </div>

                <div className="pt-6 border-t border-slate-100 mt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" /> Metadata
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {formData.work?.map((w) => (
                            <span key={w} className={`px-2 py-0.5 text-[8px] md:text-[9px] font-black uppercase rounded-lg border ${getWorkTypeStyles(w)}`}>{w}</span>
                        ))}
                        {formData.tags?.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[8px] md:text-[9px] font-black uppercase rounded-lg">{t}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="bg-white/40 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3"><FileText className="h-4 w-4 text-indigo-500" /> Briefing Intelligence</h3>
            <div className="prose prose-sm max-w-none text-slate-600 font-medium whitespace-pre-wrap italic leading-relaxed text-sm max-h-[250px] overflow-y-auto custom-scrollbar">
                {formData.notes || 'No briefing available for this project node.'}
            </div>
        </div>

        {formData.lastUpdatedBy && (
            <div className="flex items-center justify-end pt-4 border-t border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <History className="h-3 w-3 mr-2" />
                <span>Last updated by <span className="text-indigo-600">{formData.lastUpdatedBy}</span> on {formatDateTime(formData.lastUpdatedAt || '')}</span>
            </div>
        )}
    </div>
  );

  const renderEdit = () => (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 animate-premium">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Entity Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input type="text" required className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl lg:rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" 
                                value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Acme Corp" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reference ID</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input type="text" className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl lg:rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner font-mono" 
                                value={formData.referenceId || ''} onChange={e => setFormData({...formData, referenceId: e.target.value})} placeholder="REF-2025-001" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">HQ Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                        <textarea className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl lg:rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner h-24 resize-none"
                            value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Corporate location details..." />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identity Asset (Logo URL)</label>
                    <div className="relative">
                        <Image className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input type="url" className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl lg:rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                            value={formData.companyImageUrl || ''} onChange={e => setFormData({...formData, companyImageUrl: e.target.value})} placeholder="https://..." />
                    </div>
                </div>
                <div className="h-32 md:h-40 rounded-[1.5rem] md:rounded-[2rem] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {formData.companyImageUrl ? (
                        <img src={formData.companyImageUrl} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center px-4">Asset Preview</span>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Liaison Contact</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input type="text" className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-inner"
                        value={formData.contactName || ''} onChange={e => setFormData({...formData, contactName: e.target.value})} placeholder="POC Name" />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Endpoint</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input type="email" className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-inner"
                        value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="liaison@company.com" />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone</label>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input type="tel" className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-inner"
                        value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91..." />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-6 md:p-8 bg-slate-50/50 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-inner">
            <CustomSelect label="Pipeline Stage" value={formData.status || 'lead'} onChange={(val) => setFormData({...formData, status: val as CRMStatus})} options={STATUS_OPTIONS} />
            <UserSelect label="Node Assignee" value={formData.assigneeId || formData.assignedTo || 'Unassigned'} onChange={handleUserChange} users={users} />
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valuation (₹)</label>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input type="number" className="w-full pl-10 pr-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-inner"
                        value={formData.dealValue || ''} onChange={e => setFormData({...formData, dealValue: parseFloat(e.target.value) || 0})} />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <CustomDatePicker label="Last Contact Date" value={formData.lastContact || ''} onChange={(date) => setFormData({...formData, lastContact: date})} />
            <CustomDatePicker label="Next Follow Up Pulse" value={formData.nextFollowUp || ''} onChange={(date) => setFormData({...formData, nextFollowUp: date})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Drive URL</label>
                <div className="relative">
                    <HardDrive className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input type="url" className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-inner"
                        value={formData.driveLink || ''} onChange={e => setFormData({...formData, driveLink: e.target.value})} placeholder="https://drive..." />
                </div>
            </div>
            <div>
                <CustomSelect label="Lead Intel Source" value={formData.leadSources?.[0] || ''} onChange={(val) => setFormData(prev => ({ ...prev, leadSources: [val] }))} options={SOURCE_OPTIONS} allowCustom={true} placeholder="Origin Node" />
            </div>
        </div>

        <div className="bg-white/40 p-5 md:p-8 rounded-[2rem] border border-white space-y-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><Globe className="h-4 w-4 text-indigo-500" /> Online Presence Registry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {['website', 'linkedin', 'instagram', 'facebook'].map(social => (
                    <div key={social}>
                        <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 capitalize">{social} Node</label>
                        <input type="url" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                            value={(formData.socials as any)?.[social] || ''} onChange={e => setFormData(prev => ({ ...prev, socials: { ...prev.socials, [social]: e.target.value } }))} placeholder="https://..." />
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> Scope of Work</label>
                <div className="flex flex-wrap gap-2 p-4 md:p-6 bg-white/40 border border-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
                    {PREDEFINED_WORK.map(opt => (
                        <button key={opt} type="button" onClick={() => toggleWork(opt)}
                            className={`px-3 py-1.5 md:px-4 md:py-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                                (formData.work || []).includes(opt) ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'
                            }`}>{opt}</button>
                    ))}
                    {(formData.work || []).filter(w => !PREDEFINED_WORK.includes(w)).map(w => (
                        <button key={w} type="button" onClick={() => toggleWork(w)}
                            className="px-3 py-1.5 md:px-4 md:py-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-xl border bg-emerald-600 text-white border-emerald-500 shadow-lg">{w}</button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="Custom Scope..." className="flex-1 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold border border-slate-200 rounded-[1.25rem] md:rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white"
                        value={customWork} onChange={e => setCustomWork(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomWork())} />
                    <button type="button" onClick={handleAddCustomWork} className="p-3.5 md:p-4 bg-slate-900 text-white rounded-[1.25rem] md:rounded-[1.5rem] hover:bg-slate-800 active:scale-95 transition-all"><Plus className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Tag className="h-3.5 w-3.5" /> Identity Tags</label>
                <div className="flex flex-wrap gap-2 p-4 md:p-6 bg-white/40 border border-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
                    {PREDEFINED_TAGS.map(opt => (
                        <button key={opt} type="button" onClick={() => toggleTag(opt)}
                            className={`px-3 py-1.5 md:px-4 md:py-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                                (formData.tags || []).includes(opt) ? 'bg-purple-600 text-white border-purple-500 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-purple-200'
                            }`}>{opt}</button>
                    ))}
                    {(formData.tags || []).filter(t => !PREDEFINED_TAGS.includes(t)).map(t => (
                        <button key={t} type="button" onClick={() => toggleTag(t)}
                            className="px-3 py-1.5 md:px-4 md:py-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-xl border bg-amber-500 text-white border-amber-400 shadow-lg">{t}</button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="Custom Tag..." className="flex-1 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold border border-slate-200 rounded-[1.25rem] md:rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white"
                        value={customTag} onChange={e => setCustomTag(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())} />
                    <button type="button" onClick={handleAddCustomTag} className="p-3.5 md:p-4 bg-slate-900 text-white rounded-[1.25rem] md:rounded-[1.5rem] hover:bg-slate-800 active:scale-95 transition-all"><Plus className="h-5 w-5" /></button>
                </div>
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-4 ml-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Briefing (Notes)</label>
                <button type="button" onClick={() => setIsNotesExpanded(true)} className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:underline"><Maximize2 className="h-3 w-3" /> Document Mode</button>
            </div>
            <textarea className="w-full px-6 md:px-8 py-6 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none h-40 resize-none shadow-inner custom-scrollbar overflow-y-auto"
                placeholder="Strategic briefing and deal intelligence..." value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
        </div>

        {formData.lastUpdatedBy && (
            <div className="flex items-center justify-end pt-4 border-t border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <History className="h-3 w-3 mr-2" />
                <span>Last updated by <span className="text-indigo-600">{formData.lastUpdatedBy}</span> on {formatDateTime(formData.lastUpdatedAt || '')}</span>
            </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 pt-8 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">Discard</button>
            <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-slate-950 text-white rounded-[1.25rem] md:rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                <Save className="h-4 w-4 text-indigo-400" /> Commit Identity
            </button>
        </div>
    </form>
  );

  return (
    <>
        {isNotesExpanded && (
            <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col animate-in fade-in duration-300 overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex items-center justify-between px-6 py-4 lg:px-12">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Tactical Briefing</h3>
                            <p className="text-[10px] font-bold text-slate-400">Document Editor Mode</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => setIsNotesExpanded(false)} className="px-6 py-2.5 bg-slate-950 text-white rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 hover:bg-slate-800"><Minimize2 className="h-3.5 w-3.5 text-indigo-400" /> Done</button>
                </div>
                {/* Scrollable Page Container */}
                <div className="flex-1 overflow-hidden flex justify-center p-4 lg:p-8 bg-slate-100/50">
                    <div className="bg-white shadow-2xl w-full max-w-4xl h-full rounded-2xl border border-slate-200 flex flex-col relative overflow-hidden">
                         <textarea 
                            className="flex-1 w-full h-full p-8 lg:p-12 resize-none outline-none border-none focus:ring-0 overflow-y-auto custom-scrollbar text-lg leading-relaxed text-slate-800 placeholder-slate-300"
                            placeholder="Type tactical notes here..." 
                            value={formData.notes || ''} 
                            onChange={e => setFormData({...formData, notes: e.target.value})} 
                            autoFocus 
                        />
                    </div>
                </div>
            </div>
        )}

        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-0 sm:p-3 md:p-6" onClick={onClose}>
            <div 
                className={`bg-white/90 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-white/60 transform transition-all duration-500 ease-out scale-100 ${
                    isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'
                }`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-white/40 sticky top-0 z-20">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate pr-4">{mode === 'view' ? 'Identity Overview' : (initialData ? 'Synchronize Record' : 'New Strategic Deal')}</h2>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        {mode === 'view' && <button onClick={() => setMode('edit')} className="px-4 py-2 md:px-6 md:py-2.5 bg-slate-950 text-white rounded-xl md:rounded-2xl flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"><Edit2 className="h-3.5 w-3.5 text-indigo-400" /> Modify</button>}
                        <button onClick={onClose} className="p-2 md:p-3 text-slate-400 hover:text-slate-900 transition-all"><X className="h-6 w-6" /></button>
                    </div>
                </div>
                <div className="overflow-y-auto p-5 md:p-10 pb-20 flex-1 custom-scrollbar">
                    {mode === 'view' ? renderView() : renderEdit()}
                </div>
            </div>
        </div>
    </>
  );
};
    