
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, AlignLeft, Flag, Link as LinkIcon, Edit2, Maximize2, Minimize2, CheckCircle, FileText, ExternalLink, Globe, Layout } from 'lucide-react';
import { Task, TaskPriority, TaskType } from '../../types';
import { formatDate, formatDateTime } from '../../utils';
import { CustomSelect } from '../ui/CustomSelect';
import { CustomDatePicker } from '../ui/CustomDatePicker';

interface ClientTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Task;
  companyId: number;
  isClientView?: boolean;
}

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
const TYPES: TaskType[] = ['General', 'Reel', 'Post', 'Story', 'Carousel', 'Video'];

export const ClientTaskForm: React.FC<ClientTaskFormProps> = ({ isOpen, onClose, onSubmit, initialData, companyId, isClientView = false }) => {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  
  // Removed editorRef auto-resize logic

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
        setMode(isClientView && !initialData.id ? 'edit' : 'view');
      } else {
        const today = new Date();
        const localIsoDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(today);

        setFormData({
          companyId,
          title: '',
          description: '',
          status: 'Not Started',
          priority: 'Medium',
          taskType: 'General',
          assignedTo: 'Unassigned',
          dueDate: localIsoDate,
          taskLink: '',
          isVisibleOnMainBoard: true // Default to true so they appear on main board if created here
        });
        setMode('edit');
      }
    }
  }, [isOpen, initialData, companyId, isClientView]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSubmit(formData);
    onClose();
  };

  const renderView = () => (
      <div className="space-y-8 animate-premium">
          <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      formData.priority === 'High' ? 'border-rose-100 bg-white text-rose-600 shadow-sm' :
                      formData.priority === 'Medium' ? 'border-amber-100 bg-white text-amber-600 shadow-sm' :
                      'border-emerald-100 bg-white text-emerald-600 shadow-sm'
                  }`}>
                      {formData.priority} Priority
                  </span>
                  {formData.isVisibleOnMainBoard && (
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 bg-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center gap-2">
                          <Globe className="h-3 w-3" /> Global Board
                      </span>
                  )}
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-slate-50 text-slate-500">
                      {formData.status}
                  </span>
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-8 relative z-10">{formData.title}</h2>
              
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-200/60 relative z-10">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Date</p>
                    <p className="text-xl font-black text-slate-900">{formatDate(formData.dueDate || '')}</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Context</p>
                    <p className="text-xl font-black text-indigo-600 uppercase tracking-tighter">Client Milestone</p>
                </div>
              </div>
          </div>

          {formData.taskLink && (
              <div className="p-6 bg-white/40 border border-white rounded-[1.5rem] shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <LinkIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Asset Reference</p>
                          <p className="text-sm font-bold text-slate-700 truncate max-w-[300px]">{formData.taskLink}</p>
                      </div>
                  </div>
                  <a href={formData.taskLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-950 text-white rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                      <ExternalLink className="h-4 w-4" />
                  </a>
              </div>
          )}

          <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-indigo-500" /> Deliverable Briefing
              </p>
              <div className="bg-white/40 p-8 rounded-[2rem] border border-white text-slate-600 font-medium leading-relaxed whitespace-pre-wrap min-h-[120px] shadow-sm italic ring-1 ring-black/[0.02] max-h-[250px] overflow-y-auto custom-scrollbar">
                  {formData.description || "No briefing provided for this strategic milestone."}
              </div>
          </div>
          
           {formData.lastUpdatedAt && (
               <div className="pt-6 border-t border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                    Last updated on {formatDateTime(formData.lastUpdatedAt)}
               </div>
          )}
      </div>
  );

  const renderEdit = () => (
      <form onSubmit={handleSubmit} className="space-y-8 animate-premium">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Task Identity</label>
              <input 
                type="text" required
                className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-lg font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner placeholder-slate-300"
                placeholder="What's the mission?"
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                <CustomSelect label="Category" value={formData.taskType || 'General'} onChange={(val) => setFormData({...formData, taskType: val as TaskType})} options={TYPES.map(t => ({ label: t, value: t }))} />
                <CustomSelect label="Mission Priority" value={formData.priority || 'Medium'} onChange={(val) => setFormData({...formData, priority: val as TaskPriority})} options={PRIORITIES.map(p => ({ label: p, value: p }))} />
                <div className="col-span-1 md:col-span-2">
                   <CustomDatePicker label="Target Delivery" value={formData.dueDate || ''} onChange={date => setFormData({...formData, dueDate: date})} />
                </div>
            </div>

            <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] flex items-center justify-between group transition-all hover:bg-indigo-50">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-all duration-500 ${formData.isVisibleOnMainBoard ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        <Layout className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Global Board Visibility</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Show this milestone in the main team workflow board.</p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={() => setFormData({...formData, isVisibleOnMainBoard: !formData.isVisibleOnMainBoard})}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-indigo-500/20 ${formData.isVisibleOnMainBoard ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${formData.isVisibleOnMainBoard ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">Reference / Asset URL</label>
                 <div className="relative group">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="url" 
                        className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner placeholder-slate-300"
                        placeholder="Paste link to reference doc or asset..."
                        value={formData.taskLink || ''}
                        onChange={e => setFormData({...formData, taskLink: e.target.value})}
                    />
                 </div>
            </div>

            <div>
                 <div className="flex items-center justify-between mb-4 ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText className="h-4 w-4" /> Tactical Briefing</label>
                    <button type="button" onClick={() => setIsNotesExpanded(true)} className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:underline"><Maximize2 className="h-3 w-3" /> Document Mode</button>
                 </div>
                 <textarea 
                    className="w-full bg-white border border-slate-200 rounded-[2rem] p-8 text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner h-40 resize-none custom-scrollbar overflow-y-auto"
                    placeholder="Provide details for our team to execute..."
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                 />
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
                <button type="button" onClick={() => initialData ? setMode('view') : onClose()} className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Discard</button>
                <button type="submit" className="px-10 py-4 bg-slate-950 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">
                    <Save className="h-4 w-4 text-indigo-400" /> Commit Identity
                </button>
            </div>
      </form>
  );

  return (
    <>
    {isNotesExpanded && (
        <div className="fixed inset-0 z-[110] bg-slate-50 flex flex-col animate-in fade-in duration-300 overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex items-center justify-between px-6 py-4 lg:px-12">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Deliverable Briefing</h3>
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
                        placeholder="Type technical requirements or asset links here..." 
                        value={formData.description || ''} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })} 
                        autoFocus 
                    />
                </div>
            </div>
        </div>
    )}

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
        <div className="bg-white/90 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/60 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white/40">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {mode === 'view' ? 'Milestone Intel' : 'New Tactical Entry'}
                </h2>
                <div className="flex items-center gap-3">
                    {mode === 'view' && !isClientView && (
                        <button onClick={() => setMode('edit')} className="px-6 py-2.5 bg-slate-950 text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            <Edit2 className="h-4 w-4 text-indigo-400" /> Modify
                        </button>
                    )}
                    <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 transition-all"><X className="h-6 w-6" /></button>
                </div>
            </div>
            <div className="p-10 pb-20 overflow-y-auto custom-scrollbar">
                {mode === 'view' ? renderView() : renderEdit()}
            </div>
        </div>
    </div>
    </>
  );
};
    