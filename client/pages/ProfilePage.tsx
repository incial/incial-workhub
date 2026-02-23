
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { tasksApi, meetingsApi } from '../services/api';
import { 
    User as UserIcon, Mail, ShieldCheck, MapPin, 
    Calendar, Lock, Sparkles, Target, Zap, 
    Activity, Clock, Award, Star, Heart, ShieldAlert, Cpu, Globe, Rocket
} from 'lucide-react';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';

export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { isSidebarCollapsed } = useLayout();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [stats, setStats] = useState({ tasks: 0, completed: 0, meetings: 0 });

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            if (!mounted) return;
            try {
                const [tasks, meetings] = await Promise.all([
                    tasksApi.getAll(),
                    meetingsApi.getAll()
                ]);
                
                if (!mounted) return;
                
                const userTasks = Array.isArray(tasks) ? tasks.filter(t => {
                    if (user?.id && t.assigneeId) return t.assigneeId === user.id;
                    return t.assignedTo === user?.name;
                }) : [];

                const userMeetings = Array.isArray(meetings) ? meetings.filter(m => {
                    if (user?.id && m.assigneeId) return m.assigneeId === user.id;
                    return m.assignedTo === user?.name;
                }) : [];

                setStats({
                    tasks: userTasks.length,
                    completed: userTasks.filter(t => t.status === 'Completed' || t.status === 'Done' || t.status === 'Posted').length,
                    meetings: userMeetings.length
                });
            } catch (e) {
                console.error("Stats fetch error", e);
            }
        };
        fetchStats();
        return () => { mounted = false; };
    }, [user?.id, user?.name]);

    const completionRate = stats.tasks > 0 ? Math.round((stats.completed / stats.tasks) * 100) : 0;

    return (
        <div className="flex min-h-screen mesh-bg relative">
            <div className="glass-canvas" />
            <Sidebar />
            
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
                <Navbar />

                <main className="flex-1 px-4 md:px-6 lg:px-12 py-6 lg:py-10 pb-32 overflow-y-auto custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* HIGH-END HERO HEADER */}
                        <div className="relative rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden bg-slate-950 shadow-2xl border border-white/5 group">
                            
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />

                            <div className="absolute inset-0 pointer-events-none z-0">
                                <div className="absolute top-[-30%] left-[-10%] w-[80%] h-[100%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse duration-[8s]" />
                                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-indigo-500/10 blur-[100px]" />
                            </div>

                            <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-20 lg:pt-32 pb-10 lg:pb-16">
                                <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8 lg:gap-12">
                                    <div className="relative shrink-0">
                                        <div className="absolute -inset-3 bg-gradient-to-tr from-indigo-500 via-indigo-400 to-emerald-400 rounded-[3.5rem] blur-md opacity-30 group-hover:opacity-100 transition duration-1000 animate-spin-slow"></div>
                                        <div className="relative h-32 w-32 lg:h-48 lg:w-48 rounded-[2rem] lg:rounded-[3rem] bg-slate-900 p-2 shadow-2xl ring-1 ring-white/20">
                                            {user?.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                    referrerPolicy="no-referrer"
                                                    className="h-full w-full rounded-[1.5rem] lg:rounded-[2.5rem] object-cover border border-white/10"
                                                />
                                            ) : (
                                                <div className="h-full w-full rounded-[1.5rem] lg:rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-2 -right-2 h-10 w-10 lg:h-14 lg:w-14 bg-white border-4 border-slate-950 rounded-xl lg:rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                                                <img src="/logo.png" alt="Incial" className="h-6 w-6 lg:h-8 lg:w-8 object-contain" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center lg:text-left space-y-3 lg:space-y-4">
                                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-2">
                                            <span className="inline-flex items-center gap-2 px-4 lg:px-5 py-1.5 lg:py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md shadow-glow">
                                                <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-indigo-400" /> Executive Node
                                            </span>
                                        </div>
                                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none display-text drop-shadow-lg">
                                            {user?.name}
                                        </h1>
                                        <p className="text-slate-300 font-medium text-sm lg:text-xl flex items-center justify-center lg:justify-start gap-2 lg:gap-4 break-all">
                                            <Mail className="h-4 w-4 lg:h-6 lg:w-6 text-slate-400" /> {user?.email}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-4 min-w-full lg:min-w-[240px]">
                                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 text-center shadow-2xl relative overflow-hidden group/gauge">
                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                <Rocket className="h-10 w-10 lg:h-14 lg:w-14 text-white" />
                                            </div>
                                            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 lg:mb-3">Core Sync Velocity</p>
                                            <div className="flex items-baseline justify-center gap-2">
                                                <span className="text-3xl lg:text-5xl font-black text-indigo-400 tracking-tighter">{completionRate}%</span>
                                                <span className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest">Optimal</span>
                                            </div>
                                            <div className="mt-4 lg:mt-5 h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-[2000ms] ease-out shadow-glow" 
                                                    style={{ width: `${completionRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                            <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8">
                                    {[
                                        { label: 'Strategic Ops', value: stats.tasks, icon: Target },
                                        { label: 'Milestones Hit', value: stats.completed, icon: Award },
                                        { label: 'Comm. Syncs', value: stats.meetings, icon: Zap }
                                    ].map((metric) => (
                                        <div key={metric.label} className="bg-white/40 backdrop-blur-3xl p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white shadow-premium hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                                            <div className={`h-12 w-12 lg:h-16 lg:w-16 rounded-2xl lg:rounded-[1.5rem] bg-slate-950 text-white flex items-center justify-center mb-4 lg:mb-8 group-hover:scale-110 transition-transform shadow-2xl`}>
                                                <metric.icon className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{metric.label}</p>
                                                <h3 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">{metric.value}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white/30 backdrop-blur-3xl rounded-[2.5rem] lg:rounded-[3.5rem] border border-white shadow-premium overflow-hidden group">
                                    <div className="p-6 lg:p-10 border-b border-white/60 flex items-center justify-between bg-white/20">
                                        <div className="flex items-center gap-3 lg:gap-4">
                                            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl">
                                                <Cpu className="h-5 w-5 lg:h-6 lg:w-6" />
                                            </div>
                                            <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-[0.3em]">Identity Metadata</h3>
                                        </div>
                                    </div>
                                    <div className="p-6 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-8 lg:gap-y-12">
                                        <div className="space-y-1">
                                            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1 lg:mb-2">Display Name</p>
                                            <p className="text-slate-900 font-bold text-lg lg:text-2xl tracking-tight">{user?.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1 lg:mb-2">Endpoint Access</p>
                                            <p className="text-slate-900 font-bold text-lg lg:text-2xl tracking-tight truncate">{user?.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1 lg:mb-2">Registry Key</p>
                                            <p className="text-indigo-600 font-mono font-black text-lg lg:text-2xl bg-indigo-50/50 px-3 lg:px-4 py-1 lg:py-1.5 rounded-xl lg:rounded-2xl w-fit border border-indigo-100 shadow-sm">
                                                INC-{user?.id?.toString().padStart(6, '0')}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1 lg:mb-2">Node Privilege</p>
                                            <div className="px-4 lg:px-5 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] border w-fit bg-slate-900 text-white shadow-xl">
                                                {user?.role.replace('ROLE_', '').replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-6 lg:space-y-8">
                                <div className="bg-white/30 backdrop-blur-3xl rounded-[2.5rem] lg:rounded-[3.5rem] border border-white shadow-premium p-8 lg:p-12 group relative overflow-hidden flex flex-col items-center text-center">
                                    <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5">
                                        <Globe className="h-16 w-16 lg:h-24 lg:w-24" />
                                    </div>
                                    <div className="relative z-10 mb-8 lg:mb-10">
                                        <div className="h-20 w-20 lg:h-28 lg:w-28 rounded-[2rem] lg:rounded-[2.5rem] bg-white flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-white/20 p-4 lg:p-6 overflow-hidden mb-6 lg:mb-8 mx-auto group-hover:scale-110 transition-transform duration-700">
                                            <img src="/logo.png" alt="Incial" className="h-full w-full object-contain" />
                                        </div>
                                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase tracking-[0.1em]">Incial HQ</h3>
                                    </div>

                                    <div className="w-full space-y-4 lg:space-y-5 relative z-10">
                                        <div className="flex items-center gap-4 lg:gap-5 text-xs lg:text-sm text-slate-600 font-bold p-4 lg:p-5 rounded-2xl lg:rounded-[2rem] bg-white shadow-sm border border-slate-50">
                                            <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-500" />
                                            <span className="uppercase tracking-widest text-[10px] lg:text-[11px]">Kerala Node Cluster</span>
                                        </div>
                                        <div className="flex items-center gap-4 lg:gap-5 text-xs lg:text-sm text-slate-600 font-bold p-4 lg:p-5 rounded-2xl lg:rounded-[2rem] bg-white shadow-sm border border-slate-50">
                                            <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-500" />
                                            <span className="uppercase tracking-widest text-[10px] lg:text-[11px]">Initiated {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2023'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-600 rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/40 to-transparent pointer-events-none"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 lg:gap-5 mb-6 lg:mb-8">
                                            <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-[1.25rem] lg:rounded-[1.5rem] bg-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/10 group-hover:rotate-12 transition-transform">
                                                <Lock className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                                            </div>
                                            <h4 className="font-black text-white text-xs lg:text-sm uppercase tracking-[0.4em]">Node Security</h4>
                                        </div>
                                        <p className="text-indigo-100 font-medium text-sm lg:text-lg leading-relaxed mb-8 lg:mb-12">
                                            Rotate access keys frequently to maintain operational integrity.
                                        </p>
                                        <button 
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            className="w-full py-4 lg:py-5 bg-white text-indigo-900 font-black text-[10px] lg:text-[11px] uppercase tracking-[0.3em] rounded-2xl lg:rounded-[1.5rem] shadow-2xl hover:scale-[1.03] active:scale-95 transition-all duration-300"
                                        >
                                            Rotate Key
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
};
