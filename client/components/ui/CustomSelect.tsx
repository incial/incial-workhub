
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  className = "",
  required = false,
  disabled = false
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
      {label && (
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              {label} {required && <span className="text-red-500">*</span>}
          </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-xl text-sm transition-all duration-200 outline-none ${
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' :
          isOpen 
            ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-lg' 
            : 'border-gray-200 hover:border-brand-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
            {selectedOption?.icon && <span className="flex-shrink-0 text-brand-600">{selectedOption.icon}</span>}
            <span className={`truncate font-medium ${!selectedOption ? 'text-gray-400' : 'text-gray-700'}`}>
            {selectedOption ? selectedOption.label : placeholder}
            </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-600' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top min-w-[180px]">
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
            {options.length > 0 ? (
                options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => { onChange(option.value); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left transition-all group ${
                    option.value === value 
                        ? 'bg-brand-50 text-brand-700 font-bold' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <div className="flex items-center gap-2.5 truncate">
                        {option.icon && (
                            <span className={`flex-shrink-0 ${option.value === value ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {option.icon}
                            </span>
                        )}
                        <span className="truncate">{option.label}</span>
                    </div>
                    {option.value === value && <Check className="h-4 w-4 text-brand-600 flex-shrink-0" />}
                </button>
                ))
            ) : (
                <div className="px-3 py-2 text-xs text-gray-400 text-center italic">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
