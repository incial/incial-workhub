
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { PieChart, BarChart, TrendingUp, Lock, Download, FileText, CheckSquare, Users, DollarSign, Layers, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { crmApi, tasksApi, usersApi } from '../services/api';
import { formatMoney, exportToCSV } from '../utils';
import { CRMEntry } from '../types';

interface AnalyticsPageProps {
  title: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ title }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [entries, setEntries] = useState<CRMEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const hasPermission = user?.role === 'ROLE_SUPER_ADMIN';

    useEffect(() => {
        const loadData = async () => {
            if (hasPermission) {
                try {
                    const data = await crmApi.getAll();
                    setEntries(data.crmList);
                } catch (error) {
                    console.error("Failed to fetch analytics data", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user, hasPermission]);

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
                    AssignedTo: t.assignedTo,
                    DueDate: t.dueDate,
                    Client: (t.companyId && companyMap[t.companyId]) ? companyMap[t.companyId] : (t.companyId ? `ID: ${t.companyId}` : 'Internal'),
                    Created: t.createdAt
                }));
            } else if (type === 'performance') {
                const [tasks, users] = await Promise.all([tasksApi.getAll(), usersApi.getAll()]);
                const statsMap: Record<string, any> = {};
                
                users.forEach(u => {
                    statsMap[u.name] = { Name: u.name, Role: u.role, Total: 0, Completed: 0, Pending: 0 };
                });

                tasks.forEach(t => {
                    const assignee = t.assignedTo || 'Unassigned';
                    if (!statsMap[assignee]) statsMap[assignee] = { Name: assignee, Role: 'External', Total: 0, Completed: 0, Pending: 0 };
                    
                    statsMap[assignee].Total++;
                    if (['Completed', 'Done'].includes(t.status)) statsMap[assignee].Completed++;
                    else statsMap[assignee].Pending++;
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
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                
                <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
                     <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                        <p className="text-gray-500 mt-2 font-medium">Analytics engine for revenue distribution and pipeline health.</p>
                     </div>

                     <div className="bg-white rounded-[2.5rem] border border-gray-200/60 shadow-sm mb-10 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="p-8 group hover:bg-gray-50/30 transition-colors">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300"><TrendingUp className="h-6 w-6" /></div>
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><ArrowUpRight className="h-3 w-3" /> Live</span>
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pipeline Value</p>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{isLoading ? '...' : formatMoney(totalRevenue)}</h3>
                            </div>
                            <div className="p-8 group hover:bg-gray-50/30 transition-colors">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300"><PieChart className="h-6 w-6" /></div>
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Win Rate</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{isLoading ? '...' : `${conversionRate.toFixed(1)}%`}</h3>
                                    <span className="text-sm font-medium text-gray-500">of {entries.length} leads</span>
                                </div>
                            </div>
                            <div className="p-8 group hover:bg-gray-50/30 transition-colors">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300"><BarChart className="h-6 w-6" /></div>
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Deal Size</p>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{isLoading ? '...' : formatMoney(avgDealSize)}</h3>
                            </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign className="h-5 w-5" /></div>
                                Revenue by Source <span className="text-xs font-medium text-gray-400 font-sans ml-auto">Active Sources Only</span>
                            </h3>
                            <div className="space-y-6">
                                {sortedSources.map(([source, value]) => (
                                    <div key={source}>
                                        <div className="flex justify-between text-sm font-bold mb-2">
                                            <span className="text-gray-700">{source}</span>
                                            <span className="text-gray-900">{formatMoney(value)}</span>
                                        </div>
                                        <div className="w-full bg-gray-50 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className="bg-brand-600 h-full rounded-full transition-all duration-1000 ease-out" 
                                                style={{ width: `${(value / maxSourceRevenue) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {sortedSources.length === 0 && <div className="py-10 text-center text-gray-400 italic">No revenue-generating sources found.</div>}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Layers className="h-5 w-5" /></div>
                                Pipeline Health
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(statusCounts).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-white transition-all group">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full shadow-sm ${
                                                status === 'onboarded' ? 'bg-green-500' : status === 'drop' ? 'bg-red-500' : status === 'lead' ? 'bg-blue-500' : 'bg-amber-500'
                                            }`} />
                                            <span className="text-sm font-bold text-gray-700 capitalize">{status}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-base font-black text-gray-900">{count}</span>
                                            <span className="text-xs text-gray-400 font-medium w-12 text-right bg-white px-2 py-1 rounded-md border border-gray-100">
                                                {totalDeals > 0 ? ((count / totalDeals) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>

                     <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FileText className="h-5 w-5 text-gray-400" /> Data Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { id: 'crm', icon: Users, label: 'Export CRM Data', desc: 'Full lead database', color: 'blue' },
                                { id: 'tasks', icon: CheckSquare, label: 'Export Tasks', desc: 'Task history & logs', color: 'orange' },
                                { id: 'performance', icon: BarChart, label: 'Team Stats', desc: 'Efficiency reports', color: 'purple' }
                            ].map((item) => (
                                <button key={item.id} onClick={() => handleExport(item.id as any)} className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all text-left flex items-start gap-5 hover:-translate-y-1">
                                    <div className={`h-12 w-12 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center flex-shrink-0`}><item.icon className="h-6 w-6" /></div>
                                    <div><h3 className="font-bold text-gray-900 text-lg">{item.label}</h3><p className="text-xs text-gray-500 mt-1 mb-4 font-medium">{item.desc}</p><span className={`text-xs font-bold text-${item.color}-600 flex items-center gap-1 group-hover:underline`}>Download CSV <Download className="h-3 w-3" /></span></div>
                                </button>
                            ))}
                        </div>
                     </div>
                </main>
            </div>
        </div>
    );
};
