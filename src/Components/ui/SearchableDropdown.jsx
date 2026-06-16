import React, { useState, useEffect, useRef } from 'react';

const SearchableDropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option...',
  label = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Synchronize searchQuery with current selected value's name
  useEffect(() => {
    const selectedOpt = options.find(opt => opt.id.toString() === value?.toString());
    if (selectedOpt) {
      setSearchQuery(selectedOpt.name);
    } else {
      setSearchQuery('');
    }
  }, [value, options]);

  // Click outside detection to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset query to the selected item's name if they typed but didn't select anything
        const selectedOpt = options.find(opt => opt.id.toString() === value?.toString());
        setSearchQuery(selectedOpt ? selectedOpt.name : '');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  // Filter options based on search query
  const filteredOptions = options.filter(opt =>
    opt.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.id);
    setSearchQuery(option.name);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
    
    // If user cleared the input, trigger empty selection
    if (e.target.value === '') {
      onChange('');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 select-none">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required && !value}
          className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
        />
        
        {/* Indicators */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-slate-400">
          {searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setSearchQuery('');
              }}
              className="pointer-events-auto hover:text-slate-650 cursor-pointer p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto animate-fade-in-up">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">
              No matches found
            </div>
          ) : (
            <div className="py-1.5">
              {filteredOptions.slice(0, 10).map((option) => {
                const isSelected = option.id.toString() === value?.toString();
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-4 py-2 text-[12.5px] font-semibold transition-colors flex items-center justify-between border-none cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50 text-[#704efe] font-bold' 
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{option.name}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
              {filteredOptions.length > 10 && (
                <div className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center border-t border-slate-50 bg-slate-50/50">
                  + {filteredOptions.length - 10} more matches
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
