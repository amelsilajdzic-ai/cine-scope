import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { tmdbService } from '../services/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [upcomingContent, setUpcomingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trending, popular1, popular2, upcomingMovies, upcomingTV] = await Promise.all([
          tmdbService.getTrendingMovies(),
          tmdbService.getPopularMovies(1),
          tmdbService.getPopularMovies(2),
          tmdbService.getUpcomingMovies(1),
          tmdbService.getUpcomingTVShows(1),
        ]);
        setTrendingMovies(trending.results?.slice(0, 6) || []);
        // Combine first 2 pages to get 40 movies (20 per page)
        const allPopular = [...(popular1.results || []), ...(popular2.results || [])];
        setPopularMovies(allPopular);
        
        // Combine upcoming movies and TV shows, add type field
        const moviesWithType = (upcomingMovies.results || []).slice(0, 10).map(item => ({ ...item, mediaType: 'movie', displayTitle: item.title, displayDate: item.release_date }));
        const tvWithType = (upcomingTV.results || []).slice(0, 10).map(item => ({ ...item, mediaType: 'tv', displayTitle: item.name, displayDate: item.first_air_date }));
        const combined = [...moviesWithType, ...tvWithType]
          .sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate))
          .slice(0, 12);
        setUpcomingContent(combined);
        
        // Set specific featured trailers
        setTrailers([
          {
            id: 'breaking-bad',
            title: 'Breaking Bad',
            trailerKey: 'HhesaQXLuRY',
            vote_average: 9.5,
            release_date: '2008-01-20',
            type: 'TV Show'
          },
          {
            id: 'game-of-thrones',
            title: 'Game of Thrones',
            trailerKey: 'KPLWWIOCOOQ',
            vote_average: 9.2,
            release_date: '2011-04-17',
            type: 'TV Show'
          },
          {
            id: 'interstellar',
            title: 'Interstellar',
            trailerKey: 'zSWdZVtXT7E',
            vote_average: 8.6,
            release_date: '2014-11-07',
            type: 'Movie'
          }
        ]);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading movies...</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-stone-900 to-stone-800 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {t('welcomeTitle')}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {t('welcomeSubtitle')}
          </p>
        </div>
      </section>

      {/* Featured Trailers */}
      {trailers.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Featured Trailers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trailers.map((movie) => (
              <div key={movie.id} className="bg-stone-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${movie.trailerKey}?rel=0`}
                    title={movie.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2">{movie.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Movies & TV Shows */}
      {upcomingContent.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            Coming Soon
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {upcomingContent.map((item) => (
              <div key={`${item.mediaType}-${item.id}`} className="bg-stone-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all duration-300 group">
                <Link to={item.mediaType === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`}>
                  <div className="relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.displayTitle}
                      className="w-full h-96 object-cover group-hover:brightness-110 transition-all duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-yellow-400 text-stone-900 px-2 py-1 rounded text-xs font-bold uppercase">
                      {item.mediaType === 'movie' ? '🎬 Movie' : '📺 TV'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm hover:text-yellow-400 line-clamp-2 mb-2">
                      {item.displayTitle}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {item.displayDate ? new Date(item.displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Movies */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10h-2v3H8v2h3v3h2v-3h3v-2h-3v-3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          {t('trendingThisWeek')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Popular Movies */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {t('popularMovies')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
