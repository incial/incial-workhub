
import React from 'react';
import { TrendingUp, Users, Briefcase } from 'lucide-react';
import { CRMEntry } from '../../types';

export const CRMStats: React.FC<{ entries: CRMEntry[] }> = ({ entries }) => {
    // Removed totalValue calculation
    const activeDeals = entries.filter(e => e.status !== 'drop' && e.status !== 'onboarded').length;
    const onboarded = entries.filter(e => e.status === 'onboarded').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Removed Pipeline Value Card */}

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <Briefcase className="h-5 w-5 text-indigo-600" />
                    </div>
                </div>
                <p className="text-gray-500 text-sm font-medium">Active Deals</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{activeDeals}</h3>
            </div>

             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                </div>
                <p className="text-gray-500 text-sm font-medium">Won Deals</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{onboarded}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <Users className="h-5 w-5 text-purple-600" />
                    </div>
                     <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">All Time</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">Total Leads</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{entries.length}</h3>
            </div>
        </div>
    );
};
