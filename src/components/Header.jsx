import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../i18n/translations';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const searchDropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCategories = [
    { 
      id: 'all', 
      label: 'All', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
    },
    { 
      id: 'titles', 
      label: 'Titles', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
    },
    { 
      id: 'celebs', 
      label: 'Celebs', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
    },
    { 
      id: 'keywords', 
      label: 'Keywords', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=${searchCategory}`);
      setSearchQuery('');
      setIsSearchDropdownOpen(false);
    }
  };

  const getCategoryLabel = () => {
    return searchCategories.find(cat => cat.id === searchCategory)?.label || 'All';
  };

  return (
    <>
      <header className="bg-stone-900 text-white p-2 md:p-0">
        <div className="container mx-auto flex items-center h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center bg-yellow-400 hover:bg-yellow-500 rounded shadow-lg h-10 px-4 mr-3 transition-all duration-200 group"
          >
            <svg className="w-7 h-7 text-stone-900" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
            </svg>
            <span className="ml-2 font-bold text-lg text-stone-900 tracking-tight">CineScope</span>
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
              <span className="font-medium text-sm hidden sm:inline">{t('menu')}</span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="grow max-w-3xl flex items-stretch bg-white rounded overflow-visible relative z-10">
            <div className="relative" ref={searchDropdownRef}>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSearchDropdownOpen(!isSearchDropdownOpen);
                }}
                className="flex items-center gap-1 px-3 h-full text-gray-900 border-r border-gray-300 text-sm hover:bg-gray-50 cursor-pointer"
              >
                <span className="pointer-events-none">{getCategoryLabel()}</span>
                <svg className="w-4 h-4 fill-current pointer-events-none" viewBox="0 0 20 20">
                  <path d="M10 12l-6-6h12z" />
                </svg>
              </button>
              
              {/* Search Category Dropdown */}
              {isSearchDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-stone-800/90 backdrop-blur-md rounded-lg shadow-xl py-2 min-w-[200px] z-[100] border border-stone-700 animate-slideDown">
                  {searchCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSearchCategory(category.id);
                        setIsSearchDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-stone-700 flex items-center gap-3 cursor-pointer ${
                        searchCategory === category.id ? 'text-yellow-400' : 'text-white'
                      }`}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="grow p-2 text-gray-900 focus:outline-none text-sm"
            />
            <button type="submit" className="bg-gray-200 text-gray-700 p-2 flex items-center justify-center hover:bg-gray-300">
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
            {t('watchlist')}
          </Link>

          {/* Right Side Controls - Language Selector */}
          <div className="flex items-center ml-8 relative" ref={langDropdownRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLangMenuOpen(!isLangMenuOpen);
              }}
              className="flex items-center text-white hover:text-yellow-400 focus:outline-none text-sm h-full px-4 border-l border-stone-700"
            >
              <span>{language.toUpperCase()}</span>
              <svg className="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 20 20">
                <path d="M10 12l-6-6h12z" />
              </svg>
            </button>
            
            {/* Language Dropdown */}
            {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-stone-800/95 backdrop-blur-lg rounded-lg shadow-xl py-2 min-w-[200px] z-[100] border border-stone-700 animate-slideDown">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-stone-700 flex items-center gap-2 ${
                      language === lang.code ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div className="fixed top-14 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-stone-800/95 backdrop-blur-lg text-white max-w-1200px mx-auto p-8 rounded-b-lg border-b border-x border-stone-700 animate-slideDown" onClick={(e) => e.stopPropagation()}>
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
                  <Link to="/" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Popular movies</Link>
                  <Link to="/top-rated" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Top rated movies</Link>
                  <Link to="/fan-favourites" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Fan favourites</Link>
                  <Link to="/genres" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Browse by genre</Link>
                </div>
              </div>

              {/* TV Shows Section */}
              <div>
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-yellow-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
                  </svg>
                  TV Shows
                </h3>
                <div className="flex flex-col gap-2">
                  <Link to="/tv-shows" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Popular TV shows</Link>
                  <Link to="/tv-top-rated" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Top rated TV shows</Link>
                  <Link to="/fan-favourites" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Fan favourites</Link>
                  <Link to="/tv-genres" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Browse by genre</Link>
                </div>
              </div>

              {/* Actors Section */}
              <div>
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-yellow-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Actors
                </h3>
                <div className="flex flex-col gap-2">
                  <Link to="/actors" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Popular actors</Link>
                  <Link to="/actors" className="text-gray-300 hover:text-yellow-400" onClick={() => setIsMenuOpen(false)}>Search actors</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
