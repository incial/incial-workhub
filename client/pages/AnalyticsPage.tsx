
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { PieChart, BarChart, TrendingUp, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi } from '../services/api';
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
                
                <main className="flex-1 p-8 overflow-y-auto">
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

                     <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="h-20 w-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="h-10 w-10 text-brand-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Reports Coming Soon</h3>
                            <p className="text-gray-500">We are currently building comprehensive reporting tools to help you visualize your data better. Stay tuned for updates!</p>
                        </div>
                     </div>
                </main>
            </div>
        </div>
    );
};
