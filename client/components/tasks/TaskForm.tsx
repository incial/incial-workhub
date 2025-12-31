
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, User as UserIcon, AlignLeft, Flag, CheckCircle, History, Link as LinkIcon, ExternalLink, Edit2, Clock, Building, Maximize2, Minimize2, Briefcase, FileText, Trash2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskType, User } from '../../types';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { CustomSelect } from '../ui/CustomSelect';
import { UserSelect } from '../ui/UserSelect';
import { formatDate, formatDateTime } from '../../utils';
import { usersApi } from '../../services/api';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Task;
  companyMap?: Record<number, string>;
  onDelete?: (id: number) => void;
}

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
const STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'In Review', 'Posted', 'Completed'];
const TYPES: TaskType[] = ['General', 'Reel', 'Post', 'Story', 'Carousel', 'Video'];

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, initialData, companyMap, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [users, setUsers] = useState<User[]>([]);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  
  // Removed editorRef auto-resize logic

  useEffect(() => {
    if (isOpen) {
        usersApi.getAll().then(setUsers);
        if (initialData) {
            setFormData(initialData);
            setMode('view');
        } else {
            setFormData({
                title: '', 
                status: 'Not Started', 
                priority: 'Medium', 
                taskType: 'General',
                assignedTo: 'Unassigned',
                assigneeId: undefined,
                dueDate: new Date().toISOString().split('T')[0],
                taskLink: '',
                companyId: undefined // Enforce internal by default
            });
            setMode('edit');
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleUserChange = (userId: number, userName: string) => {
      setFormData(prev => ({ ...prev, assigneeId: userId, assignedTo: userName }));
  };

  return (
    <>
    {isNotesExpanded && (
        <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col animate-in fade-in duration-300 overflow-hidden">
            {/* Sticky Header */}
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
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsNotesExpanded(false)} 
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:bg-slate-800 active:scale-95"
                    >
                        <Minimize2 className="h-3.5 w-3.5 text-indigo-400" /> Done
                    </button>
                </div>
            </div>

            {/* Scrollable Page Container */}
            <div className="flex-1 overflow-hidden flex justify-center p-4 lg:p-8 bg-slate-100/50">
                <div className="bg-white shadow-2xl w-full max-w-4xl h-full rounded-2xl border border-slate-200 flex flex-col relative overflow-hidden">
                        <textarea 
                        className="flex-1 w-full h-full p-8 lg:p-12 resize-none outline-none border-none focus:ring-0 overflow-y-auto custom-scrollbar text-lg leading-relaxed text-slate-800 placeholder-slate-300" 
                        placeholder="Type detailed tactical requirements here..." 
                        value={formData.description || ''} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })} 
                        autoFocus 
                    />
                </div>
            </div>
        </div>
    )}

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] lg:rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-white/60 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-6 lg:p-8 border-b border-gray-100 bg-white/40">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {mode === 'view' ? 'Milestone Intel' : (initialData?.id ? 'Synchronize Milestone' : 'New Internal Milestone')}
            </h2>
            <div className="flex items-center gap-3">
                {/* Delete Action Integrated Here */}
                {initialData?.id && onDelete && (
                    <button 
                        onClick={() => onDelete(initialData.id!)} 
                        className="p-3 bg-rose-50 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-2xl transition-all active:scale-95" 
                        title="Purge Task"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                )}

                {mode === 'view' && (
                    <button onClick={() => setMode('edit')} className="px-5 py-2.5 bg-slate-950 text-white rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                        <Edit2 className="h-3.5 w-3.5" /> Modify
                    </button>
                )}
                <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all">
                    <X className="h-6 w-6" />
                </button>
            </div>
        </div>

        <div className="overflow-y-auto p-6 lg:p-10 pb-20 flex-1 custom-scrollbar">
            {mode === 'view' ? (
                <div className="space-y-8 animate-premium">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 bg-indigo-50 text-indigo-700">
                                    {formData.taskType}
                                </span>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-slate-50 text-slate-500`}>
                                    {formData.status} • {formData.priority} Priority
                                </span>
                            </div>
                            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-tight">{formData.title}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-6 lg:p-8 bg-white/60 rounded-[2rem] border border-white/80 shadow-inner">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assignee</p>
                            <p className="text-base lg:text-lg font-black text-slate-900 truncate">{formData.assignedTo || 'Unassigned'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Date</p>
                            <p className="text-base lg:text-lg font-black text-slate-900">{formatDate(formData.dueDate || '')}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Origin Node</p>
                            <p className="text-base lg:text-lg font-black text-brand-600 truncate">
                                {(formData.companyId && companyMap) ? companyMap[formData.companyId] : 'INTERNAL_OPS'}
                            </p>
                        </div>
                    </div>

                    {formData.taskLink && (
                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4 min-w-0">
                                <LinkIcon className="h-5 w-5 text-blue-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Asset Link</p>
                                    <p className="text-sm font-bold text-blue-700 truncate">{formData.taskLink}</p>
                                </div>
                            </div>
                            <a href={formData.taskLink} target="_blank" className="p-3 bg-white text-blue-600 rounded-xl shadow-sm hover:scale-110 transition-transform">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    )}

                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <AlignLeft className="h-4 w-4" /> Strategic Briefing
                        </p>
                        <div className="bg-white/40 p-6 lg:p-8 rounded-[2rem] text-slate-600 font-medium leading-relaxed italic whitespace-pre-wrap border border-white text-sm lg:text-base max-h-[250px] overflow-y-auto custom-scrollbar">
                            {formData.description || "No tactical briefing provided for this milestone."}
                        </div>
                    </div>

                    {formData.lastUpdatedBy && (
                        <div className="flex items-center justify-end pt-4 border-t border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <History className="h-3 w-3 mr-2" />
                            <span>Last updated by <span className="text-indigo-600">{formData.lastUpdatedBy}</span> on {formatDateTime(formData.lastUpdatedAt || '')}</span>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); onClose(); }} className="space-y-8 animate-premium">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Objective Title</label>
                        <input type="text" required className="w-full px-6 lg:px-8 py-4 lg:py-5 bg-white border border-gray-200 rounded-[1.5rem] text-base lg:text-lg font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner" 
                            value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Project Objective" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 lg:p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <CustomSelect 
                            label="Category" 
                            value={formData.taskType || 'General'} 
                            onChange={(val) => setFormData({...formData, taskType: val as TaskType})} 
                            options={TYPES.map(t => ({ label: t, value: t }))} 
                        />
                        <CustomSelect label="Urgency / Priority" value={formData.priority || ''} onChange={(val) => setFormData({...formData, priority: val as TaskPriority})} options={PRIORITIES.map(p => ({ label: p, value: p }))} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomSelect label="Execution Status" value={formData.status || ''} onChange={(val) => setFormData({...formData, status: val as TaskStatus})} options={STATUSES.map(s => ({ label: s, value: s }))} />
                        <UserSelect 
                            label="Node Assignee" 
                            value={formData.assigneeId || formData.assignedTo || 'Unassigned'} 
                            onChange={handleUserChange} 
                            users={users} 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomDatePicker label="Target Delivery" value={formData.dueDate || ''} onChange={date => setFormData({...formData, dueDate: date})} />
                        <div className="flex flex-col justify-end">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Context</label>
                            <div className="px-6 py-4 bg-slate-100/50 border border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="h-3 w-3" /> Internal Operation
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Asset Reference (URL)</label>
                        <div className="relative group">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500" />
                            <input type="url" className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-inner"
                                value={formData.taskLink || ''} onChange={e => setFormData({...formData, taskLink: e.target.value})} placeholder="https://..." />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2 ml-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Briefing</label>
                            <button type="button" onClick={() => setIsNotesExpanded(true)} className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:underline"><Maximize2 className="h-3 w-3" /> Document Mode</button>
                        </div>
                        <textarea className="w-full px-6 lg:px-8 py-6 bg-white border border-gray-200 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner h-32 resize-none custom-scrollbar overflow-y-auto"
                            placeholder="Detail the execution steps..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100">
                        <button type="button" onClick={() => initialData?.id ? setMode('view') : onClose()} className="px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">Discard</button>
                        <button type="submit" className="px-10 py-4 text-[11px] font-black text-white bg-slate-950 hover:bg-slate-900 rounded-[1.5rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                            <Save className="h-4 w-4 text-indigo-400" /> Commit Milestone
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
    </>
  );
};
    