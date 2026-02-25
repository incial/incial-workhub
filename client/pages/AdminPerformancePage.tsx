
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { tasksApi, usersApi } from '../services/api';
import { Trophy, Target, Zap, Crown, Medal, Activity, TrendingUp, LayoutGrid, X, Mail, Calendar, MapPin, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useLayout } from '../context/LayoutContext';

interface UserStats {
  id?: number;
  name: string;
  email?: string;
  role: string;
  rawRole?: string;
  avatarUrl?: string;
  createdAt?: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

export const AdminPerformancePage: React.FC = () => {
  const { showToast } = useToast();
  const { isSidebarCollapsed } = useLayout();
  const [stats, setStats] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchAndCalculate = async () => {
      setIsLoading(true);
      try {
        const [tasks, users] = await Promise.all([
            tasksApi.getAll(),
            usersApi.getAll()
        ]);
        
        console.log('Leaderboard Data - Users:', users.length, 'Tasks:', tasks.length);
        
        // 1. Initialize stats map with ALL users using email as key (for backward compatibility)
        const statsMap: Record<string, UserStats> = {};
        
        users.forEach(u => {
            const formattedRole = u.role ? u.role.replace('ROLE_', '').split('_')
                .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                .join(' ') : 'Unknown';

            if (!u.email) {
                console.warn('Skipping user without email:', u.name || u.id);
                return; // Skip users without email
            }

            statsMap[u.email] = {
                id: u.id,
                name: u.name,
                email: u.email,
                role: formattedRole,
                rawRole: u.role,
                avatarUrl: u.avatarUrl,
                createdAt: u.createdAt,
                total: 0,
                completed: 0,
                inProgress: 0,
                pending: 0,
                completionRate: 0
            };
        });

        // 2. Aggregate Task Data - Now handles multi-assignee tasks
        tasks.forEach(task => {
            // Check if task has multiple assignees (new format)
            if (task.assignedToList && task.assignedToList.length > 0) {
                // For multi-assignee tasks, count for ALL assignees
                task.assignedToList.forEach(assigneeEmail => {
                    // Use email as key to find user stats directly
                    const matchedStats = statsMap[assigneeEmail];
                    
                    if (matchedStats) {
                        matchedStats.total++;
                        if (['Completed', 'Done', 'Posted'].includes(task.status)) {
                            matchedStats.completed++;
                        } else if (['In Progress', 'In Review'].includes(task.status)) {
                            matchedStats.inProgress++;
                        } else if (['Not Started'].includes(task.status)) {
                            matchedStats.pending++;
                        }
                    }
                });
            } else {
                // Fallback to old single-assignee logic for backward compatibility
                let matchedStats: UserStats | undefined;

                // Try to find by assigneeId first (look up email by id)
                if (task.assigneeId) {
                    matchedStats = Object.values(statsMap).find(s => s.id === task.assigneeId);
                }
                
                // If not found, try matching by name
                if (!matchedStats && task.assignedTo && task.assignedTo !== 'Unassigned') {
                    // Try exact email match first (in case assignedTo is an email)
                    matchedStats = statsMap[task.assignedTo];
                    
                    // If not found, try name match as final fallback
                    if (!matchedStats) {
                        matchedStats = Object.values(statsMap).find(s => s.name === task.assignedTo);
                    }
                }

                if (matchedStats) {
                    matchedStats.total++;
                    if (['Completed', 'Done', 'Posted'].includes(task.status)) {
                        matchedStats.completed++;
                    } else if (['In Progress', 'In Review'].includes(task.status)) {
                        matchedStats.inProgress++;
                    } else if (['Not Started'].includes(task.status)) {
                        matchedStats.pending++;
                    }
                }
            }
        });

        // 3. Calculate Rates & Convert to Array
        const finalStats = Object.values(statsMap)
            .map(s => ({
                ...s,
                completionRate: s.total > 0 ? (s.completed / s.total) * 100 : 0
            }));

        console.log('Leaderboard - Total users in statsMap:', Object.keys(statsMap).length);
        console.log('Leaderboard - Final stats array:', finalStats.length);

        // 4. SORTING LOGIC: Completed Volume (Desc) -> Efficiency Score (Desc) -> Total Assigned (Desc)
        // This ensures users with high output rank higher than users with low volume but 100% rate.
        finalStats.sort((a, b) => {
            // Primary: Output Volume
            if (b.completed !== a.completed) {
                return b.completed - a.completed;
            }
            // Secondary: Efficiency Rate
            if (Math.abs(b.completionRate - a.completionRate) > 0.01) {
                return b.completionRate - a.completionRate;
            }
            // Tertiary: Total Workload
            return b.total - a.total;
        });
        
        console.log('Leaderboard - Setting stats with', finalStats.length, 'users');
        setStats(finalStats);
      } catch (e) {
        console.error(e);
        showToast("Failed to load performance data.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchAndCalculate();
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const totalTasks = stats.reduce((acc, s) => acc + s.total, 0);
  const avgCompletionRate = stats.length > 0 ? stats.reduce((acc, s) => acc + s.completionRate, 0) / stats.length : 0;
  const topPerformers = stats.slice(0, 3);

  const getRankConfig = (index: number) => {
      if (index === 0) return {
          containerClass: 'order-2 -mt-12 z-20 scale-110',
          cardClass: 'bg-gradient-to-b from-yellow-50 via-white/80 to-white/40 border-yellow-200 shadow-[0_20px_50px_rgba(234,179,8,0.2)]',
          icon: <Crown className="h-8 w-8 text-yellow-500 fill-yellow-500 animate-pulse" />,
          titleColor: 'text-slate-900',
          badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          ringColor: 'ring-yellow-400'
      };
      if (index === 1) return {
          containerClass: 'order-1 z-10',
          cardClass: 'bg-gradient-to-b from-slate-50 via-white/80 to-white/40 border-slate-200 shadow-xl',
          icon: <Medal className="h-6 w-6 text-slate-400" />,
          titleColor: 'text-slate-700',
          badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
          ringColor: 'ring-slate-300'
      };
      if (index === 2) return {
          containerClass: 'order-3 z-10 mt-4',
          cardClass: 'bg-gradient-to-b from-orange-50 via-white/80 to-white/40 border-orange-200 shadow-xl',
          icon: <Medal className="h-6 w-6 text-orange-400" />,
          titleColor: 'text-slate-700',
          badgeClass: 'bg-orange-50 text-orange-700 border-orange-100',
          ringColor: 'ring-orange-300'
      };
      return { containerClass: '', cardClass: '', icon: null, titleColor: '', badgeClass: '', ringColor: '' };
  };

  const getPerformanceBadge = (rate: number) => {
      if (rate >= 90) return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"><Zap className="h-3 w-3 fill-current" /> Elite</span>;
      if (rate >= 75) return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"><Activity className="h-3 w-3" /> Pro</span>;
      if (rate >= 50) return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">Active</span>;
      return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 shadow-sm">Rookie</span>;
  };

  return (
    <div className="flex min-h-screen mesh-bg relative">
      <div className="glass-canvas" />
      <Sidebar />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
        <Navbar />
        
        <main className="flex-1 px-4 lg:px-12 py-6 lg:py-10 pb-32">
           
           {/* Header */}
           <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 lg:mb-16 animate-premium">
                <div>
                    <div className="flex items-center gap-3 mb-2 lg:mb-4">
                         <div className="h-1.5 lg:h-2 w-1.5 lg:w-2 rounded-full bg-brand-500 animate-pulse" />
                         <span className="text-[9px] lg:text-[10px] font-black text-brand-600 uppercase tracking-[0.5em]">Team Velocity</span>
                    </div>
                    <h1 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none display-text">Leaderboard.</h1>
                    <p className="text-sm lg:text-lg text-slate-500 mt-2 lg:mt-4 font-medium max-w-xl">
                        Ranked by absolute volume of completed deliverables and assignment load.
                    </p>
                </div>
                
                {/* Unified Stat Bar */}
                <div className="flex bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-premium border border-white p-2">
                    <div className="px-6 lg:px-8 py-3 lg:py-4 flex items-center gap-4 lg:gap-5 border-r border-slate-200/50">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Total Tasks</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{totalTasks}</p>
                        </div>
                    </div>
                    <div className="px-6 lg:px-8 py-3 lg:py-4 flex items-center gap-4 lg:gap-5">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm border border-emerald-100">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Avg Score</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{avgCompletionRate.toFixed(0)}%</p>
                        </div>
                    </div>
                </div>
           </div>

           {isLoading ? (
             <div className="p-20 lg:p-32 flex flex-col items-center justify-center">
                 <div className="animate-spin rounded-full h-10 w-10 border-[4px] border-slate-100 border-t-indigo-600 mb-6" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Computing Metrics...</p>
             </div>
           ) : (
             <>
                {stats.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-6">
                            <Trophy className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">No Performance Data</h3>
                        <p className="text-slate-500 text-sm">No users or tasks found. Check your data or try refreshing.</p>
                    </div>
                ) : (
                  <>
                    {/* Podium - Show if we have at least 1 user */}
                    {topPerformers.length > 0 && (
                        <div className="mb-16 lg:mb-24 px-4">
                            <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-10 max-w-5xl mx-auto">
                                {/* Show top 3 if available, otherwise show what we have */}
                                {stats.length >= 3 ? (
                                    [topPerformers[1], topPerformers[0], topPerformers[2]].map((user, i) => {
                                if (!user) return null;
                                const rank = i === 1 ? 0 : i === 0 ? 1 : 2; 
                                const config = getRankConfig(rank);

                                return (
                                    <div key={user.name} className={`w-full md:w-80 flex flex-col ${config.containerClass}`}>
                                        <div 
                                            onClick={() => setSelectedUser(user)}
                                            className={`relative p-8 rounded-[2.5rem] border backdrop-blur-xl flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 cursor-pointer group ${config.cardClass}`}
                                        >
                                            <div className="absolute -top-6">
                                                <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100">
                                                    {config.icon}
                                                </div>
                                            </div>

                                            <div className="mt-8 mb-5 relative">
                                                <div className={`p-1.5 rounded-[1.5rem] bg-white shadow-xl ring-4 ${config.ringColor}`}>
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="h-20 w-20 rounded-[1.2rem] object-cover" />
                                                    ) : (
                                                        <div className="h-20 w-20 rounded-[1.2rem] bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-2xl font-black text-slate-400 uppercase tracking-tighter">
                                                            {user.name.slice(0, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                                                    <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-xl shadow-lg border-2 border-white uppercase tracking-widest">
                                                        {user.completed} Completed
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className={`text-xl font-black mb-2 truncate w-full tracking-tight ${config.titleColor}`}>{user.name}</h3>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mb-6 ${config.badgeClass}`}>
                                                {user.role}
                                            </span>

                                            <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                                                <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-inner">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned</p>
                                                    <p className="text-xl font-black text-slate-900">{user.total}</p>
                                                </div>
                                                <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-inner">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                                                    <p className="text-xl font-black text-slate-900">{user.completionRate.toFixed(0)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                                ) : (
                                    // Show available users in order for less than 3 users
                                    topPerformers.map((user, idx) => {
                                        if (!user) return null;
                                        const config = getRankConfig(idx);
                                        
                                        return (
                                            <div key={user.name} className={`w-full md:w-80 flex flex-col ${config.containerClass}`}>
                                                <div 
                                                    onClick={() => setSelectedUser(user)}
                                                    className={`relative p-8 rounded-[2.5rem] border backdrop-blur-xl flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 cursor-pointer group ${config.cardClass}`}
                                                >
                                                    <div className="absolute -top-6">
                                                        <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100">
                                                            {config.icon}
                                                        </div>
                                                    </div>

                                                    <div className="mt-8 mb-5 relative">
                                                        <div className={`p-1.5 rounded-[1.5rem] bg-white shadow-xl ring-4 ${config.ringColor}`}>
                                                            {user.avatarUrl ? (
                                                                <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="h-20 w-20 rounded-[1.2rem] object-cover" />
                                                            ) : (
                                                                <div className="h-20 w-20 rounded-[1.2rem] bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-2xl font-black text-slate-400 uppercase tracking-tighter">
                                                                    {user.name.slice(0, 2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                                                            <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-xl shadow-lg border-2 border-white uppercase tracking-widest">
                                                                {user.completed} Completed
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <h3 className={`text-xl font-black mb-2 truncate w-full tracking-tight ${config.titleColor}`}>{user.name}</h3>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mb-6 ${config.badgeClass}`}>
                                                        {user.role}
                                                    </span>

                                                    <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                                                        <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-inner">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned</p>
                                                            <p className="text-xl font-black text-slate-900">{user.total}</p>
                                                        </div>
                                                        <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-inner">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                                                            <p className="text-xl font-black text-slate-900">{user.completionRate.toFixed(0)}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white/30 backdrop-blur-3xl rounded-[2.5rem] lg:rounded-[3.5rem] shadow-premium border border-white/60 overflow-hidden">
                    <div className="px-8 lg:px-10 py-6 lg:py-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40">
                        <div>
                            <h3 className="font-black text-slate-900 text-lg flex items-center gap-3 uppercase tracking-[0.2em]">
                                <LayoutGrid className="h-5 w-5 text-indigo-500" /> 
                                Efficiency Rankings
                            </h3>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.25em] font-black border-b border-slate-100">
                                    <th className="px-8 py-6 w-1/4">Rank & Member</th>
                                    <th className="px-8 py-6 text-center">Efficiency Score</th>
                                    <th className="px-8 py-6 text-center">Task Distribution</th>
                                    <th className="px-8 py-6 w-1/3">Completion Velocity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {stats.map((user, idx) => (
                                    <tr key={user.name} className="hover:bg-white/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div 
                                                className="flex items-center gap-6 cursor-pointer group/user"
                                                onClick={() => setSelectedUser(user)}
                                            >
                                                <div className={`text-sm font-black w-8 text-center flex-shrink-0 ${idx < 3 ? 'text-yellow-500 scale-125 drop-shadow-sm' : 'text-slate-300'}`}>
                                                    {idx < 3 ? <Crown className={`h-5 w-5 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : 'text-orange-400'}`} /> : `#${idx + 1}`}
                                                </div>
                                                <div className="relative">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="h-12 w-12 rounded-2xl object-cover shadow-sm border border-white" />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-black text-slate-500 shadow-sm border border-white">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    {idx < 3 && <div className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center shadow-md text-[8px]">🏆</div>}
                                                </div>
                                                <div>
                                                    <span className="font-black text-slate-900 block text-sm group-hover/user:text-indigo-600 transition-colors tracking-tight">{user.name}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{user.completionRate.toFixed(0)}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">%</span>
                                                </div>
                                                {getPerformanceBadge(user.completionRate)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center items-center gap-6">
                                                <div className="text-center group/stat">
                                                    <span className="block font-black text-emerald-600 text-lg group-hover/stat:scale-110 transition-transform">{user.completed}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Done</span>
                                                </div>
                                                <div className="h-8 w-px bg-slate-200" />
                                                <div className="text-center group/stat">
                                                    <span className="block font-black text-blue-600 text-lg group-hover/stat:scale-110 transition-transform">{user.inProgress}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active</span>
                                                </div>
                                                <div className="h-8 w-px bg-slate-200" />
                                                <div className="text-center group/stat">
                                                    <span className="block font-black text-slate-500 text-lg group-hover/stat:scale-110 transition-transform">{user.pending}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Todo</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="w-full max-w-xs mx-auto">
                                                <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                                                    <span>Velocity</span>
                                                    <span>{user.completed}/{user.total}</span>
                                                </div>
                                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${user.total > 0 ? (user.completed / user.total) * 100 : 0}%` }} />
                                                    <div className="h-full bg-blue-400/30" style={{ width: `${user.total > 0 ? (user.inProgress / user.total) * 100 : 0}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                  </>
                )}
              </>
            )}
        </main>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setSelectedUser(null)}>
            <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all scale-100 relative border border-white/60" onClick={(e) => e.stopPropagation()}>
                
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedUser(null)} 
                    className="absolute top-6 right-6 z-20 p-3 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors backdrop-blur-md"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Banner & Avatar */}
                <div className="h-40 bg-gradient-to-tr from-brand-600 to-indigo-500 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />
                    <img 
                        src="/banner.png" 
                        alt="Profile Banner" 
                        className="w-full h-full object-cover absolute inset-0 z-0 opacity-40 mix-blend-overlay"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                    <div className="absolute -bottom-12 left-10 z-10">
                        <div className="h-28 w-28 rounded-[2rem] bg-white p-1.5 shadow-2xl border border-white">
                            {selectedUser.avatarUrl ? (
                                <img src={selectedUser.avatarUrl} alt={selectedUser.name} referrerPolicy="no-referrer" className="h-full w-full rounded-[1.7rem] object-cover bg-slate-100" />
                            ) : (
                                <div className="h-full w-full rounded-[1.7rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl font-black text-slate-400 uppercase tracking-tighter">
                                    {selectedUser.name.slice(0, 2)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="pt-16 pb-10 px-10">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedUser.name}</h2>
                        </div>
                        <div className="space-y-3 mt-4">
                            {selectedUser.email && (
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Mail className="h-4 w-4 text-slate-400" /> {selectedUser.email}
                                </div>
                            )}
                            <div className="flex gap-3">
                                <div className="flex-1 flex items-center gap-3 text-sm font-bold text-slate-600 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <MapPin className="h-4 w-4 text-slate-400" /> Remote
                                </div>
                                {selectedUser.createdAt && (
                                    <div className="flex-1 flex items-center gap-3 text-sm font-bold text-slate-600 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Calendar className="h-4 w-4 text-slate-400" /> {new Date(selectedUser.createdAt).getFullYear()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-emerald-50 rounded-[1.5rem] p-4 text-center border border-emerald-100 group hover:shadow-lg transition-all duration-300">
                            <div className="mb-2 text-emerald-600 flex justify-center group-hover:scale-110 transition-transform"><CheckCircle2 className="h-6 w-6" /></div>
                            <span className="block text-2xl font-black text-slate-900">{selectedUser.completed}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Done</span>
                        </div>
                        <div className="bg-blue-50 rounded-[1.5rem] p-4 text-center border border-blue-100 group hover:shadow-lg transition-all duration-300">
                            <div className="mb-2 text-blue-600 flex justify-center group-hover:scale-110 transition-transform"><Clock className="h-6 w-6" /></div>
                            <span className="block text-2xl font-black text-slate-900">{selectedUser.inProgress}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                        </div>
                        <div className="bg-purple-50 rounded-[1.5rem] p-4 text-center border border-purple-100 group hover:shadow-lg transition-all duration-300">
                            <div className="mb-2 text-purple-600 flex justify-center group-hover:scale-110 transition-transform"><BarChart3 className="h-6 w-6" /></div>
                            <span className="block text-2xl font-black text-slate-900">{selectedUser.completionRate.toFixed(0)}%</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
