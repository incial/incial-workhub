
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, Link as LinkIcon, FileText, CheckCircle, AlignLeft, Video, Maximize2, Minimize2 } from 'lucide-react';
import { Meeting, MeetingStatus } from '../../types';

interface MeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Meeting>) => void;
  initialData?: Meeting;
}

const STATUSES: MeetingStatus[] = ['Scheduled', 'Completed', 'Cancelled', 'Postponed'];

export const MeetingForm: React.FC<MeetingFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Meeting>>({});
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        // Create Mode defaults
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Local time adj
        setFormData({
          title: '',
          dateTime: now.toISOString().slice(0, 16), // Format for datetime-local
          status: 'Scheduled',
          meetingLink: '',
          notes: ''
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <>
      {/* Expanded Notes Overlay */}
      {isNotesExpanded && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <AlignLeft className="h-5 w-5 text-gray-500" /> 
                    Meeting Notes (Editing)
                </h3>
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => setIsNotesExpanded(false)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
                    >
                        <Minimize2 className="h-4 w-4" /> Done
                    </button>
                </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
                <textarea 
                    className="w-full h-full p-4 text-base text-gray-800 bg-transparent border-none focus:ring-0 resize-none outline-none leading-relaxed"
                    placeholder="Add agenda items, action points, or summary..."
                    value={formData.notes || ''}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    autoFocus
                />
            </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all scale-100">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-600" />
                  {initialData ? 'Edit Meeting' : 'Schedule Meeting'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <X className="h-5 w-5" />
              </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar max-h-[85vh]">
              <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Title */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Meeting Title</label>
                      <input 
                          type="text" 
                          required
                          className="w-full text-lg font-semibold border-b border-gray-200 py-2 focus:border-brand-500 focus:outline-none placeholder-gray-300 transition-colors"
                          placeholder="e.g. Weekly Strategy Sync"
                          value={formData.title || ''}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Date Time */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> Date & Time
                          </label>
                          <input 
                              type="datetime-local"
                              required
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                              value={formData.dateTime || ''}
                              onChange={e => setFormData({...formData, dateTime: e.target.value})}
                          />
                      </div>

                      {/* Status */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5" /> Status
                          </label>
                          <select 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                              value={formData.status}
                              onChange={e => setFormData({...formData, status: e.target.value as MeetingStatus})}
                          >
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                      </div>
                  </div>

                  {/* Meeting Link */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                          <LinkIcon className="h-3.5 w-3.5" /> Meeting Link
                      </label>
                      <div className="relative">
                          <Video className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input 
                              type="text"
                              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-400"
                              placeholder="Zoom / Google Meet URL"
                              value={formData.meetingLink || ''}
                              onChange={e => setFormData({...formData, meetingLink: e.target.value})}
                          />
                      </div>
                  </div>

                  {/* Notes */}
                  <div>
                      <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                              <AlignLeft className="h-3.5 w-3.5" /> Notes
                          </label>
                          <button 
                              type="button" 
                              onClick={() => setIsNotesExpanded(true)}
                              className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded transition-colors"
                          >
                              <Maximize2 className="h-3 w-3" /> Expand Editor
                          </button>
                      </div>
                      <textarea 
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none h-32 resize-none"
                          placeholder="Add agenda items, action points, or summary..."
                          value={formData.notes || ''}
                          onChange={e => setFormData({...formData, notes: e.target.value})}
                      />
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                      <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                          Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-xl font-medium shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-colors">
                          <Save className="h-4 w-4" /> Save Meeting
                      </button>
                  </div>

              </form>
          </div>
        </div>
      </div>
    </>
  );
};
