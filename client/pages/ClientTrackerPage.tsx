
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { crmApi, tasksApi } from '../services/api';
import { CRMEntry } from '../types';
import { ListTodo, Search, Building, ChevronRight, Activity, ArrowUpAz, ArrowDownAz, ChevronUp, ChevronDown } from 'lucide-react';
import { getStatusStyles } from '../utils';

type SortKey = 'company' | 'progress' | 'status' | 'completed';
type SortDirection = 'asc' | 'desc';

export const ClientTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'company',
    direction: 'asc'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [crmData, tasksData] = await Promise.all([crmApi.getAll(), tasksApi.getAll()]);
        const activeCompanies = crmData.crmList.filter(c => ['onboarded', 'on progress', 'Quote Sent'].includes(c.status));
        setClients(activeCompanies.map(client => {
            const clientTasks = tasksData.filter(t => t.companyId === client.id);
            const completed = clientTasks.filter(t => ['Completed', 'Done', 'Posted'].includes(t.status)).length;
            return { 
                ...client, 
                total: clientTasks.length, 
                completed, 
                progress: clientTasks.length > 0 ? Math.round((completed / clientTasks.length) * 100) : 0 
            };
        }));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const processedClients = useMemo(() => {
    let result = clients.filter(c => 
        c.company.toLowerCase().includes(search.toLowerCase()) || 
        c.contactName.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        switch (sortConfig.key) {
            case 'company':
                return direction * a.company.localeCompare(b.company);
            case 'progress':
                return direction * (a.progress - b.progress);
            case 'status':
                return direction * a.status.localeCompare(b.status);
            case 'completed':
                return direction * (a.completed - b.completed);
            default:
                return 0;
        }
    });

    return result;
  }, [clients, search, sortConfig]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ChevronDown className="h-3 w-3 opacity-20 group-hover:opacity-50 transition-opacity" />;
    return sortConfig.direction === 'asc' 
        ? <ChevronUp className="h-3 w-3 text-brand-600 animate-in fade-in zoom-in duration-300" /> 
        : <ChevronDown className="h-3 w-3 text-brand-600 animate-in fade-in zoom-in duration-300" />;
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           
           {/* Page Header */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
             <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
                    <ListTodo className="h-10 w-10 text-brand-600" /> 
                    Client Tracker
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Monitoring roadmap execution and delivery velocity.</p>
             </div>
             <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search active projects..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm group-hover:border-brand-200 transition-all font-medium" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                />
             </div>
           </div>

           {/* Registry Table matching Super Admin Style */}
           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="p-0">
                                    <button onClick={() => handleSort('company')} className="w-full h-full p-6 flex items-center gap-2 group hover:text-gray-900 transition-colors outline-none">
                                        Project / Client <SortIcon column="company" />
                                    </button>
                                </th>
                                <th className="p-0">
                                    <button onClick={() => handleSort('progress')} className="w-full h-full p-6 flex items-center gap-2 group hover:text-gray-900 transition-colors outline-none">
                                        Delivery Progress <SortIcon column="progress" />
                                    </button>
                                </th>
                                <th className="p-0">
                                    <button onClick={() => handleSort('status')} className="w-full h-full p-6 flex items-center gap-2 group hover:text-gray-900 transition-colors outline-none">
                                        Account Status <SortIcon column="status" />
                                    </button>
                                </th>
                                <th className="p-0">
                                    <button onClick={() => handleSort('completed')} className="w-full h-full p-6 flex items-center gap-2 group hover:text-gray-900 transition-colors outline-none">
                                        Activity <SortIcon column="completed" />
                                    </button>
                                </th>
                                <th className="p-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-6"><div className="h-12 bg-gray-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : processedClients.map(client => (
                                <tr 
                                    key={client.id} 
                                    onClick={() => navigate(`/client-tracker/${client.id}`)}
                                    className="group hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                                >
                                    {/* Company Details */}
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-white rounded-2xl border border-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                                                {client.companyImageUrl ? (
                                                    <>
                                                        <img 
                                                            src={client.companyImageUrl} 
                                                            alt={client.company} 
                                                            className="h-full w-full object-cover" 
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                        <div className="hidden h-full w-full flex items-center justify-center text-brand-600 font-black text-lg">
                                                            {client.company.charAt(0)}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-brand-600 font-black text-lg">{client.company.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-base group-hover:text-brand-700 transition-colors">
                                                    {client.company}
                                                </p>
                                                <p className="text-xs font-medium text-gray-400 mt-0.5">
                                                    POC: {client.contactName}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Progress Monitor */}
                                    <td className="p-6">
                                        <div className="w-48">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Velocity</span>
                                                <span className={`text-xs font-black ${sortConfig.key === 'progress' ? 'text-brand-600' : 'text-gray-400'}`}>{client.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-1000" 
                                                    style={{ width: `${client.progress}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </td>

                                    {/* Account Status Badge */}
                                    <td className="p-6">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border backdrop-blur-md shadow-sm whitespace-nowrap ${getStatusStyles(client.status)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 inline-block opacity-60"></span>
                                            {client.status}
                                        </span>
                                    </td>

                                    {/* Activity Metric */}
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Activity className={`h-4 w-4 ${sortConfig.key === 'completed' ? 'text-brand-500' : 'text-gray-300'}`} />
                                            <span className="font-bold text-gray-700">{client.completed}</span>
                                            <span className="text-gray-400 font-medium">/ {client.total} Tasks</span>
                                        </div>
                                    </td>

                                    {/* Link Icon */}
                                    <td className="p-6 text-right">
                                        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full text-gray-300 group-hover:text-brand-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!isLoading && processedClients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Building className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-900">No projects match your search</h3>
                                        <p className="text-gray-500 text-sm">Adjust your filters to see active project deliverables.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
           </div>
        </main>
      </div>
    </div>
  );
};
