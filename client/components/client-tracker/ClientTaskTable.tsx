
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, TaskType } from '../../types';
import { formatDate, isRecentlyUpdated } from '../../utils';
import { Edit2, Trash2, Paperclip, Check, ChevronDown, ExternalLink, Layout, Flag, Globe } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ClientTaskTableProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: (task: Task, newStatus: TaskStatus) => void;
  onPriorityChange?: (task: Task, newPriority: TaskPriority) => void;
  onToggleVisibility?: (task: Task) => void;
  isClientView?: boolean;
  userAvatarMap?: Record<string, string>;
  readOnly?: boolean;
}

const getStatusStyles = (status: string) => {
    switch(status) {
        case 'Done': 
        case 'Completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        case 'Posted': return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
        case 'In Review': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
        case 'Dropped': 
        case 'drop': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
        case 'In Progress': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
};

const PriorityDropdown = ({ task, onPriorityChange, disabled }: { task: Task; onPriorityChange?: (t: Task, p: TaskPriority) => void; disabled?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const options: TaskPriority[] = ['Low', 'Medium', 'High'];

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({ top: rect.bottom + 8, left: rect.left });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                const portal = document.getElementById('priority-portal-menu');
                if (portal && portal.contains(event.target as Node)) {
                    return;
                }
                setIsOpen(false);
            }
        };

        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getPriorityStyles = (p: string) => {
        if (p === 'High') return "bg-rose-50 text-rose-700 border-rose-100";
        if (p === 'Medium') return "bg-amber-50 text-amber-700 border-amber-100";
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
    };

    const menuContent = isOpen && (
        <div 
            id="priority-portal-menu"
            className="fixed z-[9999] w-32 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 ring-1 ring-black/5"
            style={{ top: coords.top, left: coords.left }}
        >
            <div className="p-1">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            onPriorityChange?.(task, opt); 
                            setIsOpen(false); 
                        }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center justify-between group ${task.priority === opt ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        {opt}
                        {task.priority === opt && <Check className="h-3 w-3 text-brand-600" />}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="relative inline-block">
            <button 
                ref={triggerRef}
                disabled={disabled}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all ${!disabled ? 'hover:opacity-80 active:scale-95' : ''} ${getPriorityStyles(task.priority)}`}
            >
                <Flag className="h-3 w-3" />
                {task.priority}
                {!disabled && <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
            </button>
            {isOpen && !disabled && createPortal(menuContent, document.body)}
        </div>
    );
};

export const ClientTaskTable: React.FC<ClientTaskTableProps> = ({ 
    tasks, 
    onEdit, 
    onDelete, 
    onStatusChange, 
    onPriorityChange, 
    onToggleVisibility, 
    isClientView = false,
    userAvatarMap,
    readOnly = false
}) => {
  return (
    <div className="relative w-full">
        {/* Reinforced internal scroll with explicit viewport capture */}
        <div className="overflow-x-auto overflow-y-auto h-[450px] custom-scrollbar border-t border-gray-100">
            <table className="min-w-[1000px] w-full text-left border-collapse whitespace-nowrap">
                <thead>
                    <tr className="z-30">
                        <th className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">Task name</th>
                        <th className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">Status</th>
                        <th className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">Content Type</th>
                        <th className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">Due date</th>
                        <th className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm text-center">Priority</th>
                        <th className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm text-center">Asset</th>
                        {!isClientView && !readOnly && <th className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm text-right">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 z-10">
                    {tasks.map(task => {
                        const isCompleted = (task.status === 'Completed' || task.status === 'Done');
                        const shouldAnimate = isCompleted && isRecentlyUpdated(task.lastUpdatedAt, 10);

                        return (
                        <tr 
                            key={task.id} 
                            className={`group hover:bg-white transition-all duration-300 ${shouldAnimate ? 'animate-task-complete' : ''}`}
                        >
                            <td className="px-6 py-5 bg-white group-hover:bg-white transition-colors border-r border-transparent group-hover:border-gray-50">
                                 <div className="flex flex-col gap-1">
                                    <button 
                                        onClick={() => onEdit?.(task)} 
                                        className="text-sm font-bold text-gray-900 text-left truncate max-w-[220px] hover:text-brand-600 transition-colors flex items-center gap-2"
                                    >
                                        {task.isVisibleOnMainBoard && (
                                            <span title="Pinned to Main Board">
                                                <Globe className="h-3 w-3 text-indigo-500" />
                                            </span>
                                        )}
                                        {task.title}
                                    </button>
                                    <p className="text-[10px] text-gray-400 font-medium italic truncate max-w-[200px]">
                                        {task.description || 'No additional details'}
                                    </p>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm w-fit ${getStatusStyles(task.status)}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    {task.status}
                                </span>
                            </td>

                            <td className="px-6 py-5">
                                 <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                    {task.taskType || 'General'}
                                 </span>
                            </td>

                            <td className="px-6 py-5">
                                <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">{formatDate(task.dueDate)}</span>
                            </td>

                            <td className="px-6 py-5 text-center">
                                <PriorityDropdown task={task} onPriorityChange={onPriorityChange} disabled={readOnly} />
                            </td>

                            <td className="px-6 py-5 text-center">
                                 {task.taskLink ? (
                                    <a 
                                        href={task.taskLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-xl inline-flex transition-all hover:scale-110 shadow-sm border border-blue-100"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                 ) : (
                                     <span className="text-gray-300">-</span>
                                 )}
                            </td>

                            {!isClientView && !readOnly && (
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                        <button onClick={() => onEdit?.(task)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors" title="View Details">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => onToggleVisibility?.(task)} 
                                            className={`p-2 rounded-xl transition-all ${task.isVisibleOnMainBoard ? 'text-indigo-600 bg-indigo-100 shadow-inner' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                            title={task.isVisibleOnMainBoard ? "Remove from main board" : "Promote to main board"}
                                        >
                                            <Layout className={`h-4 w-4 ${task.isVisibleOnMainBoard ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`} />
                                        </button>
                                        <button onClick={() => onDelete?.(task.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
    </div>
  );
};
    