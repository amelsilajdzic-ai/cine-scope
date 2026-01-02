import { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';

export default function FilterPanel({ onFilterChange, mediaType = 'movie' }) {
  const [genres, setGenres] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    minRating: '',
    sortBy: 'popularity.desc',
  });

  useEffect(() => {
    loadGenres();
  }, [mediaType]);

  const loadGenres = async () => {
    try {
      const data = mediaType === 'tv' 
        ? await tmdbService.getTVGenres() 
        : await tmdbService.getGenres();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    const apiParams = {};
    
    if (filters.genre) {
      apiParams.with_genres = filters.genre;
    }
    
    if (filters.year) {
      if (mediaType === 'tv') {
        apiParams.first_air_date_year = filters.year;
      } else {
        apiParams.primary_release_year = filters.year;
      }
    }
    
    if (filters.minRating) {
      apiParams['vote_average.gte'] = filters.minRating;
    }
    
    if (filters.sortBy) {
      apiParams.sort_by = filters.sortBy;
    }
    
    onFilterChange(apiParams);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const defaultFilters = {
      genre: '',
      year: '',
      minRating: '',
      sortBy: 'popularity.desc',
    };
    setFilters(defaultFilters);
    onFilterChange({});
    setIsOpen(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'primary_release_date.desc', label: 'Newest First' },
    { value: 'primary_release_date.asc', label: 'Oldest First' },
  ];

  const hasActiveFilters = filters.genre || filters.year || filters.minRating || filters.sortBy !== 'popularity.desc';

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
          hasActiveFilters
            ? 'bg-yellow-400 text-stone-900'
            : 'bg-stone-800 text-white hover:bg-stone-700'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="bg-stone-900 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </button>

      {/* Filter Panel Dropdown */}
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 bg-stone-900 rounded-xl shadow-2xl border border-stone-700 p-6 min-w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Genre</label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full bg-stone-800 text-white rounded-lg px-4 py-2 border border-stone-700 focus:border-yellow-400 focus:outline-none"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full bg-stone-800 text-white rounded-lg px-4 py-2 border border-stone-700 focus:border-yellow-400 focus:outline-none"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating Filter */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Minimum Rating: {filters.minRating || '0'}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.minRating || 0}
                onChange={(e) => handleFilterChange('minRating', e.target.value === '0' ? '' : e.target.value)}
                className="w-full accent-yellow-400"
              />
              <div className="flex justify-between text-gray-500 text-xs mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full bg-stone-800 text-white rounded-lg px-4 py-2 border border-stone-700 focus:border-yellow-400 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-yellow-400 text-stone-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
