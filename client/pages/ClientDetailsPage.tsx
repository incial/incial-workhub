import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useParams, Link } from 'react-router-dom';
import { crmApi, tasksApi, usersApi } from '../services/api';
import { CRMEntry, Task, TaskFilterState, TaskStatus, TaskPriority } from '../types';
import { ClientTaskTable } from '../components/client-tracker/ClientTaskTable';
import { ClientTaskForm } from '../components/client-tracker/ClientTaskForm';
import { TasksKanban } from '../components/tasks/TasksKanban';
import { TasksCalendar } from '../components/tasks/TasksCalendar';
import { TasksFilter } from '../components/tasks/TasksFilter';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CheckCircle, Plus, HardDrive, LayoutList, Calendar as CalendarIcon, ExternalLink, Kanban, Archive, ChevronDown, ChevronRight, AlertCircle, Building, Zap, Rocket, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { useToast } from '../context/ToastContext';
import { getStatusStyles, formatDate, formatDateTime } from '../utils';

type ViewMode = 'list' | 'kanban' | 'calendar';

export const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isSidebarCollapsed } = useLayout();
  const { showToast } = useToast();
  const [client, setClient] = useState<CRMEntry | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userAvatarMap, setUserAvatarMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  const [filters, setFilters] = useState<TaskFilterState>({
    search: '', status: '', priority: '', assignedTo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!id) return;
      try {
        const [crmData, tasksData, usersData] = await Promise.all([
            crmApi.getAll(),
            tasksApi.getAll(),
            usersApi.getAll()
        ]);
        const foundClient = crmData.crmList.find(c => c.id === parseInt(id));
        setClient(foundClient || null);
        const clientTasks = tasksData.filter(t => t.companyId === parseInt(id));
        setTasks(clientTasks);
        const uMap: Record<string, string> = {};
        usersData.forEach(u => { if (u.avatarUrl) uMap[u.name] = u.avatarUrl; });
        setUserAvatarMap(uMap);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    fetchData();
  }, [id]);

  const filteredBaseTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const matchesSearch = (t.title || '').toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === '' || t.status === filters.status;
      const matchesPriority = filters.priority === '' || t.priority === filters.priority;
      const matchesAssignee = filters.assignedTo === '' || t.assignedTo === filters.assignedTo;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
    return result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [tasks, filters]);

  const { activeTasks, completedTasks } = useMemo(() => {
      const active = filteredBaseTasks.filter(t => t.status !== 'Completed' && t.status !== 'Done');
      const completed = filteredBaseTasks.filter(t => t.status === 'Completed' || t.status === 'Done');
      return { activeTasks: active, completedTasks: completed };
  }, [filteredBaseTasks]);

  const progressStats = useMemo(() => {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Done' || t.status === 'Posted').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed' && t.status !== 'Done').length;
      return { total, completed, progress, highPriority };
  }, [tasks]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Task>) => {
      if (!client) return;
      try {
          if (editingTask) {
              // Optimistic update
              setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...data } as Task : t));
              
              await tasksApi.update(editingTask.id, data);
              showToast("Milestone synchronized", "success");
          } else {
              const newTask = await tasksApi.create({ ...data, companyId: client.id } as Task);
              setTasks(prev => [...prev, newTask]);
              showToast("New milestone deployed", "success");
          }
      } catch(e) { 
          showToast("Sync failed", "error");
          console.error(e); 
          // Reload on error
          const updatedTasks = await tasksApi.getAll();
          setTasks(updatedTasks.filter(t => t.companyId === client?.id));
      }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
      const previousTasks = [...tasks];
      // Optimistic Update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus, lastUpdatedAt: new Date().toISOString() } : t));
      
      try {
          await tasksApi.update(task.id, { 
              status: newStatus,
              lastUpdatedAt: new Date().toISOString(),
              lastUpdatedBy: user?.name || 'System'
          });
      } catch (e) {
          showToast("Status sync failed", "error");
          setTasks(previousTasks); // Revert
      }
  };

  const handlePriorityChange = async (task: Task, newPriority: TaskPriority) => {
      const previousTasks = [...tasks];
      // Optimistic Update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority: newPriority, lastUpdatedAt: new Date().toISOString() } : t));
      
      try {
          await tasksApi.update(task.id, { 
              priority: newPriority,
              lastUpdatedAt: new Date().toISOString(),
              lastUpdatedBy: user?.name || 'System'
          });
          showToast(`Priority set to ${newPriority}`, "success");
      } catch (e) {
          showToast("Priority sync failed", "error");
          setTasks(previousTasks); // Revert
      }
  };

  const handleToggleVisibility = async (task: Task) => {
      const newVisibility = !task.isVisibleOnMainBoard;
      const previousTasks = [...tasks];
      // Optimistic Update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isVisibleOnMainBoard: newVisibility } : t));
      
      try {
          await tasksApi.update(task.id, { isVisibleOnMainBoard: newVisibility });
          showToast(newVisibility ? "Task promoted to main board" : "Task hidden from main board", "success");
      } catch (e) {
          setTasks(previousTasks); // Revert
          showToast("Sync failed", "error");
      }
  };

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-brand-600" />
    </div>
  );
  
  if (!client) return <div className="flex min-h-screen items-center justify-center">Node offline</div>;

  return (
    <div className="flex min-h-screen mesh-bg relative">
      <div className="glass-canvas" />
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
        <Navbar />
        
        <div className="flex-1 px-6 lg:px-12 py-10 pb-32">
           
           <div className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                <Link to="/client-tracker" className="hover:text-brand-600 transition-colors">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-900">{client.company} Dashboard</span>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
               {/* Identity Card */}
               <div className="xl:col-span-8 bg-white/40 backdrop-blur-3xl rounded-[3.5rem] p-12 border border-white shadow-premium relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-100 rounded-full blur-[100px] opacity-30 -mr-48 -mt-48 transition-opacity group-hover:opacity-50" />
                   
                   <div className="relative z-10">
                       <div className="flex items-center gap-8 mb-10">
                           <div className="h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner shrink-0 ring-4 ring-white/50">
                                {client.companyImageUrl ? <img src={client.companyImageUrl} className="h-full w-full object-cover" /> : <Building className="h-10 w-10 text-slate-200" />}
                           </div>
                           <div>
                               <div className="flex flex-wrap items-center gap-4 mb-3">
                                   <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{client.company}</h1>
                                   <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-inner-glass ${getStatusStyles(client.status)}`}>
                                       {client.status}
                                   </span>
                               </div>
                               <p className="text-slate-500 font-bold text-lg flex items-center gap-2">
                                   <User className="h-5 w-5 text-brand-400" /> Executive Point: <span className="text-slate-900">{client.contactName}</span>
                               </p>
                           </div>
                       </div>
                       
                       <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl italic">
                            "{client.notes || 'This project node is undergoing strategic operational sync.'}"
                       </p>

                       <div className="flex flex-wrap gap-4 mt-10">
                           {client.driveLink && (
                               <a href={client.driveLink} target="_blank" className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-700 bg-white border border-slate-100 px-8 py-4 rounded-3xl hover:shadow-xl hover:border-brand-300 transition-all">
                                    <HardDrive className="h-5 w-5 text-brand-600" /> Digital Asset Vault
                               </a>
                           )}
                           {client.socials?.website && (
                                <a href={client.socials.website} target="_blank" className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-700 bg-white border border-slate-100 px-8 py-4 rounded-3xl hover:shadow-xl hover:border-brand-300 transition-all">
                                     <Rocket className="h-5 w-5 text-indigo-600" /> Public Node
                                </a>
                           )}
                       </div>
                   </div>
               </div>

               {/* Stats Card */}
               <div className="xl:col-span-4 bg-slate-950 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5">
                   <div className="absolute inset-0 bg-gradient-to-br from-brand-600/30 via-transparent to-transparent opacity-50" />
                   
                   <div className="relative z-10">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-400 mb-10 flex items-center gap-3">
                           <Zap className="h-4 w-4 fill-brand-400" /> Operational Pulse
                       </h3>
                       
                       <div className="flex items-baseline gap-4 mb-6">
                           <span className="text-8xl font-black tracking-tighter leading-none">{progressStats.progress}%</span>
                           <div className="flex flex-col">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Velocity</span>
                               <span className="text-sm font-bold text-emerald-400 mt-1">OPTIMAL</span>
                           </div>
                       </div>
                       
                       <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                           <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full transition-all duration-[1500ms] shadow-[0_0_20px_rgba(99,102,241,0.5)]" style={{ width: `${progressStats.progress}%` }} />
                       </div>
                   </div>

                   <div className="relative z-10 grid grid-cols-2 gap-8 mt-10 pt-10 border-t border-white/5">
                       <div>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Completed</p>
                           <p className="text-3xl font-black text-white">{progressStats.completed} <span className="text-sm font-bold text-slate-600">/ {progressStats.total}</span></p>
                       </div>
                       <div>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><AlertCircle className="h-3 w-3 text-rose-500" /> Priority</p>
                           <p className="text-3xl font-black text-white">{progressStats.highPriority}</p>
                       </div>
                   </div>
               </div>
           </div>

           {/* Workflow Workspace */}
           <div className="bg-white/30 backdrop-blur-3xl rounded-[3.5rem] border border-white shadow-2xl flex flex-col mb-12">
                
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-4 border-b border-slate-100 bg-white/20 rounded-t-[3.5rem]">
                    <div className="p-2 bg-white/60 rounded-3xl flex items-center gap-1 border border-white/50 overflow-x-auto max-w-full">
                        {[
                            { id: 'list', label: 'Milestones', icon: LayoutList },
                            { id: 'kanban', label: 'Board', icon: Kanban },
                            { id: 'calendar', label: 'Timeline', icon: CalendarIcon },
                        ].map((view) => (
                            <button
                                key={view.id}
                                onClick={() => setViewMode(view.id as ViewMode)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    viewMode === view.id ? 'bg-white text-brand-700 shadow-xl ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                <view.icon className="h-4 w-4" /> {view.label}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => { setEditingTask(undefined); setIsModalOpen(true); }}
                        className="bg-slate-950 hover:bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                    >
                        <Plus className="h-5 w-5 text-brand-400" /> New Task
                    </button>
                </div>

                {viewMode !== 'calendar' && <TasksFilter filters={filters} setFilters={setFilters} />}

                <div className="pb-10">
                    {viewMode === 'list' && (
                        <div>
                             <div className="px-10 py-6 flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Active Deployment Queue</h3>
                             </div>
                             
                             <ClientTaskTable 
                                tasks={activeTasks} 
                                userAvatarMap={userAvatarMap} 
                                onEdit={handleEdit} 
                                onDelete={(id) => setDeleteId(id)} 
                                onStatusChange={handleStatusChange} 
                                onPriorityChange={handlePriorityChange}
                                onToggleVisibility={handleToggleVisibility}
                             />

                            {completedTasks.length > 0 && (
                                <div className="mt-8 border-t border-slate-950/5 px-10">
                                     <button 
                                        onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                                        className="w-full flex items-center gap-4 py-8 hover:bg-white/40 transition-colors text-left group rounded-[2rem] px-4"
                                    >
                                        <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors">
                                            {isCompletedExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </div>
                                        <Archive className="h-6 w-6 text-slate-300" />
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Archives ({completedTasks.length})</h3>
                                    </button>
                                    {isCompletedExpanded && (
                                        <ClientTaskTable 
                                            tasks={completedTasks} 
                                            userAvatarMap={userAvatarMap} 
                                            onEdit={handleEdit} 
                                            onDelete={(id) => setDeleteId(id)} 
                                            onStatusChange={handleStatusChange} 
                                            onPriorityChange={handlePriorityChange}
                                            onToggleVisibility={handleToggleVisibility}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'kanban' && (
                        <div className="px-4 lg:px-8 py-6 h-[650px] overflow-x-auto custom-scrollbar">
                            <TasksKanban 
                                tasks={filteredBaseTasks} 
                                userAvatarMap={userAvatarMap} 
                                onEdit={handleEdit} 
                                onStatusChange={handleStatusChange} 
                            />
                        </div>
                    )}
                    
                    {viewMode === 'calendar' && (
                        <div className="px-4 lg:px-8 py-6 h-[750px]">
                            <TasksCalendar 
                                tasks={filteredBaseTasks} 
                                onEdit={handleEdit} 
                            />
                        </div>
                    )}
                </div>
                
                <div className="p-8 border-t border-white/40 bg-white/20 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] flex justify-between rounded-b-[3.5rem]">
                    <span>Registry: {filteredBaseTasks.length} Operations Loaded</span>
                    <span>System: Synced</span>
                </div>
           </div>
        </div>
      </div>

      <ClientTaskForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSave} initialData={editingTask} companyId={client.id} />
      <DeleteConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if(deleteId) { 
          setTasks(prev => prev.filter(t => t.id !== deleteId)); // Optimistic delete
          await tasksApi.delete(deleteId); 
          setDeleteId(null); 
      } }} title="Discard Task" message="Remove this operational entry from the node history?" />
    </div>
  );
};