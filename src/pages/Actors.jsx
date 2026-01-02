import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';

// Professional Icon Components
const StarIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const FireIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
  </svg>
);

const FilmIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
  </svg>
);

const FemaleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="5" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13v8M9 18h6" />
  </svg>
);

const MaleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="10" cy="14" r="5" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 5l-5.4 5.4M19 5h-5M19 5v5" />
  </svg>
);

const TrendingIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AwardIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default function Actors() {
  const [actors, setActors] = useState([]);
  const [featuredActors, setFeaturedActors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeTab, setActiveTab] = useState('popular');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const { t } = useLanguage();
  const featuredRef = useRef(null);

  useEffect(() => {
    fetchActorsByTab(activeTab);
    fetchFeaturedActors();
  }, [activeTab]);

  useEffect(() => {
    if (isSearchMode) return;

    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;

      // Trigger load more when near bottom
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        loadMoreActors();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, isSearchMode]);

  const fetchFeaturedActors = async () => {
    try {
      const data = await tmdbService.getTrendingActors(1);
      const filtered = (data.results || [])
        .filter(actor => actor.profile_path && actor.popularity > 50)
        .slice(0, 5);
      setFeaturedActors(filtered);
    } catch (error) {
      console.error('Error fetching featured actors:', error);
    }
  };

  const fetchActorsByTab = async (tab = 'popular', pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      let data;
      
      switch (tab) {
        case 'trending':
          data = await tmdbService.getTrendingActors(pageNum);
          break;
        case 'latest':
          data = await tmdbService.getActorsFromLatestMovies(pageNum);
          break;
        case 'female':
          data = await tmdbService.getActorsByGender(1, pageNum);
          break;
        case 'male':
          data = await tmdbService.getActorsByGender(2, pageNum);
          break;
        case 'rising':
          // Get actors with medium popularity (rising stars)
          data = await tmdbService.getPopularActors(pageNum);
          if (data.results) {
            data.results = data.results.filter(a => a.popularity > 10 && a.popularity < 50);
          }
          break;
        default:
          data = await tmdbService.getPopularActors(pageNum);
      }
      
      const filteredResults = (data.results || []).filter(actor => 
        actor.profile_path && actor.name && actor.known_for_department
      );
      
      if (pageNum === 1) {
        setActors(filteredResults);
        setPage(1);
      } else {
        setActors(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newActors = filteredResults.filter(a => !existingIds.has(a.id));
          return [...prev, ...newActors];
        });
        setPage(pageNum);
      }
      
      setHasMore(pageNum < (data.total_pages || 1) && filteredResults.length > 0);
      setIsSearchMode(false);
    } catch (error) {
      console.error('Error fetching actors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreActors = async () => {
    if (loadingMore || !hasMore || isSearchMode) return;

    setLoadingMore(true);
    try {
      await fetchActorsByTab(activeTab, page + 1);
    } catch (error) {
      console.error('Error loading more actors:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setActiveTab('popular');
      setIsSearchMode(false);
      return;
    }

    setSearching(true);
    setIsSearchMode(true);
    setHasMore(false);
    try {
      const data = await tmdbService.searchActors(searchQuery);
      setActors((data.results || []).filter(actor => actor.profile_path));
    } catch (error) {
      console.error('Error searching actors:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setIsSearchMode(false);
  };

  const scrollFeatured = (direction) => {
    if (featuredRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      featuredRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const tabs = [
    { id: 'popular', label: 'Popular', icon: StarIcon, color: 'yellow' },
    { id: 'trending', label: 'Trending Now', icon: TrendingIcon, color: 'red' },
    { id: 'latest', label: 'Latest Movies', icon: FilmIcon, color: 'blue' },
    { id: 'rising', label: 'Rising Stars', icon: AwardIcon, color: 'purple' },
    { id: 'female', label: 'Actresses', icon: FemaleIcon, color: 'pink' },
    { id: 'male', label: 'Actors', icon: MaleIcon, color: 'cyan' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400 text-xl font-semibold">Discovering Talent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      {/* Hero Section with Featured Actors */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/20 via-stone-950/80 to-stone-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"></div>
        
        <div className="relative container mx-auto px-4 pt-8 pb-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-400 p-2 rounded-lg">
                  <StarIcon className="w-6 h-6 text-stone-900" />
                </div>
                <span className="text-yellow-400 font-semibold uppercase tracking-wider text-sm">Discover</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-3">
                {isSearchMode ? 'Search Results' : 
                 activeTab === 'trending' ? 'Trending Now' :
                 activeTab === 'latest' ? 'Latest Stars' :
                 activeTab === 'rising' ? 'Rising Stars' :
                 activeTab === 'female' ? 'Top Actresses' :
                 activeTab === 'male' ? 'Top Actors' : 'Popular Actors'}
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                {isSearchMode ? `Found ${actors.length} results for "${searchQuery}"` :
                 activeTab === 'trending' ? 'The most talked-about performers this week' :
                 activeTab === 'latest' ? 'Stars from current blockbuster releases' :
                 activeTab === 'rising' ? 'Tomorrow\'s A-list talent breaking through today' :
                 activeTab === 'female' ? 'Celebrate outstanding female performers' :
                 activeTab === 'male' ? 'Discover acclaimed male actors' : 
                 'Explore the world\'s most beloved performers'}
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative flex items-center">
                <svg className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search actors..."
                  className="w-full md:w-80 pl-12 pr-24 py-3 rounded-xl bg-stone-800/80 backdrop-blur text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-stone-700"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-2 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold px-4 py-1.5 rounded-lg transition text-sm"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </div>
            </form>
          </div>

          {/* Featured Actors Carousel */}
          {!isSearchMode && featuredActors.length > 0 && activeTab === 'popular' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FireIcon className="w-5 h-5 text-orange-400" />
                  Featured This Week
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollFeatured('left')}
                    className="p-2 bg-stone-800 hover:bg-stone-700 rounded-full transition"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollFeatured('right')}
                    className="p-2 bg-stone-800 hover:bg-stone-700 rounded-full transition"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                ref={featuredRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
              >
                {featuredActors.map((actor, index) => (
                  <Link
                    key={actor.id}
                    to={`/actor/${actor.id}`}
                    className="flex-shrink-0 w-64 group"
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10">
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-yellow-400 text-stone-900 text-xs font-bold px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      <img
                        src={tmdbService.getImageUrl(actor.profile_path, 'w500')}
                        alt={actor.name}
                        className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-yellow-400 transition">
                          {actor.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm flex items-center gap-1">
                            <TrendingIcon className="w-3 h-3" />
                            {Math.round(actor.popularity)}
                          </span>
                          <span className="text-gray-400 text-sm">• {actor.known_for_department}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          {!isSearchMode && (
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-yellow-400 text-stone-900 shadow-lg shadow-yellow-400/25'
                        : 'bg-stone-800/80 text-gray-300 hover:bg-stone-700 hover:text-white border border-stone-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* View Mode Toggle & Results Count */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between border-b border-stone-800">
        <p className="text-gray-400">
          {isSearchMode ? `${actors.length} results` : `Showing ${actors.length} ${activeTab === 'female' ? 'actresses' : activeTab === 'male' ? 'actors' : 'people'}`}
        </p>
        <div className="flex items-center gap-2 bg-stone-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition ${viewMode === 'grid' ? 'bg-yellow-400 text-stone-900' : 'text-gray-400 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition ${viewMode === 'list' ? 'bg-yellow-400 text-stone-900' : 'text-gray-400 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Actors Grid/List */}
      <section className="container mx-auto px-4 py-8">
        {actors.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Actors Found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or explore different categories</p>
            <button
              onClick={() => handleTabChange('popular')}
              className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold px-6 py-3 rounded-xl transition"
            >
              Browse Popular Actors
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {actors.map((actor, index) => (
              <Link
                key={`${actor.id}-${index}`}
                to={`/actor/${actor.id}`}
                className="group"
              >
                <div className="relative bg-stone-900 rounded-xl overflow-hidden border border-stone-800 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/5 hover:-translate-y-1">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={tmdbService.getImageUrl(actor.profile_path, 'w500')}
                      alt={actor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Popularity Badge */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingIcon className="w-3 h-3" />
                      {Math.round(actor.popularity)}
                    </div>

                    {/* Gender Indicator */}
                    <div className="absolute top-2 left-2">
                      {actor.gender === 1 ? (
                        <span className="bg-pink-500/80 backdrop-blur-sm p-1.5 rounded-full inline-block">
                          <FemaleIcon className="w-3 h-3 text-white" />
                        </span>
                      ) : actor.gender === 2 ? (
                        <span className="bg-blue-500/80 backdrop-blur-sm p-1.5 rounded-full inline-block">
                          <MaleIcon className="w-3 h-3 text-white" />
                        </span>
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm group-hover:text-yellow-400 transition line-clamp-1">
                      {actor.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {actor.known_for_department}
                    </p>
                    {actor.known_for && actor.known_for.length > 0 && (
                      <p className="text-gray-600 text-xs mt-2 line-clamp-1">
                        {actor.known_for.map(m => m.title || m.name).slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {actors.map((actor, index) => (
              <Link
                key={`${actor.id}-${index}`}
                to={`/actor/${actor.id}`}
                className="flex gap-4 bg-stone-900 rounded-xl p-4 border border-stone-800 hover:border-yellow-400/50 transition-all group"
              >
                <img
                  src={tmdbService.getImageUrl(actor.profile_path, 'w185')}
                  alt={actor.name}
                  className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-white font-bold text-lg group-hover:text-yellow-400 transition">
                        {actor.name}
                      </h3>
                      <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                        {actor.gender === 1 ? (
                          <><FemaleIcon className="w-4 h-4 text-pink-400" /> Actress</>
                        ) : actor.gender === 2 ? (
                          <><MaleIcon className="w-4 h-4 text-blue-400" /> Actor</>
                        ) : actor.known_for_department}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                      <TrendingIcon className="w-4 h-4" />
                      {Math.round(actor.popularity)}
                    </div>
                  </div>
                  {actor.known_for && actor.known_for.length > 0 && (
                    <div className="mt-3">
                      <p className="text-gray-500 text-xs mb-1">Known For:</p>
                      <p className="text-gray-300 text-sm">
                        {actor.known_for.map(m => m.title || m.name).slice(0, 3).join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && !isSearchMode && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
            <span className="text-yellow-400 font-semibold">Loading more talent...</span>
          </div>
        )}

        {/* Load More Button - fallback for infinite scroll */}
        {hasMore && !loadingMore && !isSearchMode && actors.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMoreActors}
              className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold px-8 py-3 rounded-xl transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Load More {activeTab === 'female' ? 'Actresses' : activeTab === 'male' ? 'Actors' : 'People'}
            </button>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && actors.length > 0 && !isSearchMode && (
          <div className="flex flex-col items-center mt-12 py-8 border-t border-stone-800">
            <svg className="w-12 h-12 text-yellow-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="text-gray-400 text-lg">
              You've explored all {actors.length} {activeTab === 'female' ? 'actresses' : activeTab === 'male' ? 'actors' : 'performers'}!
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-4 text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Back to Top
            </button>
          </div>
        )}
      </section>
      
      <Footer />
    </div>
  );
}
