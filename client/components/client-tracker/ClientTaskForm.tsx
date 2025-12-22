
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, AlignLeft, Flag, Link as LinkIcon, Edit2, Maximize2, Minimize2, CheckCircle } from 'lucide-react';
import { Task, TaskPriority, TaskType } from '../../types';
import { formatDate, formatDateTime } from '../../utils';
import { CustomSelect } from '../ui/CustomSelect';

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

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
        // If it's client view, they can only view existing tasks. If no ID, it's a new task they are creating.
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
          isVisibleOnMainBoard: false
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
      <div className="space-y-8">
          <div>
              <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      formData.priority === 'High' ? 'border-rose-100 bg-rose-50 text-rose-700' :
                      formData.priority === 'Medium' ? 'border-amber-100 bg-amber-50 text-amber-700' :
                      'border-emerald-100 bg-emerald-50 text-emerald-700'
                  }`}>
                      {formData.priority} Priority
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 bg-indigo-50 text-indigo-700">
                      {formData.taskType}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 bg-gray-50 text-gray-600">
                      {formData.status}
                  </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{formData.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-inner">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> Deadline
                  </p>
                  <p className="font-bold text-gray-900 text-lg">{formatDate(formData.dueDate || '')}</p>
              </div>
              <div className="p-5 bg-brand-50/30 rounded-2xl border border-brand-100/50 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5" /> Project Progress
                  </p>
                  <p className="font-bold text-brand-900 text-lg">In Sync</p>
              </div>
          </div>

          {formData.taskLink && (
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                  <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <LinkIcon className="h-3.5 w-3.5" /> Project Link
                  </h3>
                  <a href={formData.taskLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline break-all">
                      Open Delivery Resource
                  </a>
              </div>
          )}

          <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <AlignLeft className="h-4 w-4" /> Deliverable Brief
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px] shadow-sm">
                  {formData.description || <span className="text-gray-400 italic">No briefing provided.</span>}
              </div>
          </div>
          
           {formData.lastUpdatedAt && (
               <div className="pt-6 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Last updated on {formatDateTime(formData.lastUpdatedAt)}
               </div>
          )}
      </div>
  );

  const renderEdit = () => (
      <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Request Title</label>
              <input 
                type="text"
                required
                className="w-full text-xl font-bold placeholder-gray-300 border-none focus:ring-0 p-0 text-gray-900"
                placeholder="What do you need done?"
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                 <div>
                    <CustomSelect 
                        label="Category"
                        value={formData.taskType || 'General'}
                        onChange={(val) => setFormData({...formData, taskType: val as TaskType})}
                        options={TYPES.map(t => ({ label: t, value: t }))}
                    />
                </div>

                <div>
                    <CustomSelect 
                        label="Priority"
                        value={formData.priority || 'Medium'}
                        onChange={(val) => setFormData({...formData, priority: val as TaskPriority})}
                        options={PRIORITIES.map(p => ({ label: p, value: p }))}
                    />
                </div>

                 <div className="col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Target Date
                    </label>
                    <input 
                        type="date"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-gray-900 text-sm focus:ring-2 focus:ring-brand-500/20"
                        value={formData.dueDate || ''}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    />
                </div>
            </div>

            <div>
                 <div className="flex items-center justify-between mb-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Briefing & Resource Links
                     </label>
                 </div>
                 <textarea 
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500/20 resize-none h-40 shadow-sm"
                    placeholder="Provide details or links for our team to execute this request..."
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                 />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                <button type="button" onClick={() => initialData ? setMode('view') : onClose()} className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all">
                    Cancel
                </button>
                <button type="submit" className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-white bg-brand-600 hover:bg-brand-700 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95">
                    Submit Request
                </button>
            </div>
      </form>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                    {mode === 'view' ? 'Request Overview' : 'New Milestone Request'}
                </h2>
                <div className="flex items-center gap-2">
                    {/* Hiding Edit button for clients on existing tasks */}
                    {mode === 'view' && !isClientView && (
                        <button onClick={() => setMode('edit')} className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl">
                            <Edit2 className="h-5 w-5" />
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="p-8 overflow-y-auto max-h-[85vh] custom-scrollbar">
                {mode === 'view' ? renderView() : renderEdit()}
            </div>
        </div>
    </div>
  );
};
