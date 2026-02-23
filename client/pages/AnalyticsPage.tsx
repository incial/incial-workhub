
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { PieChart, BarChart, TrendingUp, Lock, Download, FileText, CheckSquare, Users, DollarSign, Layers, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLayout } from '../context/LayoutContext';
import { crmApi, tasksApi, usersApi } from '../services/api';
import { formatMoney, exportToCSV } from '../utils';
import { CRMEntry } from '../types';

interface AnalyticsPageProps {
  title: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ title }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isSidebarCollapsed } = useLayout();
    const [entries, setEntries] = useState<CRMEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRevenueVisible, setIsRevenueVisible] = useState(false);
    
    const hasPermission = user?.role === 'ROLE_SUPER_ADMIN';

    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            if (!mounted) return;
            if (hasPermission) {
                try {
                    const data = await crmApi.getAll();
                    if (mounted) setEntries(data.crmList);
                } catch (error) {
                    console.error("Failed to fetch analytics data", error);
                } finally {
                    if (mounted) setIsLoading(false);
                }
            } else {
                if (mounted) setIsLoading(false);
            }
        };
        loadData();
        return () => { mounted = false; };
    }, [hasPermission]);

    const handleExport = async (type: 'crm' | 'tasks' | 'performance') => {
        showToast(`Generating ${type.toUpperCase()} CSV...`, 'info');
        
        try {
            let dataToExport: any[] = [];
            const timestamp = new Date().toISOString().split('T')[0];

            if (type === 'crm') {
                dataToExport = entries.map(e => ({
                    ID: e.id,
                    Company: e.company,
                    Contact: e.contactName,
                    Email: e.email || '',
                    Phone: e.phone || '',
                    Status: e.status,
                    Value: e.dealValue,
                    AssignedTo: e.assignedTo || '',
                    LastContact: e.lastContact || '',
                    NextFollowUp: e.nextFollowUp || '',
                    Source: e.leadSources?.join(', ') || ''
                }));
            } else if (type === 'tasks') {
                const tasks = await tasksApi.getAll();
                const companyMap: Record<number, string> = {};
                entries.forEach(c => companyMap[c.id] = c.company);

                dataToExport = tasks.map(t => ({
                    ID: t.id,
                    Title: t.title,
                    Status: t.status,
                    Priority: t.priority,
                    AssignedTo: t.assignedToList && t.assignedToList.length > 0 
                        ? t.assignedToList.join(', ') 
                        : (t.assignedTo || 'Unassigned'),
                    DueDate: t.dueDate,
                    Client: (t.companyId && companyMap[t.companyId]) ? companyMap[t.companyId] : (t.companyId ? `ID: ${t.companyId}` : 'Internal'),
                    Created: t.createdAt
                }));
            } else if (type === 'performance') {
                const [tasks, users] = await Promise.all([tasksApi.getAll(), usersApi.getAll()]);
                const statsMap: Record<string, any> = {};
                
                users.forEach(u => {
                    statsMap[u.email] = { Name: u.name, Email: u.email, Role: u.role, Total: 0, Completed: 0, Pending: 0 };
                });

                tasks.forEach(t => {
                    // Check if task has multiple assignees (new format)
                    if (t.assignedToList && t.assignedToList.length > 0) {
                        // For multi-assignee tasks, count for ALL assignees
                        t.assignedToList.forEach(assigneeEmail => {
                            if (!statsMap[assigneeEmail]) {
                                statsMap[assigneeEmail] = { Name: assigneeEmail, Email: assigneeEmail, Role: 'External', Total: 0, Completed: 0, Pending: 0 };
                            }
                            
                            statsMap[assigneeEmail].Total++;
                            if (['Completed', 'Done', 'Posted'].includes(t.status)) statsMap[assigneeEmail].Completed++;
                            else statsMap[assigneeEmail].Pending++;
                        });
                    } else {
                        // Fallback to old single-assignee logic for backward compatibility
                        const assignee = t.assignedTo || 'Unassigned';
                        if (!statsMap[assignee]) {
                            statsMap[assignee] = { Name: assignee, Email: assignee, Role: 'External', Total: 0, Completed: 0, Pending: 0 };
                        }
                        
                        statsMap[assignee].Total++;
                        if (['Completed', 'Done', 'Posted'].includes(t.status)) statsMap[assignee].Completed++;
                        else statsMap[assignee].Pending++;
                    }
                });

                dataToExport = Object.values(statsMap).map((s: any) => ({
                    ...s,
                    CompletionRate: s.Total > 0 ? ((s.Completed / s.Total) * 100).toFixed(1) + '%' : '0%'
                }));
            }

            if (dataToExport.length > 0) {
                exportToCSV(dataToExport, `incial-${type}-export-${timestamp}`);
                showToast("Export downloaded successfully.", 'success');
            } else {
                showToast("No data available to export.", 'info');
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to export data.", 'error');
        }
    };

    if (!hasPermission) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                    <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    const totalRevenue = entries.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
    const wonDeals = entries.filter(e => {
        const s = e.status?.toLowerCase() || '';
        return s === 'onboarded' || s === 'completed';
    }).length;

    const conversionRate = entries.length > 0 ? (wonDeals / entries.length) * 100 : 0;
    const avgDealSize = entries.length > 0 ? totalRevenue / entries.length : 0;

    const revenueBySource: Record<string, number> = {};
    entries.forEach(e => {
        const source = (e.leadSources && e.leadSources[0]) ? e.leadSources[0] : 'Unknown';
        revenueBySource[source] = (revenueBySource[source] || 0) + (e.dealValue || 0);
    });

    // FILTER OUT SOURCES WITH 0 REVENUE
    const sortedSources = Object.entries(revenueBySource)
        .filter(([, value]) => value > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10); // Show top 10 contributing sources

    const maxSourceRevenue = sortedSources.length > 0 ? sortedSources[0][1] : 0;

    const statusCounts: Record<string, number> = {};
    entries.forEach(e => {
        const status = e.status ? e.status.toLowerCase() : 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const totalDeals = entries.length;

    return (
        <div className="flex min-h-screen mesh-bg relative">
            <div className="glass-canvas" />
            <Sidebar />
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
                <Navbar />
                
                <main className="flex-1 px-4 lg:px-12 py-6 lg:py-10 pb-32">
                     <div className="mb-10 lg:mb-16 animate-premium">
                        <h1 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none display-text">{title}</h1>
                        <p className="text-sm lg:text-lg text-slate-500 mt-4 lg:mt-6 font-medium max-w-xl">Analytics engine for revenue distribution and pipeline health.</p>
                     </div>

                     <div className="bg-white/40 backdrop-blur-3xl rounded-[2rem] lg:rounded-[3rem] border border-white shadow-premium mb-8 lg:mb-12 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200/50">
                            
                            {/* Total Pipeline Value Card */}
                            <div className="p-6 lg:p-10 group hover:bg-white/40 transition-colors relative">
                                <div className="flex items-center justify-between mb-6 lg:mb-8">
                                    <div className="p-3 lg:p-4 bg-emerald-50 text-emerald-600 rounded-2xl lg:rounded-3xl group-hover:scale-110 transition-transform duration-300 border border-emerald-100/50"><TrendingUp className="h-5 lg:h-6 w-5 lg:w-6" /></div>
                                    <span className="flex items-center gap-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 lg:px-3 py-1 rounded-xl border border-emerald-100"><ArrowUpRight className="h-3 w-3" /> Live</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Pipeline Value</p>
                                    <button 
                                        onClick={() => setIsRevenueVisible(!isRevenueVisible)}
                                        className="p-2 -mr-2 rounded-full text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
                                        title={isRevenueVisible ? "Hide Value" : "Reveal Value"}
                                    >
                                        {isRevenueVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="relative overflow-hidden min-h-[40px] flex items-center">
                                    {isLoading ? (
                                        <span className="text-2xl font-black text-slate-300 animate-pulse">...</span>
                                    ) : (
                                        <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter transition-all duration-300">
                                            {isRevenueVisible ? formatMoney(totalRevenue) : '₹ XX,XX,XXX'}
                                        </h3>
                                    )}
                                </div>
                            </div>

                            {/* Win Rate Card */}
                            <div className="p-6 lg:p-10 group hover:bg-white/40 transition-colors">
                                <div className="flex items-center justify-between mb-6 lg:mb-8">
                                    <div className="p-3 lg:p-4 bg-blue-50 text-blue-600 rounded-2xl lg:rounded-3xl group-hover:scale-110 transition-transform duration-300 border border-blue-100/50"><PieChart className="h-5 lg:h-6 w-5 lg:w-6" /></div>
                                </div>
                                <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Win Rate</p>
                                <div className="flex items-baseline gap-3">
                                    <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{isLoading ? '...' : `${conversionRate.toFixed(1)}%`}</h3>
                                    <span className="text-[10px] lg:text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">of {entries.length} leads</span>
                                </div>
                            </div>

                            {/* Avg Deal Size Card */}
                            <div className="p-6 lg:p-10 group hover:bg-white/40 transition-colors">
                                <div className="flex items-center justify-between mb-6 lg:mb-8">
                                    <div className="p-3 lg:p-4 bg-purple-50 text-purple-600 rounded-2xl lg:rounded-3xl group-hover:scale-110 transition-transform duration-300 border border-purple-100/50"><BarChart className="h-5 lg:h-6 w-5 lg:w-6" /></div>
                                </div>
                                <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Avg Deal Size</p>
                                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{isLoading ? '...' : formatMoney(avgDealSize)}</h3>
                            </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-8 lg:mb-12">
                        <div className="bg-white/40 backdrop-blur-3xl p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white shadow-premium">
                            <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight mb-6 lg:mb-8 flex items-center gap-4">
                                <div className="p-2 lg:p-3 bg-green-50 rounded-2xl text-green-600 border border-green-100/50"><DollarSign className="h-5 lg:h-6 w-5 lg:w-6" /></div>
                                Revenue by Source <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-auto bg-white px-3 py-1 rounded-xl border border-slate-100">Active Sources</span>
                            </h3>
                            <div className="space-y-4 lg:space-y-6">
                                {sortedSources.map(([source, value]) => (
                                    <div key={source}>
                                        <div className="flex justify-between text-[10px] lg:text-xs font-bold uppercase tracking-wide mb-2">
                                            <span className="text-slate-700">{source}</span>
                                            <span className="text-slate-900">{formatMoney(value)}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                            <div 
                                                className="bg-gradient-to-r from-brand-600 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                                                style={{ width: `${(value / maxSourceRevenue) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {sortedSources.length === 0 && <div className="py-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">No revenue data available</div>}
                            </div>
                        </div>

                        <div className="bg-white/40 backdrop-blur-3xl p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white shadow-premium">
                            <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight mb-6 lg:mb-8 flex items-center gap-4">
                                <div className="p-2 lg:p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100/50"><Layers className="h-5 lg:h-6 w-5 lg:w-6" /></div>
                                Pipeline Health
                            </h3>
                            <div className="space-y-3 lg:space-y-4">
                                {Object.entries(statusCounts).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between p-4 lg:p-5 rounded-[1.5rem] bg-white border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="flex items-center gap-4">
                                            <span className={`w-3 h-3 rounded-full shadow-lg ${
                                                status === 'onboarded' ? 'bg-green-500 shadow-green-200' : 
                                                status === 'drop' ? 'bg-red-500 shadow-red-200' : 
                                                status === 'lead' ? 'bg-blue-500 shadow-blue-200' : 
                                                status === 'completed' ? 'bg-indigo-500 shadow-indigo-200' :
                                                'bg-amber-500 shadow-amber-200'
                                            }`} />
                                            <span className="text-[10px] lg:text-[11px] font-black text-slate-700 uppercase tracking-widest">{status}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg lg:text-xl font-black text-slate-900">{count}</span>
                                            <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 w-12 text-right bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                {totalDeals > 0 ? ((count / totalDeals) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>

                     <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight mb-6 lg:mb-8 flex items-center gap-3"><FileText className="h-5 lg:h-6 w-5 lg:w-6 text-slate-400" /> Data Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {[
                                { id: 'crm', icon: Users, label: 'Export CRM Data', desc: 'Full lead database', color: 'blue' },
                                { id: 'tasks', icon: CheckSquare, label: 'Export Tasks', desc: 'Task history & logs', color: 'orange' },
                                { id: 'performance', icon: BarChart, label: 'Team Stats', desc: 'Efficiency reports', color: 'purple' }
                            ].map((item) => (
                                <button key={item.id} onClick={() => handleExport(item.id as any)} className={`group bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left flex items-start gap-4 lg:gap-6 hover:-translate-y-2 relative overflow-hidden`}>
                                    <div className={`absolute inset-0 bg-${item.color}-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                                    <div className={`h-12 w-12 lg:h-14 lg:w-14 bg-${item.color}-50 text-${item.color}-600 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-sm`}><item.icon className="h-6 lg:h-7 w-6 lg:w-7" /></div>
                                    <div className="relative z-10">
                                        <h3 className="font-black text-slate-900 text-base lg:text-lg tracking-tight">{item.label}</h3>
                                        <p className="text-[10px] lg:text-[11px] font-medium text-slate-500 mt-1 mb-4 lg:mb-6 uppercase tracking-wide">{item.desc}</p>
                                        <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-${item.color}-600 flex items-center gap-2 group-hover:translate-x-2 transition-transform`}>Download CSV <Download className="h-3 w-3" /></span>
                                    </div>
                                </button>
                            ))}
                        </div>
                     </div>
                </main>
            </div>
        </div>
    );
};
