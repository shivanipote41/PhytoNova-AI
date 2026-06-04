import { useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { categories } from '../../data/products';

export default function SearchFilter({ onSearch, onCategoryChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setShowDropdown(false);
    onCategoryChange(cat);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-sm" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-md bg-white/8 border border-white/10 text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all text-sm"
        />
      </div>

      {/* Category dropdown */}
      <div className="relative min-w-[180px]">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-md bg-white/8 border border-white/10 text-text-primary hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
        >
          <span className="flex items-center gap-2">
            <FaFilter className="text-xs text-text-secondary" />
            {selectedCategory}
          </span>
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
            <div className="absolute top-full left-0 right-0 mt-2 z-20 py-1 rounded-md bg-slate-800 border border-white/10 shadow-xl overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}