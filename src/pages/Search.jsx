import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';
import TVShowCard from '../components/TVShowCard';
import Footer from '../components/Footer';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const category = searchParams.get('category') || 'all';
  const [movies, setMovies] = useState([]);
  const [tvShows, setTVShows] = useState([]);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { t } = useLanguage();

  useEffect(() => {
    if (query) {
      searchAll();
    }
  }, [query, category]);

  const searchAll = async () => {
    try {
      setLoading(true);
      
      // Search based on category
      if (category === 'titles') {
        const [moviesData, tvData] = await Promise.all([
          tmdbService.searchMovies(query),
          tmdbService.searchTVShows(query)
        ]);
        setMovies((moviesData.results || []).filter(movie => movie.poster_path));
        setTVShows((tvData.results || []).filter(show => show.poster_path));
        setActors([]);
      } else if (category === 'celebs') {
        const actorsData = await tmdbService.searchActors(query);
        setActors((actorsData.results || []).filter(actor => actor.profile_path));
        setMovies([]);
        setTVShows([]);
      } else if (category === 'keywords') {
        const [moviesData, tvData] = await Promise.all([
          tmdbService.searchMovies(query),
          tmdbService.searchTVShows(query)
        ]);
        setMovies((moviesData.results || []).filter(movie => movie.poster_path));
        setTVShows((tvData.results || []).filter(show => show.poster_path));
        setActors([]);
      } else {
        // Search all
        const [moviesData, tvData, actorsData] = await Promise.all([
          tmdbService.searchMovies(query),
          tmdbService.searchTVShows(query),
          tmdbService.searchActors(query)
        ]);
        setMovies((moviesData.results || []).filter(movie => movie.poster_path));
        setTVShows((tvData.results || []).filter(show => show.poster_path));
        setActors((actorsData.results || []).filter(actor => actor.profile_path));
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-white text-xl">Searching...</div>
      </div>
    );
  }

  const totalResults = movies.length + tvShows.length + actors.length;

  return (
    <div className="min-h-screen bg-stone-950 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Search results for: <span className="text-yellow-400">"{query}"</span>
          </h1>
          <p className="text-gray-400">
            {category !== 'all' && <span className="text-yellow-400 capitalize">{category}</span>}
            {category !== 'all' && ' - '}
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-stone-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'movies'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('tvshows')}
            className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'tvshows'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TV Shows ({tvShows.length})
          </button>
          <button
            onClick={() => setActiveTab('actors')}
            className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'actors'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Actors ({actors.length})
          </button>
        </div>

        {/* Results */}
        {totalResults === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-xl mb-4">No results found</div>
            <p className="text-gray-500">Try searching with different keywords</p>
          </div>
        ) : (
          <>
            {/* Movies Section */}
            {(activeTab === 'all' || activeTab === 'movies') && movies.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                  </svg>
                  Movies
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}

            {/* TV Shows Section */}
            {(activeTab === 'all' || activeTab === 'tvshows') && tvShows.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
                  </svg>
                  TV Shows
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {tvShows.map((show) => (
                    <TVShowCard key={show.id} show={show} />
                  ))}
                </div>
              </div>
            )}

            {/* Actors Section */}
            {(activeTab === 'all' || activeTab === 'actors') && actors.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Actors
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {actors.map((actor) => (
                    <Link
                      key={actor.id}
                      to={`/actor/${actor.id}`}
                      className="group"
                    >
                      <div className="bg-stone-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-400 transition-all">
                        {actor.profile_path ? (
                          <img
                            src={tmdbService.getImageUrl(actor.profile_path)}
                            alt={actor.name}
                            className="w-full aspect-[2/3] object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-stone-700 flex items-center justify-center">
                            <svg className="w-20 h-20 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
                            {actor.name}
                          </h3>
                          {actor.known_for_department && (
                            <p className="text-sm text-gray-400 mt-1">
                              {actor.known_for_department}
                            </p>
                          )}
                          {actor.known_for && actor.known_for.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {actor.known_for.map(item => item.title || item.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
