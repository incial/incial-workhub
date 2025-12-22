
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { crmApi, tasksApi } from '../services/api';
import { CRMEntry, Task, TaskPriority } from '../types';
import { ClientTaskTable } from '../components/client-tracker/ClientTaskTable';
import { ClientTaskForm } from '../components/client-tracker/ClientTaskForm';
import { AlertCircle, LogOut, Phone, Mail, MapPin, Globe, Linkedin, Instagram, ExternalLink, Plus, Sparkles, Target, Layout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatMoney, getStatusStyles } from '../utils';

export const ClientPortalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [client, setClient] = useState<CRMEntry | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const fetchData = async () => {
    if (!user?.clientCrmId) { 
      setIsLoading(false); 
      return; 
    }
    try {
      const [crmData, tasksData] = await Promise.all([
        crmApi.getMyCrm(),
        tasksApi.getClientTasks()
      ]);
      setClient(crmData);
      setTasks(tasksData);
    } catch (e: any) {
      console.error("Failed to fetch client portal data", e);
      setError(e.message || "Could not load project data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleTaskSubmit = async (data: Partial<Task>) => {
    try {
        if (data.id) {
            await tasksApi.update(data.id, data);
            showToast("Update successful", "success");
        } else {
            await tasksApi.create({ ...data, companyId: user?.clientCrmId } as any);
            showToast("New request submitted", "success");
        }
        fetchData();
    } catch (e) {
        showToast("Action failed", "error");
    }
  };

  const handlePriorityChange = async (task: Task, newPriority: TaskPriority) => {
    try {
        await tasksApi.update(task.id, { priority: newPriority });
        showToast("Priority updated", "success");
        fetchData();
    } catch (e) {
        showToast("Update failed", "error");
    }
  };

  if (isLoading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-100 border-t-brand-600"></div>
        <p className="font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Authorizing Access...</p>
    </div>
  );

  if (!user?.clientCrmId || !client || error) return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#F8FAFC] p-8 text-center">
        <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 border border-rose-100 shadow-xl">
            <AlertCircle className="h-10 w-10" />
        </div>
        <div className="max-w-md">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Portal Access Restricted</h1>
            <p className="text-gray-500 font-medium">
                {error || "Your account is not linked to an active project. Please contact the Incial support team."}
            </p>
        </div>
        <button onClick={logout} className="px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold shadow-2xl active:scale-95 transition-all">
            Return to Login
        </button>
    </div>
  );

  const completedCount = tasks.filter(t => ['Done', 'Completed'].includes(t.status)).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           
           {/* Executive Hero */}
           <div className="bg-[#0B1121] rounded-[3rem] p-10 lg:p-12 border border-slate-800 shadow-2xl mb-10 relative overflow-hidden text-white">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full -mr-64 -mt-64 blur-[100px] pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-[80px] pointer-events-none"></div>
               
               <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                   <div className="flex items-center gap-8">
                        <div className="h-24 w-24 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl ring-4 ring-white/5">
                            {client.company.charAt(0)}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                                <h1 className="text-4xl font-black tracking-tight">{client.company}</h1>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md shadow-lg ${getStatusStyles(client.status)}`}>
                                    {client.status}
                                </span>
                            </div>
                            <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                                <Target className="h-4 w-4 text-brand-400" />
                                Portfolio Lead: <span className="text-white font-bold">{client.contactName}</span>
                            </p>
                        </div>
                   </div>

                   <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 text-right min-w-[180px]">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Contract Valuation</p>
                            <p className="text-3xl font-black text-brand-400">{formatMoney(client.dealValue)}</p>
                        </div>
                        <button 
                            onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-[2rem] font-bold flex flex-col items-center justify-center shadow-xl shadow-brand-600/20 active:scale-95 transition-all group"
                        >
                            <Plus className="h-6 w-6 mb-1 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="text-[10px] font-black uppercase tracking-widest">New Request</span>
                        </button>
                   </div>
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                {/* Insights Column */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Progress Monitor */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-brand-500" /> Roadmap Velocity
                                </h3>
                                <p className="text-3xl font-black text-gray-900">{progressPercent}% Completion</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Milestones</p>
                                <p className="text-xl font-bold text-brand-600">{completedCount} <span className="text-xs text-gray-400">/ {tasks.length}</span></p>
                            </div>
                        </div>
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="mt-6 flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {tasks.slice(0, 4).map(t => (
                                <div key={t.id} className="flex-shrink-0 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-500">
                                    {t.title.slice(0, 15)}...
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deliverables Board */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Layout className="h-4 w-4" /> Deliverables Queue
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-200 px-4 py-2 rounded-xl">
                                Synchronized {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <ClientTaskTable 
                            tasks={tasks} 
                            onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }}
                            onPriorityChange={handlePriorityChange}
                            isClientView={true}
                        />
                    </div>
                </div>

                {/* Sidebar Info Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Communication Hub */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" /> Project Registry
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all rounded-[1.5rem] border border-transparent hover:border-gray-100 group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Corporate Email</p>
                                <p className="text-sm font-bold text-gray-800 flex items-center justify-between">
                                    {client.email || '-'} <Mail className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all rounded-[1.5rem] border border-transparent hover:border-gray-100 group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Point of Contact</p>
                                <p className="text-sm font-bold text-gray-800 flex items-center justify-between">
                                    {client.phone || '-'} <Phone className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all rounded-[1.5rem] border border-transparent hover:border-gray-100 group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Headquarters</p>
                                <p className="text-sm font-bold text-gray-800 line-clamp-1 flex items-center justify-between">
                                    {client.address || '-'} <MapPin className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Social Footprint */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5" /> Digital Assets
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {client.socials?.website && (
                                <a href={client.socials.website} target="_blank" rel="noopener noreferrer" className="p-4 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-600 rounded-2xl border border-gray-100 transition-all flex items-center justify-center">
                                    <Globe className="h-5 w-5" />
                                </a>
                            )}
                            {client.socials?.linkedin && (
                                <a href={client.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-2xl border border-gray-100 transition-all flex items-center justify-center">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            )}
                            {client.socials?.instagram && (
                                <a href={client.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-4 bg-gray-50 hover:bg-pink-50 text-gray-400 hover:text-pink-600 rounded-2xl border border-gray-100 transition-all flex items-center justify-center">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                        {client.driveLink && (
                            <a href={client.driveLink} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-bold text-xs shadow-lg shadow-blue-200 transition-all active:scale-95 group">
                                <ExternalLink className="h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> Shared Project Cloud
                            </a>
                        )}
                    </div>
                </div>
           </div>
        </main>
      </div>

      <ClientTaskForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        companyId={client.id}
        isClientView={true}
      />
    </div>
  );
};
