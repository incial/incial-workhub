
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { meetingsApi } from '../services/api';
import { Meeting, MeetingStatus } from '../types';
import { MeetingTable } from '../components/meetings/MeetingTable';
import { MeetingForm } from '../components/meetings/MeetingForm';
import { MeetingsCalendar } from '../components/meetings/MeetingsCalendar';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { Calendar, Plus, Search, LayoutList, Calendar as CalendarIcon, Archive, ChevronDown, ChevronRight, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';

export const MeetingTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const { isSidebarCollapsed } = useLayout();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | MeetingStatus>('All');
  const [search, setSearch] = useState('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await meetingsApi.getAll();
      setMeetings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchData();
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const { activeMeetings, historyMeetings } = useMemo(() => {
      const baseFiltered = meetings.filter(m => {
          const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
          const matchesStatus = activeFilter === 'All' || m.status === activeFilter;
          return matchesSearch && matchesStatus;
      });

      const active = baseFiltered.filter(m => !['Completed', 'Cancelled'].includes(m.status));
      const history = baseFiltered.filter(m => ['Completed', 'Cancelled'].includes(m.status));

      active.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      history.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

      return { activeMeetings: active, historyMeetings: history };
  }, [meetings, search, activeFilter]);

  const handleCreate = (dateStr?: string) => {
      if (dateStr) {
          // Initialize with current time but selected date
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          setEditingMeeting({
              id: 0,
              title: '',
              dateTime: `${dateStr}T${timeStr}`,
              status: 'Scheduled',
              createdAt: new Date().toISOString()
          });
      } else {
          setEditingMeeting(undefined);
      }
      setIsModalOpen(true);
  };

  const handleEdit = (meeting: Meeting) => {
      setEditingMeeting(meeting);
      setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Meeting>) => {
      const auditData = {
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };
      const finalData = { ...data, ...auditData };

      try {
          if (editingMeeting && editingMeeting.id !== 0) {
              await meetingsApi.update(editingMeeting.id, finalData);
          } else {
              await meetingsApi.create(finalData as Meeting);
          }
          fetchData();
      } catch (e) {
          console.error(e);
      }
  };

  const handleDelete = async () => {
      if (!deleteId) return;
      try {
        await meetingsApi.delete(deleteId);
        fetchData();
      } catch(e) {
        console.error(e);
      }
      setDeleteId(null);
  };

  const handleStatusChange = async (meeting: Meeting, newStatus: MeetingStatus) => {
      try {
          await meetingsApi.update(meeting.id, { 
              status: newStatus,
              lastUpdatedBy: user?.name || 'Unknown',
              lastUpdatedAt: new Date().toISOString()
          });
          fetchData();
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="flex min-h-screen mesh-bg relative">
      <div className="glass-canvas" />
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
        <Navbar />
        
        <div className="flex-1 px-4 lg:px-12 py-6 lg:py-10 pb-32">
           <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 lg:gap-8 mb-8 lg:mb-16 animate-premium">
             <div>
                <div className="flex items-center gap-3 mb-2 lg:mb-4">
                     <div className="h-1.5 lg:h-2 w-1.5 lg:w-2 rounded-full bg-brand-500 animate-pulse" />
                     <span className="text-[9px] lg:text-[10px] font-black text-brand-600 uppercase tracking-[0.5em]">Communications Hub</span>
                </div>
                <h1 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none display-text">Scheduler.</h1>
             </div>
             
             <button 
                onClick={() => handleCreate()}
                className="bg-slate-950 hover:bg-slate-900 text-white px-6 lg:px-10 py-3 lg:py-5 rounded-2xl lg:rounded-[2rem] flex items-center justify-center gap-3 lg:gap-4 font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all w-full sm:w-auto text-xs lg:text-sm"
             >
                <Plus className="h-5 lg:h-6 w-5 lg:w-6 text-brand-400" /> New Sync
             </button>
           </div>

           <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] lg:rounded-[3rem] border border-white/60 shadow-xl flex flex-col mb-20 overflow-hidden">
                
                <div className="p-4 lg:p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 lg:gap-6 items-start md:items-center justify-between bg-white/40">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex p-1 bg-white/60 rounded-xl lg:rounded-2xl border border-white shadow-inner w-full md:w-auto">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${
                                    viewMode === 'list' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <LayoutList className="h-3.5 w-3.5" /> List
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${
                                    viewMode === 'calendar' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <CalendarIcon className="h-3.5 w-3.5" /> Calendar
                            </button>
                        </div>
                    </div>

                    {viewMode === 'list' && (
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 lg:h-5 w-4 lg:w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search by title..." 
                                className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-white/80 border border-gray-200 rounded-xl lg:rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium shadow-inner"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-20 lg:p-32">
                            <div className="animate-spin rounded-full h-8 lg:h-10 w-8 lg:w-10 border-[4px] border-slate-100 border-t-brand-600" />
                        </div>
                    ) : (
                        <div className="h-full">
                            {viewMode === 'list' ? (
                                <div className="p-4 lg:p-8">
                                    <MeetingTable 
                                        data={activeMeetings} 
                                        onEdit={handleEdit}
                                        onStatusChange={handleStatusChange}
                                    />

                                    {historyMeetings.length > 0 && (
                                        <div className="border-t border-gray-100 mt-8 lg:mt-12">
                                            <button 
                                                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                                                className="w-full flex items-center gap-3 lg:gap-4 p-4 lg:p-8 hover:bg-white/40 transition-colors text-left group rounded-[2rem] lg:rounded-[2.5rem]"
                                            >
                                                <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-brand-50 transition-colors">
                                                    {isHistoryExpanded ? <ChevronDown className="h-4 lg:h-5 w-4 lg:w-5 text-slate-500" /> : <ChevronRight className="h-4 lg:h-5 w-4 lg:w-5 text-slate-500" />}
                                                </div>
                                                <Archive className="h-5 lg:h-6 w-5 lg:w-6 text-slate-300" />
                                                <h3 className="text-xs lg:text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    Historical Logs ({historyMeetings.length})
                                                </h3>
                                            </button>

                                            {isHistoryExpanded && (
                                                <div className="bg-slate-50/20 px-4 lg:px-8 pb-8 lg:pb-12">
                                                    <MeetingTable 
                                                        data={historyMeetings} 
                                                        onEdit={handleEdit}
                                                        onStatusChange={handleStatusChange}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-[500px] lg:h-[700px] p-4 lg:p-10">
                                    <MeetingsCalendar 
                                        meetings={meetings} 
                                        onEdit={handleEdit} 
                                        onCreateAt={(date) => handleCreate(date)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
           </div>
        </div>

        <MeetingForm 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleSave}
            initialData={editingMeeting}
            onDelete={(id) => setDeleteId(id)}
        />

        <DeleteConfirmationModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
            title="Discard Sync"
            message="Are you sure you want to remove this scheduled meeting?"
        />
      </div>
    </div>
  );
};
