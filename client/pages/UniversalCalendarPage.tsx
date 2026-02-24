
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { tasksApi, meetingsApi, crmApi } from '../services/api';
import { Task, Meeting, CalendarItem } from '../types';
import { ChevronLeft, ChevronRight, CheckSquare, Video, Clock, Filter, Calendar, Briefcase, X, Plus, AlertCircle, MoreHorizontal, Target, Zap, Layout } from 'lucide-react';
import { TaskForm } from '../components/tasks/TaskForm';
import { MeetingForm } from '../components/meetings/MeetingForm';
import { DayDetailsModal } from '../components/calendar/DayDetailsModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLayout } from '../context/LayoutContext';

export const UniversalCalendarPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isSidebarCollapsed } = useLayout();
    const [items, setItems] = useState<CalendarItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [companyMap, setCompanyMap] = useState<Record<number, string>>({});

    const [showTasks, setShowTasks] = useState(true);
    const [showMeetings, setShowMeetings] = useState(true);

    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

    // Day Details Modal State
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [tasksData, meetingsData, crmData] = await Promise.all([
                tasksApi.getAll(),
                meetingsApi.getAll(),
                crmApi.getAll()
            ]);

            const map: Record<number, string> = {};
            crmData.crmList.forEach(c => map[c.id] = c.company);
            setCompanyMap(map);

            const allItems: CalendarItem[] = [];
            tasksData.forEach(t => {
                if (t.status !== 'Completed' && t.status !== 'Done') { 
                    allItems.push({
                        id: `task-${t.id}`,
                        dateStr: t.dueDate,
                        sortTime: 0,
                        title: t.title,
                        type: 'task',
                        data: t,
                        status: t.status,
                        priority: t.priority
                    });
                }
            });

            meetingsData.forEach(m => {
                const mDate = new Date(m.dateTime);
                const localDateStr = `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}-${String(mDate.getDate()).padStart(2, '0')}`;
                allItems.push({
                    id: `meeting-${m.id}`,
                    dateStr: localDateStr,
                    sortTime: mDate.getTime(),
                    title: m.title,
                    type: 'meeting',
                    data: m,
                    status: m.status
                });
            });

            setItems(allItems);
        } catch (e) {
            console.error(e);
            showToast("Sync failed", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        let mounted = true;
        const loadData = async () => {
            if (mounted) {
                await fetchData();
            }
        };
        loadData();
        return () => { mounted = false; };
    }, []);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const jumpToToday = () => setCurrentDate(new Date());

    const handleDayClick = (dateStr: string) => {
        // Parse date from YYYY-MM-DD string to ensure correct day in local time
        const [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        
        setSelectedDate(dateObj);
        setIsDayDetailsOpen(true);
    };

    const handleCreateTaskForDate = (date: Date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        setEditingTask({ 
            title: '', 
            status: 'Not Started', 
            priority: 'Medium', 
            assignedTo: user?.name || 'Unassigned',
            dueDate: dateStr 
        } as Task);
        setIsTaskModalOpen(true);
    };

    const handleCreateMeetingForDate = (date: Date) => {
        const now = new Date();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:00`;
        const formatted = `${dateStr}T${timeStr}`;

        setEditingMeeting({
            title: '',
            status: 'Scheduled',
            dateTime: formatted
        } as Meeting);
        setIsMeetingModalOpen(true);
    };

    const selectedDayItems = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        return items.filter(i => i.dateStr === dateStr);
    }, [selectedDate, items]);

    const renderCells = () => {
        const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const cells = [];

        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="bg-slate-50/20 border-b border-r border-slate-100 min-h-[140px]" />);
        }

        const todayStr = new Date().toISOString().split('T')[0];

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayItems = items.filter(i => i.dateStr === dateStr && ((i.type === 'task' && showTasks) || (i.type === 'meeting' && showMeetings)));
            const isToday = todayStr === dateStr;

            cells.push(
                <div 
                    key={day} 
                    onClick={() => handleDayClick(dateStr)}
                    className={`border-b border-r border-slate-100/60 min-h-[140px] p-3 hover:bg-white/60 transition-all relative flex flex-col cursor-pointer group active:bg-white/80 ${isToday ? 'bg-indigo-50/10' : 'bg-white/20'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className={`text-xs lg:text-sm font-black w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-xl transition-all group-hover:scale-110 ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 group-hover:bg-white group-hover:text-slate-900 group-hover:shadow-sm'}`}>
                            {day}
                        </div>
                        {isToday && (
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                        )}
                    </div>
                    
                    <div className="space-y-1.5 flex-1 overflow-hidden">
                        {dayItems.slice(0, 3).map(item => (
                            <div key={item.id} className={`p-1.5 rounded-lg border text-[9px] font-black uppercase tracking-tight truncate shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.02] flex items-center gap-1.5 ${
                                item.type === 'task' 
                                    ? 'bg-white/80 border-slate-100 text-slate-700' 
                                    : 'bg-indigo-50/80 border-indigo-100 text-indigo-700'
                            }`}>
                                <div className={`w-1 h-1 rounded-full ${item.type === 'task' ? 'bg-slate-400' : 'bg-indigo-500'}`} />
                                <span className="truncate">{item.title}</span>
                            </div>
                        ))}
                        {dayItems.length > 3 && (
                            <div className="text-[8px] font-black text-slate-400 pl-1 group-hover:text-indigo-500 transition-colors uppercase tracking-widest mt-1">
                                +{dayItems.length - 3} More Events
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return cells;
    };

    return (
        <div className="flex min-h-screen mesh-bg relative">
            <div className="glass-canvas" />
            <Sidebar />
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
                <Navbar />
                
                <div className="px-4 lg:px-12 py-6 lg:py-10 pb-32">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 lg:gap-8 mb-8 lg:mb-12 animate-premium">
                        <div>
                            <div className="flex items-center gap-3 mb-2 lg:mb-4">
                                <div className="h-1.5 lg:h-2 w-1.5 lg:w-2 rounded-full bg-brand-500 animate-pulse" />
                                <span className="text-[9px] lg:text-[10px] font-black text-brand-600 uppercase tracking-[0.5em]">Global Timeline</span>
                            </div>
                            <h1 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none display-text">Universal.</h1>
                            <p className="text-sm lg:text-lg text-slate-500 mt-2 lg:mt-4 font-medium max-w-xl">
                                Synchronized strategic timeline and event registry across all operational nodes.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                             <div className="flex items-center gap-2 p-1 bg-white/40 rounded-2xl border border-white/60 shadow-sm w-full sm:w-auto">
                                <button 
                                    onClick={() => setShowTasks(!showTasks)}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showTasks ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'text-slate-500 hover:bg-white border-transparent'}`}
                                >
                                    <CheckSquare className="h-3 w-3" /> Deliverables
                                </button>
                                <button 
                                    onClick={() => setShowMeetings(!showMeetings)}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showMeetings ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'text-slate-500 hover:bg-white border-transparent'}`}
                                >
                                    <Video className="h-3 w-3" /> Syncs
                                </button>
                             </div>

                             <div className="flex items-center justify-between gap-3 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 w-full sm:w-auto shadow-sm">
                                 <button onClick={handlePrevMonth} className="p-3 hover:bg-white hover:text-indigo-600 text-slate-500 rounded-xl transition-all shadow-sm active:scale-90"><ChevronLeft className="h-5 w-5" /></button>
                                 <button onClick={jumpToToday} className="text-sm font-black text-slate-900 min-w-[120px] text-center hover:text-indigo-600 transition-colors uppercase tracking-tight">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</button>
                                 <button onClick={handleNextMonth} className="p-3 hover:bg-white hover:text-indigo-600 text-slate-500 rounded-xl transition-all shadow-sm active:scale-90"><ChevronRight className="h-5 w-5" /></button>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-3xl rounded-[2rem] lg:rounded-[3.5rem] border border-white/60 shadow-premium overflow-hidden flex flex-col flex-1 min-h-[600px] lg:min-h-[700px] relative">
                        {/* Wrapper for horizontal scroll on mobile */}
                        <div className="overflow-x-auto custom-scrollbar h-full relative z-10">
                            <div className="min-w-[800px] h-full flex flex-col">
                                <div className="grid grid-cols-7 bg-slate-50/30 border-b border-slate-100/60">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                        <div key={d} className="py-5 lg:py-6 text-center text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-white/20">
                                    {isLoading ? (
                                        <div className="col-span-7 flex flex-col items-center justify-center p-32 gap-6">
                                            <div className="animate-spin rounded-full h-12 w-12 border-[4px] border-slate-100 border-t-indigo-600" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Timeline...</p>
                                        </div>
                                    ) : renderCells()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TaskForm 
                isOpen={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                onSubmit={async (data) => {
                    const auditData = {
                        lastUpdatedBy: user?.name || 'Unknown',
                        lastUpdatedAt: new Date().toISOString()
                    };
                    const finalData = { ...data, ...auditData };
                    try {
                        if (editingTask && editingTask.id) {
                            await tasksApi.update(editingTask.id, finalData);
                            showToast("Task updated", "success");
                        } else {
                            await tasksApi.create(finalData as Task);
                            showToast("Task created", "success");
                        }
                        fetchData();
                    } catch(e) {
                        showToast("Operation failed", "error");
                    }
                }}
                initialData={editingTask}
                companyMap={companyMap}
            />

            <MeetingForm 
                isOpen={isMeetingModalOpen}
                onClose={() => setIsMeetingModalOpen(false)}
                onSubmit={async (data) => {
                    const auditData = {
                        lastUpdatedBy: user?.name || 'Unknown',
                        lastUpdatedAt: new Date().toISOString()
                    };
                    const finalData = { ...data, ...auditData };
                    try {
                        if (editingMeeting && editingMeeting.id) {
                            await meetingsApi.update(editingMeeting.id, finalData);
                            showToast("Meeting updated", "success");
                        } else {
                            await meetingsApi.create(finalData as Meeting);
                            showToast("Meeting scheduled", "success");
                        }
                        fetchData();
                    } catch(e) {
                        showToast("Operation failed", "error");
                    }
                }}
                initialData={editingMeeting}
            />

            {selectedDate && (
                <DayDetailsModal 
                    isOpen={isDayDetailsOpen} 
                    onClose={() => setIsDayDetailsOpen(false)} 
                    date={selectedDate} 
                    items={selectedDayItems}
                    onEditTask={(task) => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                    }}
                    onEditMeeting={(meeting) => {
                        setEditingMeeting(meeting);
                        setIsMeetingModalOpen(true);
                    }}
                    onAddTask={() => handleCreateTaskForDate(selectedDate)}
                    onAddMeeting={() => handleCreateMeetingForDate(selectedDate)}
                />
            )}
        </div>
    );
};
