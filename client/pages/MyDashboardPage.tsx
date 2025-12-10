
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { tasksApi, meetingsApi } from '../services/api';
import { Task, Meeting } from '../types';
import { 
    CheckCircle2, 
    Calendar, 
    Clock, 
    ArrowRight, 
    ListTodo, 
    Video, 
    Plus, 
    TrendingUp,
    AlertCircle,
    CalendarDays
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils';

export const MyDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [tasksData, meetingsData] = await Promise.all([
                    tasksApi.getAll(),
                    meetingsApi.getAll()
                ]);

                // Filter Tasks for current user (Active Pipeline)
                // Exclude: Completed, Done, Dropped
                const myTasks = tasksData.filter(t => 
                    t.assignedTo === user?.name && 
                    !['Completed', 'Done', 'Dropped'].includes(t.status)
                );
                setTasks(myTasks);

                // Filter Meetings (In a real app, filter by attendee. Here showing mostly future ones)
                const now = new Date();
                const upcomingMeetings = meetingsData.filter(m => 
                    new Date(m.dateTime) >= now && 
                    m.status !== 'Cancelled'
                ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
                
                setMeetings(upcomingMeetings);

            } catch (e) {
                console.error("Failed to load dashboard data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    // Derived State
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    // Generate local YYYY-MM-DD string for today based on IST
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

    const highPriorityCount = tasks.filter(t => t.priority === 'High').length;
    const dueTodayCount = tasks.filter(t => t.dueDate === todayStr).length;
    const nextMeeting = meetings[0];

    const sortedTasks = useMemo(() => {
        // Sort by Priority (High > Medium > Low) then Date
        const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return [...tasks].sort((a, b) => {
            const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
            if (weightDiff !== 0) return weightDiff;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }).slice(0, 5); // Show top 5
    }, [tasks]);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                
                <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
                    
                    {/* Hero Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            {greeting}, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg font-medium">Here is what’s happening with your projects today.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 group hover:border-brand-200 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <ListTodo className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Active</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{tasks.length}</h3>
                                <p className="text-xs text-gray-500 font-medium">Tasks in your queue</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 group hover:border-red-200 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attention</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{highPriorityCount}</h3>
                                <p className="text-xs text-gray-500 font-medium">High priority items</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 group hover:border-orange-200 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Today</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{dueTodayCount}</h3>
                                <p className="text-xs text-gray-500 font-medium">Tasks expiring soon</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-5 rounded-2xl border border-transparent shadow-lg shadow-brand-500/20 flex flex-col justify-between h-32 text-white">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-white/20 rounded-xl text-white">
                                    <Video className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Up Next</span>
                            </div>
                            <div>
                                {nextMeeting ? (
                                    <>
                                        <h3 className="text-sm font-bold truncate mb-0.5">{nextMeeting.title}</h3>
                                        <p className="text-xs text-white/70 font-medium">
                                            {new Date(nextMeeting.dateTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Kolkata'})} Today
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm font-medium text-white/80 mt-auto">No meetings scheduled.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        
                        {/* Left Column: Priority Tasks */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-brand-600" />
                                    My Priority Tasks
                                </h2>
                                <Link to="/tasks" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                                    View All Tasks <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                                    </div>
                                ) : sortedTasks.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {sortedTasks.map(task => (
                                            <div key={task.id} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                                    task.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                                                    task.status === 'In Review' ? 'bg-purple-50 text-purple-600' :
                                                    'bg-gray-50 text-gray-400'
                                                }`}>
                                                    <CheckCircle2 className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                                            task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        }`}>
                                                            {task.priority}
                                                        </span>
                                                        <span className={`text-xs font-medium ${task.dueDate === todayStr ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                                                            Due {formatDate(task.dueDate)} {task.dueDate === todayStr ? '(Today)' : ''}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                                                        {task.title}
                                                    </h3>
                                                </div>
                                                <div className="text-right hidden sm:block">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                                                        task.status === 'In Review' ? 'bg-purple-50 text-purple-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-4 text-center">
                                            <Link to="/tasks" className="text-xs font-bold text-gray-400 hover:text-brand-600 uppercase tracking-wide">
                                                +{tasks.length - sortedTasks.length} more tasks pending
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                                        </div>
                                        <h3 className="text-gray-900 font-bold">All caught up!</h3>
                                        <p className="text-gray-500 text-sm mt-1">You have no pending tasks assigned.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Meetings & Quick Actions */}
                        <div className="space-y-8">
                            
                            {/* Upcoming Meetings */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5 text-brand-600" />
                                        Upcoming
                                    </h2>
                                    <Link to="/calendar" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[200px]">
                                    {meetings.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {meetings.slice(0, 3).map(meeting => (
                                                <div key={meeting.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-xl w-14 h-14 flex-shrink-0">
                                                            <span className="text-[10px] font-bold text-red-500 uppercase">
                                                                {new Date(meeting.dateTime).toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' })}
                                                            </span>
                                                            <span className="text-xl font-bold text-gray-900">
                                                                {new Date(meeting.dateTime).toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold text-gray-900 truncate mb-1">{meeting.title}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                <span>{new Date(meeting.dateTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Kolkata'})}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {meeting.meetingLink && (
                                                        <a 
                                                            href={meeting.meetingLink} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            <Video className="h-3.5 w-3.5" /> Join Meeting
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-sm text-gray-500">No upcoming meetings scheduled.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
                                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Link to="/tasks" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500 rounded-lg">
                                                <Plus className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="font-medium text-sm">Create New Task</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-white/50 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link to="/calendar" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500 rounded-lg">
                                                <Calendar className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="font-medium text-sm">Schedule Meeting</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-white/50 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};
