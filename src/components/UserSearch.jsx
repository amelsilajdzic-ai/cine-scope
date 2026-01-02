import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { socialService } from '../services/supabase';

export default function UserSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await socialService.searchUsers(query);
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-stone-800 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-stone-800 rounded-lg shadow-xl border border-stone-700 max-h-80 overflow-y-auto z-50">
          {results.map((user) => (
            <Link
              key={user.id}
              to={`/user/${user.id}`}
              onClick={() => {
                setShowResults(false);
                setQuery('');
                if (onClose) onClose();
              }}
              className="flex items-center gap-3 p-3 hover:bg-stone-700 transition"
            >
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-stone-900">
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{user.username || 'User'}</p>
                <p className="text-gray-400 text-sm">View profile</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-stone-800 rounded-lg shadow-xl border border-stone-700 p-4 text-center z-50">
          <p className="text-gray-400">No users found</p>
        </div>
      )}
    </div>
  );
}
