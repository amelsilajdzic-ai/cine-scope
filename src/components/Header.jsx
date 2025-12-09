import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="bg-stone-900 text-white p-2 md:p-0">
        <div className="container mx-auto flex items-center h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center bg-yellow-400 hover:bg-yellow-300 border border-yellow-400 rounded-lg shadow-sm h-10 min-w-10 px-3 mr-2 transition-shadow duration-200"
          >
            <div className="h-6 w-6 text-gray-900">🎬</div>
          </Link>

          {/* Menu Bar */}
          <div className="flex items-center mr-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center text-white hover:text-yellow-400 focus:outline-none h-full px-2"
            >
              <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <span className="font-medium text-sm hidden sm:inline">Menu</span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="grow max-w-3xl flex items-stretch bg-white rounded overflow-hidden">
            <button type="button" className="flex items-center px-3 text-gray-900 border-r border-gray-300 text-sm">
              All
            </button>
            <input
              type="text"
              placeholder="Search Cine Scope"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="grow p-2 text-gray-900 focus:outline-none text-sm"
            />
            <button type="submit" className="bg-gray-200 text-gray-700 p-2 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </form>

          {/* Watchlist Button */}
          <Link to="/watchlist" className="items-center text-white hover:text-yellow-400 text-sm font-semibold pl-4 h-full hidden lg:flex">
            <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5-7 3.5V5z"></path>
            </svg>
            Watchlist
          </Link>

          {/* Right Side Controls */}
          <div className="flex items-center ml-auto space-x-4">
            <a href="#" className="text-gray-300 hover:text-white text-sm font-semibold hidden lg:block">
              Sign In
            </a>
            <button className="bg-yellow-400 text-gray-900 font-semibold py-1.5 px-3 rounded-md text-sm hidden lg:block hover:bg-yellow-500 transition duration-150">
              Sign Up
            </button>
            <button className="items-center text-white hover:text-yellow-400 focus:outline-none text-sm h-full pt-0 pr-2 hidden lg:flex">
              <span>EN</span>
              <svg className="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 20 20">
                <path d="M10 12l-6-6h12z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div className="fixed top-14 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-stone-800 text-white max-w-1200px mx-auto p-8 rounded-b-lg" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Movies Section */}
              <div>
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-yellow-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                  </svg>
                  Movies
                </h3>
                <div className="flex flex-col gap-2">
                  <Link to="/" className="text-gray-300 hover:text-yellow-400">Popular movies</Link>
                  <Link to="/top-rated" className="text-gray-300 hover:text-yellow-400">Top rated movies</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
