
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { tasksApi, meetingsApi } from '../services/api';
import { 
    User as UserIcon, Mail, ShieldCheck, MapPin, 
    Calendar, Lock, Sparkles, Target, Zap, 
    Activity, Clock, Award, Briefcase, ChevronRight,
    Star, Heart, ShieldAlert, Cpu, Globe, Rocket
} from 'lucide-react';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { formatMoney } from '../utils';

export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [stats, setStats] = useState({ tasks: 0, completed: 0, meetings: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [tasks, meetings] = await Promise.all([
                    tasksApi.getAll(),
                    meetingsApi.getAll()
                ]);
                const userTasks = tasks.filter(t => t.assignedTo === user?.name);
                setStats({
                    tasks: userTasks.length,
                    completed: userTasks.filter(t => t.status === 'Completed' || t.status === 'Done' || t.status === 'Posted').length,
                    meetings: meetings.filter(m => m.assignedTo === user?.name).length
                });
            } catch (e) {
                console.error("Stats fetch error", e);
            }
        };
        fetchStats();
    }, [user]);

    const completionRate = stats.tasks > 0 ? Math.round((stats.completed / stats.tasks) * 100) : 0;

    return (
        <div className="flex min-h-screen bg-[#FDFDFD]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />

                <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
                    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* HIGH-END HERO HEADER */}
                        <div className="relative rounded-[3.5rem] overflow-hidden bg-[#020617] shadow-2xl border border-white/5 group">
                            {/* Animated Background Mesh */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-[-30%] left-[-10%] w-[80%] h-[100%] rounded-full bg-brand-600/20 blur-[120px] animate-pulse duration-[8s]" />
                                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-indigo-500/10 blur-[100px]" />
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            </div>

                            <div className="relative z-10 px-8 lg:px-16 pt-28 pb-14">
                                <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10">
                                    {/* Prestige Avatar */}
                                    <div className="relative">
                                        <div className="absolute -inset-2 bg-gradient-to-tr from-brand-500 via-indigo-400 to-emerald-400 rounded-[3rem] blur-md opacity-40 group-hover:opacity-100 transition duration-1000 animate-spin-slow"></div>
                                        <div className="relative h-44 w-44 rounded-[2.8rem] bg-slate-900 p-1.5 shadow-2xl ring-1 ring-white/20">
                                            {user?.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                    className="h-full w-full rounded-[2.5rem] object-cover border border-white/10"
                                                />
                                            ) : (
                                                <div className="h-full w-full rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-6xl font-black text-white uppercase tracking-tighter">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                            )}
                                            {/* Verification Badge */}
                                            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-brand-600 border-4 border-[#020617] rounded-2xl shadow-xl flex items-center justify-center text-white">
                                                <ShieldCheck className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center lg:text-left space-y-4">
                                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-2">
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                                                <Sparkles className="h-3.5 w-3.5 text-brand-400" /> Executive Tier
                                            </span>
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                                                <Activity className="h-3.5 w-3.5" /> High Performance
                                            </span>
                                        </div>
                                        <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                                            {user?.name}
                                        </h1>
                                        <p className="text-slate-400 font-medium text-xl flex items-center justify-center lg:justify-start gap-3">
                                            <Mail className="h-5 w-5 text-slate-500" /> {user?.email}
                                        </p>
                                    </div>

                                    {/* Efficiency Gauge Card */}
                                    <div className="flex flex-col gap-4 min-w-[220px]">
                                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 text-center shadow-2xl relative overflow-hidden group/gauge">
                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                <Rocket className="h-12 w-12 text-white" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Workload Efficiency</p>
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-4xl font-black text-brand-400">{completionRate}%</span>
                                                <span className="text-xs font-bold text-slate-500">Peak</span>
                                            </div>
                                            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-[2000ms]" 
                                                    style={{ width: `${completionRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* LEFT COLUMN: Deep Stats & Identity */}
                            <div className="lg:col-span-8 space-y-8">
                                
                                {/* HIGH-FIDELITY METRIC GRID */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Strategic Tasks', value: stats.tasks, icon: Target, color: 'brand' },
                                        { label: 'Milestones Hit', value: stats.completed, icon: Award, color: 'emerald' },
                                        { label: 'Advisory Syncs', value: stats.meetings, icon: Zap, color: 'indigo' }
                                    ].map((metric) => (
                                        <div key={metric.label} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                            <div className={`h-14 w-14 rounded-2xl bg-${metric.color}-50 text-${metric.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                                                <metric.icon className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{metric.label}</p>
                                                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{metric.value}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* PROFILE ARCHITECTURE DATA */}
                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden group">
                                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                                <Cpu className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Core Identity Architecture</h3>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 animate-pulse">
                                            Encrypted & Syncing
                                        </span>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                            <div className="space-y-1 group/item cursor-default">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated Signature</p>
                                                <p className="text-gray-900 font-bold text-lg group-hover:text-brand-600 transition-colors">{user?.name}</p>
                                            </div>
                                            <div className="space-y-1 group/item cursor-default">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Operational Node</p>
                                                <p className="text-gray-900 font-bold text-lg group-hover:text-brand-600 transition-colors">{user?.email}</p>
                                            </div>
                                            <div className="space-y-1 group/item cursor-default">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Registry Index</p>
                                                <p className="text-gray-900 font-mono font-black text-lg bg-gray-50 px-3 py-1 rounded-xl w-fit border border-gray-100">
                                                    INC-{user?.id?.toString().padStart(6, '0')}
                                                </p>
                                            </div>
                                            <div className="space-y-1 group/item cursor-default">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authorisation Protocol</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                                        user?.role.includes('ADMIN') ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                                                    }`}>
                                                        {user?.role.replace('ROLE_', '').replace('_', ' ')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Milestone Mastery Chips */}
                                        <div className="p-8 bg-slate-50/30">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" /> Mastery Milestones
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                {[
                                                    { label: 'Strategic Lead', icon: Target },
                                                    { label: 'CRM Architect', icon: Globe },
                                                    { label: 'Agile Ops', icon: Zap },
                                                    { label: 'Fiscal Integrity', icon: ShieldCheck },
                                                    { label: 'Elite Communicator', icon: Heart }
                                                ].map(skill => (
                                                    <span key={skill.label} className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 text-[11px] font-black text-slate-600 uppercase tracking-widest shadow-sm hover:border-brand-300 hover:text-brand-600 transition-all cursor-default flex items-center gap-2">
                                                        <skill.icon className="h-3.5 w-3.5 opacity-50" />
                                                        {skill.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Organisation & Security */}
                            <div className="lg:col-span-4 space-y-8">
                                
                                {/* PREMIUM ORGANISATION CARD */}
                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 group relative overflow-hidden flex flex-col items-center text-center">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Globe className="h-32 w-32" />
                                    </div>
                                    
                                    <div className="relative z-10 mb-8">
                                        <div className="h-24 w-24 rounded-[2rem] bg-white flex items-center justify-center shadow-2xl border border-gray-100 p-4 overflow-hidden mb-6 mx-auto group-hover:scale-105 transition-transform duration-500">
                                            <img src="/logo.png" alt="Organisation" className="h-full w-full object-contain" />
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Incial Workhub</h3>
                                        <p className="text-xs font-black text-brand-600 uppercase tracking-[0.2em] mt-2">Executive Workspace</p>
                                    </div>

                                    <div className="w-full space-y-4 relative z-10">
                                        <div className="flex items-center gap-4 text-sm text-gray-600 font-bold p-4 rounded-2xl bg-gray-50/80 border border-gray-100/50 hover:bg-white hover:shadow-md transition-all">
                                            <div className="p-2 bg-white rounded-lg shadow-sm"><MapPin className="h-4 w-4 text-brand-500" /></div>
                                            <span>Kerala, India Node</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 font-bold p-4 rounded-2xl bg-gray-50/80 border border-gray-100/50 hover:bg-white hover:shadow-md transition-all">
                                            <div className="p-2 bg-white rounded-lg shadow-sm"><Calendar className="h-4 w-4 text-brand-500" /></div>
                                            <span>Active since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2023'}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 font-bold p-4 rounded-2xl bg-gray-50/80 border border-gray-100/50 hover:bg-white hover:shadow-md transition-all">
                                            <div className="p-2 bg-white rounded-lg shadow-sm"><Clock className="h-4 w-4 text-brand-500" /></div>
                                            <span>Onboarding: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'Verified'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ENHANCED SECURITY MODULE */}
                                <div className="bg-brand-900 rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-indigo-900 opacity-90"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center shadow-xl border border-white/10 group-hover:rotate-12 transition-transform">
                                                <Lock className="h-7 w-7 text-brand-200" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-sm uppercase tracking-[0.2em]">Security Protocol</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>
                                                    <span className="text-[10px] font-bold text-brand-200 uppercase">MFA Active</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-brand-100/70 text-sm font-medium leading-relaxed mb-10">
                                            You are accessing a secured terminal. Your credentials are valid for this session. Maintain operational security by rotating your password quarterly.
                                        </p>
                                        <button 
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            className="w-full py-5 bg-white text-brand-900 font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:shadow-white/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                                        >
                                            Access Password Vault
                                        </button>
                                    </div>
                                </div>

                                {/* PREMIUM BADGE AREA */}
                                <div className="p-8 border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-center group hover:border-brand-200 transition-colors">
                                    <div className="p-4 bg-gray-50 rounded-2xl mb-4 group-hover:bg-brand-50 transition-colors">
                                        <ShieldAlert className="h-8 w-8 text-gray-300 group-hover:text-brand-400" />
                                    </div>
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Badge Vault</h5>
                                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-1">Integrity Level 4 Required</p>
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
