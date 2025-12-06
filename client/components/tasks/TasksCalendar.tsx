
import React, { useState } from 'react';
import { Task } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTaskStatusStyles } from '../../utils';

interface TasksCalendarProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export const TasksCalendar: React.FC<TasksCalendarProps> = ({ tasks, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const renderCells = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const cells = [];

        // Empty cells
        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="bg-gray-50/30 border-b border-r border-gray-100 min-h-[100px]" />);
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            cells.push(
                <div key={day} className={`border-b border-r border-gray-100 min-h-[100px] p-2 hover:bg-gray-50 transition-colors group ${isToday ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-gray-500'}`}>
                            {day}
                        </span>
                    </div>
                    <div className="space-y-1">
                        {dayTasks.slice(0, 3).map(task => (
                            <button 
                                key={task.id} 
                                type="button"
                                onClick={() => onEdit(task)}
                                className={`w-full text-left px-1.5 py-1 rounded text-[10px] font-medium truncate border ${getTaskStatusStyles(task.status)} bg-opacity-50 hover:opacity-80 transition-opacity`}
                            >
                                {task.title}
                            </button>
                        ))}
                        {dayTasks.length > 3 && (
                            <button type="button" className="text-[10px] text-gray-400 font-medium hover:text-brand-600 pl-1">
                                +{dayTasks.length - 3} more
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="bg-white rounded-2xl h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-bold text-lg text-gray-800">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-1">
                    <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronLeft className="h-5 w-5" /></button>
                    <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronRight className="h-5 w-5" /></button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 border-b border-gray-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {d}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 flex-1 auto-rows-fr border-l border-t border-gray-100">
                {renderCells()}
            </div>
        </div>
    );
};
