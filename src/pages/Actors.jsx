import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';

export default function Actors() {
  const [actors, setActors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeTab, setActiveTab] = useState('popular'); // popular, trending, latest, female, male
  const { t } = useLanguage();

  useEffect(() => {
    fetchActorsByTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (isSearchMode) return; // Don't use infinite scroll in search mode

    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMoreActors();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page, isSearchMode, activeTab]);

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
        setActors(prev => [...prev, ...filteredResults]);
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

  const fetchPopularActors = async () => {
    try {
      const data = await tmdbService.getPopularActors(1);
      setActors((data.results || []).filter(actor => actor.profile_path));
      setPage(1);
      setHasMore(true);
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
      const nextPage = page + 1;
      
      // Use the same tab method for loading more
      await fetchActorsByTab(activeTab, nextPage);
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
      return;
    }

    setSearching(true);
    setIsSearchMode(true);
    setHasMore(false); // Disable infinite scroll for search results
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

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading actors...</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-stone-900 to-stone-800 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {isSearchMode ? 'Search Results' : 
             activeTab === 'trending' ? 'Trending Actors' :
             activeTab === 'latest' ? 'Latest Movie Stars' :
             activeTab === 'female' ? 'Female Actors' :
             activeTab === 'male' ? 'Male Actors' : 'Popular Actors'}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {isSearchMode ? `Results for "${searchQuery}"` :
             activeTab === 'trending' ? 'Discover what actors are trending right now' :
             activeTab === 'latest' ? 'Stars from the latest blockbuster movies' :
             activeTab === 'female' ? 'Talented female performers in cinema' :
             activeTab === 'male' ? 'Accomplished male actors and performers' :
             'Discover talented actors and their filmography'}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for actors..."
                className="flex-1 p-3 rounded-lg bg-stone-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold px-8 py-3 rounded-lg transition"
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Actor Category Tabs */}
          {!isSearchMode && (
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleTabChange('popular')}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  activeTab === 'popular'
                    ? 'bg-yellow-400 text-stone-900'
                    : 'bg-stone-800 text-white hover:bg-stone-700'
                }`}
              >
                🌟 Popular
              </button>
              <button
                onClick={() => handleTabChange('trending')}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  activeTab === 'trending'
                    ? 'bg-yellow-400 text-stone-900'
                    : 'bg-stone-800 text-white hover:bg-stone-700'
                }`}
              >
                🔥 Trending
              </button>
              <button
                onClick={() => handleTabChange('latest')}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  activeTab === 'latest'
                    ? 'bg-yellow-400 text-stone-900'
                    : 'bg-stone-800 text-white hover:bg-stone-700'
                }`}
              >
                🎬 Latest Movies
              </button>
              <button
                onClick={() => handleTabChange('female')}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  activeTab === 'female'
                    ? 'bg-yellow-400 text-stone-900'
                    : 'bg-stone-800 text-white hover:bg-stone-700'
                }`}
              >
                👩 Female Actors
              </button>
              <button
                onClick={() => handleTabChange('male')}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  activeTab === 'male'
                    ? 'bg-yellow-400 text-stone-900'
                    : 'bg-stone-800 text-white hover:bg-stone-700'
                }`}
              >
                👨 Male Actors
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Actors Grid */}
      <section className="container mx-auto px-4 py-12">
        {actors.length === 0 ? (
          <div className="text-center text-gray-400 text-xl py-12">
            No actors found. Try a different search.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {actors.map((actor) => (
              <Link
                key={actor.id}
                to={`/actor/${actor.id}`}
                className="group"
              >
                <div className="bg-stone-800 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                  <img
                    src={tmdbService.getImageUrl(actor.profile_path, 'w500')}
                    alt={actor.name}
                    className="w-full h-80 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x750?text=No+Photo';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg group-hover:text-yellow-400 transition">
                      {actor.name}
                    </h3>
                    {actor.known_for_department && (
                      <p className="text-gray-400 text-sm mt-1">
                        {actor.known_for_department}
                      </p>
                    )}
                    {/* Show popularity score */}
                    {actor.popularity && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-400 text-xs">⭐</span>
                        <span className="text-gray-300 text-xs ml-1">
                          {Math.round(actor.popularity)} popularity
                        </span>
                      </div>
                    )}
                    {/* Show gender indicator */}
                    {actor.gender && (
                      <div className="text-xs text-gray-500 mt-1">
                        {actor.gender === 1 ? '👩' : actor.gender === 2 ? '👨' : '👤'}
                      </div>
                    )}
                    {actor.known_for && actor.known_for.length > 0 && (
                      <p className="text-gray-500 text-xs mt-2 line-clamp-2">
                        Known for: {actor.known_for.map(m => m.title || m.name).slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && !isSearchMode && (
          <div className="flex justify-center mt-8">
            <div className="text-yellow-400 text-xl font-semibold">Loading more actors...</div>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && actors.length > 0 && !isSearchMode && (
          <div className="flex justify-center mt-8">
            <div className="text-gray-400 text-lg">
              {activeTab === 'trending' ? "You've seen all trending actors! 🔥" :
               activeTab === 'latest' ? "You've seen all latest movie stars! 🎬" :
               activeTab === 'female' ? "You've seen all female actors! 👩" :
               activeTab === 'male' ? "You've seen all male actors! 👨" :
               "You've seen all popular actors! ⭐"}
            </div>
          </div>
        )}
        
        {/* Show total count */}
        {actors.length > 0 && (
          <div className="flex justify-center mt-4">
            <div className="text-gray-500 text-sm">
              Showing {actors.length} actors
            </div>
          </div>
        )}
      </section>
      
      <Footer />
    </div>
  );
}
