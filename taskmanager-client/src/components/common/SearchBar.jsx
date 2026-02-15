import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '../../utils/helpers';

const SearchBar = ({ placeholder = 'Search...', onSearch, className = '', value: controlledValue }) => {
  const [value, setValue] = useState(controlledValue || '');

  const debouncedSearch = useCallback(
    debounce((query) => {
      onSearch?.(query);
    }, 300),
    [onSearch]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    debouncedSearch(val);
  };

  const handleClear = () => {
    setValue('');
    onSearch?.('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-10 pl-11 pr-10 text-sm text-slate-700 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 focus:bg-white transition-all"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
