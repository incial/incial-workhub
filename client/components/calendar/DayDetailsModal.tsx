
import React, { useMemo } from 'react';
import { X, Clock, CheckSquare, Video as VideoIcon, Link as LinkIcon, Building, Calendar, ArrowRight, Plus } from 'lucide-react';
import { CalendarItem, Meeting, Task } from '../../types';
import { getTaskPriorityStyles, getTaskStatusStyles } from '../../utils';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  items: CalendarItem[];
  onEditTask: (task: Task) => void;
  onEditMeeting: (meeting: Meeting) => void;
  onAddTask: () => void;
  onAddMeeting: () => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ 
    isOpen, 
    onClose, 
    date, 
    items, 
    onEditTask, 
    onEditMeeting,
    onAddTask,
    onAddMeeting
}) => {
  if (!isOpen) return null;

  const { meetings, tasks } = useMemo(() => {
      const m = items.filter(i => i.type === 'meeting').sort((a, b) => a.sortTime - b.sortTime);
      const t = items.filter(i => i.type === 'task').sort((a, b) => {
          const priorityWeight: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityWeight[b.priority || 'Low'] || 0) - (priorityWeight[a.priority || 'Low'] || 0);
      });
      return { meetings: m, tasks: t };
  }, [items]);

  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white/90 backdrop-blur-3xl rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col border border-white/60 transform transition-all scale-100" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-white/40 flex items-start justify-between shrink-0 backdrop-blur-xl relative z-20">
            <div className="flex items-center gap-6">
                <div className="h-20 w-20 bg-slate-950 rounded-[1.8rem] flex flex-col items-center justify-center text-white shadow-xl shadow-slate-200 ring-4 ring-white/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-4xl font-black tracking-tighter leading-none">{date.getDate()}</span>
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{formattedDate}</h2>
                    <div className="flex items-center gap-3">
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black border border-indigo-100 uppercase tracking-widest">
                            {items.length} Events
                        </span>
                        <span className="text-xs font-bold text-slate-400">Scheduled for this cycle</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all active:scale-95"
            >
                <X className="h-6 w-6" />
            </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-10 bg-gradient-to-b from-white/20 to-white/60 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full">
                
                {/* Left: Timeline (Meetings) */}
                <div className="flex flex-col h-full relative">
                    <div className="flex items-center justify-between mb-6 sticky -top-2 z-10 bg-white/80 backdrop-blur-xl py-3 px-1 rounded-2xl border border-white/50 shadow-sm">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                            <Clock className="h-4 w-4 text-indigo-500" /> Timeline Syncs
                        </h3>
                        <button 
                            onClick={onAddMeeting} 
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
                        >
                            <Plus className="h-3 w-3" /> Schedule
                        </button>
                    </div>
                    
                    {meetings.length > 0 ? (
                        <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-4 pt-2">
                            {meetings.map((item) => {
                                const meeting = item.data as Meeting;
                                const timeStr = new Date(meeting.dateTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
                                return (
                                    <div key={item.id} className="relative pl-8 group cursor-pointer" onClick={() => onEditMeeting(meeting)}>
                                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-indigo-500 border-4 border-white shadow-md group-hover:scale-125 transition-transform" />
                                        
                                        <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{timeStr}</span>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                    meeting.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                                                }`}>{meeting.status}</span>
                                            </div>
                                            <h4 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">{meeting.title}</h4>
                                            
                                            {meeting.meetingLink ? (
                                                <div className="flex items-center gap-2">
                                                    <a 
                                                        href={meeting.meetingLink} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()} 
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 hover:border-indigo-600 transition-all"
                                                    >
                                                        <VideoIcon className="h-3 w-3" /> Join Link
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-bold text-slate-400 italic">No digital channel attached</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[2rem] border border-slate-200 border-dashed">
                            <div className="h-16 w-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                                <Calendar className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-900">No synchronized meetings</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wide">Timeline is clear for this cycle</p>
                        </div>
                    )}
                </div>

                {/* Right: Tasks */}
                <div className="flex flex-col h-full relative">
                    <div className="flex items-center justify-between mb-6 sticky -top-2 z-10 bg-white/80 backdrop-blur-xl py-3 px-1 rounded-2xl border border-white/50 shadow-sm">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                            <CheckSquare className="h-4 w-4 text-emerald-500" /> Deliverables
                        </h3>
                        <button 
                            onClick={onAddTask} 
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-100 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                        >
                            <Plus className="h-3 w-3" /> New Task
                        </button>
                    </div>

                    {tasks.length > 0 ? (
                        <div className="space-y-4 pt-2">
                            {tasks.map((item) => {
                                const task = item.data as Task;
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => onEditTask(task)}
                                        className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getTaskPriorityStyles(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg ${getTaskStatusStyles(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-bold text-slate-900 mb-4 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">{task.title}</h4>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                <Building className="h-3 w-3" />
                                                <span className="truncate max-w-[150px]">{task.companyId ? 'Client Project' : 'Internal Ops'}</span>
                                            </div>
                                            {task.taskLink && (
                                                <div className="flex items-center gap-1 text-slate-300 group-hover:text-indigo-400 transition-colors">
                                                    <LinkIcon className="h-3.5 w-3.5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[2rem] border border-slate-200 border-dashed">
                            <div className="h-16 w-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                                <CheckSquare className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-900">No deliverables due</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wide">Queue is empty for this date</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
