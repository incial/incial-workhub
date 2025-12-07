
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { PieChart, BarChart, TrendingUp, AlertCircle, Lock, Download, FileText, CheckSquare, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi, companiesApi, tasksApi } from '../services/api';
import { formatMoney } from '../utils';
import { CRMEntry } from '../types';

interface AnalyticsPageProps {
  title: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ title }) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<CRMEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const loadData = async () => {
            if (user?.role === 'ROLE_ADMIN') {
                try {
                    const data = await crmApi.getAll();
                    setEntries(data.crmList);
                } catch (error) {
                    console.error("Failed to fetch analytics data", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadData();
    }, [user]);

    const handleExport = async (type: 'crm' | 'companies' | 'tasks') => {
        if (!window.confirm(`Are you sure you want to export ${type.toUpperCase()} data to CSV?`)) return;

        try {
            let data: any[] = [];
            let filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

            if (type === 'crm') {
                const res = await crmApi.getAll();
                data = res.crmList;
            } else if (type === 'companies') {
                data = await companiesApi.getAll();
            } else if (type === 'tasks') {
                data = await tasksApi.getAll();
            }

            if (!data || data.length === 0) {
                alert("No data available to export.");
                return;
            }

            // Convert to CSV
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(obj => 
                Object.values(obj).map(val => {
                    if (val === null || val === undefined) return '';
                    if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
                    return `"${String(val).replace(/"/g, '""')}"`;
                }).join(',')
            );
            const csvContent = [headers, ...rows].join('\n');
            
            // Trigger Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export data. Please try again.");
        }
    };

    // Safety check although route is protected
    if (user?.role !== 'ROLE_ADMIN') {
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

    // Calculations
    const totalRevenue = entries.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
    const wonDeals = entries.filter(e => e.status === 'onboarded').length;
    const conversionRate = entries.length > 0 ? (wonDeals / entries.length) * 100 : 0;
    const avgDealSize = entries.length > 0 ? totalRevenue / entries.length : 0;

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                
                <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
                     <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                        <p className="text-gray-500 mt-1 font-medium">Detailed insights and performance metrics.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400">Total Revenue (Pipeline)</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        {isLoading ? '...' : formatMoney(totalRevenue)}
                                    </h3>
                                </div>
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400">Conversion Rate</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        {isLoading ? '...' : `${conversionRate.toFixed(1)}%`}
                                    </h3>
                                </div>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <PieChart className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(conversionRate, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400">Avg Deal Size</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        {isLoading ? '...' : formatMoney(avgDealSize)}
                                    </h3>
                                </div>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <BarChart className="h-5 w-5" />
                                </div>
                            </div>
                             <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                     </div>

                     {/* Data Exports Section */}
                     <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500" /> Data Exports
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            <button 
                                onClick={() => handleExport('crm')}
                                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4"
                            >
                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Export CRM Data</h3>
                                    <p className="text-xs text-gray-500 mt-1 mb-2">Download all leads and deal information to CSV.</p>
                                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                                        Download CSV <Download className="h-3 w-3" />
                                    </span>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleExport('companies')}
                                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4"
                            >
                                <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Export Companies</h3>
                                    <p className="text-xs text-gray-500 mt-1 mb-2">Download client registry and project statuses.</p>
                                    <span className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                                        Download CSV <Download className="h-3 w-3" />
                                    </span>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleExport('tasks')}
                                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4"
                            >
                                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                                    <CheckSquare className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Export Tasks</h3>
                                    <p className="text-xs text-gray-500 mt-1 mb-2">Download all task assignments and priorities.</p>
                                    <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                                        Download CSV <Download className="h-3 w-3" />
                                    </span>
                                </div>
                            </button>

                        </div>
                     </div>

                     <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="h-20 w-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="h-10 w-10 text-brand-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Analytics Module</h3>
                            <p className="text-gray-500">More detailed visualization charts and custom report builders are under development.</p>
                        </div>
                     </div>
                </main>
            </div>
        </div>
    );
};
