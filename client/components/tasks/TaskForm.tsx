
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, AlignLeft, Flag, CheckCircle } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { CustomDatePicker } from '../ui/CustomDatePicker';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Task;
}

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
const STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Completed'];
const ASSIGNEES = ['Vallapata', 'John Doe', 'Demo User', 'Unassigned'];

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Task>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'Not Started',
          priority: 'Medium',
          assignedTo: 'Unassigned',
          dueDate: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Task Name</label>
              <input 
                type="text"
                required
                className="w-full text-lg font-semibold placeholder-gray-300 border-none focus:ring-0 p-0 text-gray-900"
                placeholder="What needs to be done?"
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                
                {/* Status */}
                <div>
                   <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <CheckCircle className="h-4 w-4" /> Status
                   </label>
                   <select 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as TaskStatus})}
                   >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>

                {/* Priority */}
                <div>
                   <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Flag className="h-4 w-4" /> Priority
                   </label>
                   <select 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                   >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                </div>

                {/* Assigned To */}
                <div>
                   <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <User className="h-4 w-4" /> Assignee
                   </label>
                   <select 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        value={formData.assignedTo}
                        onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                   >
                        {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
                   </select>
                </div>

                {/* Due Date */}
                <div>
                   <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4" /> Due Date
                   </label>
                   <div className="w-full">
                        <CustomDatePicker 
                            value={formData.dueDate || ''}
                            onChange={date => setFormData({...formData, dueDate: date})}
                            placeholder="Select Date"
                        />
                   </div>
                </div>

            </div>

            {/* Description */}
            <div className="pt-4 border-t border-gray-50">
                 <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <AlignLeft className="h-4 w-4" /> Description
                 </label>
                 <textarea 
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:ring-2 focus:ring-brand-500 focus:outline-none h-32 resize-none"
                    placeholder="Add more details about this task..."
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                 />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                    Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-xl font-medium shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-colors">
                    <Save className="h-4 w-4" /> Save Task
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
