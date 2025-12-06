
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "Pick a date",
  label,
  className = ""
}) => {
  // Helper to parse "YYYY-MM-DD" to local Date object to avoid timezone shifts
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr); 
  };

  const [isOpen, setIsOpen] = useState(false);
  // Initialize internal view date to selected date or today
  const [viewDate, setViewDate] = useState(() => parseDate(value));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update view when value changes externally
  useEffect(() => {
      if(value) setViewDate(parseDate(value));
  }, [value]);

  // Reset view to current month (or selected value) whenever calendar opens
  useEffect(() => {
    if (isOpen) {
      setViewDate(parseDate(value));
    }
  }, [isOpen]);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format YYYY-MM-DD manually to avoid timezone issues
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange('');
  };

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(viewDate);
    const startDay = firstDayOfMonth(viewDate);
    const days = [];

    // Empty cells for padding start
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days
    for (let i = 1; i <= totalDays; i++) {
      const currentDateString = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = value === currentDateString;
      const isToday = new Date().toISOString().split('T')[0] === currentDateString;

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => handleDateClick(i)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${
            isSelected 
              ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-500/30' 
              : isToday 
                ? 'text-brand-600 font-bold bg-brand-50' 
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Fill remaining cells to ensure fixed height (6 rows * 7 cols = 42 cells)
    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) {
        days.push(<div key={`fill-${i}`} className="h-8 w-8" />);
    }

    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl text-sm cursor-pointer transition-all duration-200 shadow-sm ${
          isOpen ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-200 hover:border-brand-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
            <CalendarIcon className={`h-4 w-4 ${value ? 'text-brand-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                {value ? parseDate(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : placeholder}
            </span>
        </div>
        {value && (
            <button 
                type="button"
                onClick={clearDate}
                className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 w-[280px] animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-bold text-gray-800">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="h-8 w-8 flex items-center justify-center text-xs font-semibold text-gray-400">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
            </div>
        </div>
      )}
    </div>
  );
};
