
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { meetingsApi } from '../services/api';
import { Meeting, MeetingStatus } from '../types';
import { MeetingTable } from '../components/meetings/MeetingTable';
import { MeetingForm } from '../components/meetings/MeetingForm';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { Calendar, Plus, Search, Filter, LayoutList, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MeetingTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | MeetingStatus>('All');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await meetingsApi.getAll();
      setMeetings(data);
      localStorage.setItem('mock_meetings_data', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMeetings = useMemo(() => {
      return meetings.filter(m => {
          const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
          const matchesStatus = activeFilter === 'All' || m.status === activeFilter;
          return matchesSearch && matchesStatus;
      }).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [meetings, search, activeFilter]);

  const handleCreate = () => {
      setEditingMeeting(undefined);
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

      if (editingMeeting) {
          const updated = { ...editingMeeting, ...finalData } as Meeting;
          const newMeetings = meetings.map(m => m.id === updated.id ? updated : m);
          setMeetings(newMeetings);
          await meetingsApi.update(updated.id, finalData);
          localStorage.setItem('mock_meetings_data', JSON.stringify(newMeetings));
      } else {
          const newMeeting = await meetingsApi.create(finalData as Meeting);
          const newMeetings = [newMeeting, ...meetings];
          setMeetings(newMeetings);
          localStorage.setItem('mock_meetings_data', JSON.stringify(newMeetings));
      }
  };

  const handleDelete = async () => {
      if (!deleteId) return;
      const newMeetings = meetings.filter(m => m.id !== deleteId);
      setMeetings(newMeetings);
      setDeleteId(null);
      await meetingsApi.delete(deleteId);
      localStorage.setItem('mock_meetings_data', JSON.stringify(newMeetings));
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-brand-600" /> Meeting Tracker
                </h1>
                <p className="text-gray-500 mt-1 font-medium">Schedule, track status, and manage meeting notes.</p>
             </div>
             
             <button 
                onClick={handleCreate}
                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-brand-500/30 transition-all active:scale-95"
             >
                <Plus className="h-5 w-5" />
                Schedule Meeting
             </button>
           </div>

           <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden">
                
                {/* Filters Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white z-20">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                         {['All', 'Scheduled', 'Completed', 'Cancelled', 'Postponed'].map((status) => (
                             <button
                                key={status}
                                onClick={() => setActiveFilter(status as any)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                    activeFilter === status 
                                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                             >
                                 {status === 'All' ? 'All Meetings' : status}
                             </button>
                         ))}
                    </div>

                    <div className="w-full md:w-64 relative">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by title..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
                        </div>
                    ) : (
                        <MeetingTable 
                            data={filteredMeetings} 
                            onEdit={handleEdit} 
                            onDelete={(id) => setDeleteId(id)} 
                        />
                    )}
                </div>

                <div className="p-3 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between">
                    <span>{filteredMeetings.length} records found</span>
                    <span>Sorted by Date (Newest)</span>
                </div>
           </div>
        </main>
      </div>

      <MeetingForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingMeeting}
      />

      <DeleteConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Meeting"
        message="Are you sure you want to delete this meeting record?"
      />
    </div>
  );
};
