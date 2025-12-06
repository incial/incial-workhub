
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl text-sm transition-all duration-200 shadow-sm ${
          isOpen 
            ? 'border-brand-500 ring-2 ring-brand-500/20' 
            : 'border-gray-200 hover:border-brand-300'
        }`}
      >
        <span className={`truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {options.length > 0 ? (
                options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left transition-colors ${
                    option.value === value 
                        ? 'bg-brand-50 text-brand-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {option.label}
                    {option.value === value && <Check className="h-3.5 w-3.5" />}
                </button>
                ))
            ) : (
                <div className="px-3 py-2 text-xs text-gray-400 text-center">No options</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
