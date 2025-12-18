import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { watchlistService } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function RecommendedMovies({ currentMovieId }) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [currentMovieId, user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(false);
    try {
      let recommendedMovies = [];

      if (user) {
        // Get personalized recommendations based on watchlist
        const watchlist = await watchlistService.getWatchlist(user.id);
        
        if (watchlist.length > 0) {
          // Get genres from watchlist movies
          const watchlistMovieIds = watchlist.slice(0, 5).map(item => item.movie_id);
          const genreSet = new Set();
          
          // Fetch details for watchlist movies to get their genres
          for (const movieId of watchlistMovieIds) {
            try {
              const movieDetails = await tmdbService.getMovieDetails(movieId);
              movieDetails.genres?.forEach(genre => genreSet.add(genre.id));
            } catch (error) {
              console.error('Error fetching movie details:', error);
            }
          }

          // Convert Set to array and take top 3 genres
          const topGenres = Array.from(genreSet).slice(0, 3).join(',');
          
          // Get movies matching user's favorite genres
          if (topGenres) {
            const discovered = await tmdbService.discoverMovies({
              with_genres: topGenres,
              'vote_count.gte': 100,
              'vote_average.gte': 6.5,
            });
            
            // Filter out current movie and watchlist movies
            recommendedMovies = discovered.results
              .filter(movie => 
                movie.id !== parseInt(currentMovieId) && 
                !watchlistMovieIds.includes(movie.id)
              )
              .slice(0, 12);
          }
        }
      }

      // If no personalized recommendations or user not logged in,
      // fall back to TMDB recommendations
      if (recommendedMovies.length === 0) {
        const tmdbRecommendations = await tmdbService.getMovieRecommendations(currentMovieId);
        recommendedMovies = tmdbRecommendations.results?.slice(0, 12) || [];
      }

      setRecommendations(recommendedMovies);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to TMDB recommendations on error
      try {
        const tmdbRecommendations = await tmdbService.getMovieRecommendations(currentMovieId);
        setRecommendations(tmdbRecommendations.results?.slice(0, 12) || []);
      } catch (fallbackError) {
        console.error('Fallback recommendations failed:', fallbackError);
        setError(true);
        setRecommendations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-white mb-6">
          {user ? 'You Might Also Like' : 'Recommended For You'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-stone-800 rounded-lg animate-pulse">
              <div className="w-full h-64 bg-stone-700"></div>
              <div className="p-3">
                <div className="h-4 bg-stone-700 rounded mb-2"></div>
                <div className="h-3 bg-stone-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">
          {user ? '✨ You Might Also Like' : 'Recommended For You'}
        </h2>
        {user && (
          <span className="text-yellow-400 text-sm font-semibold">
            Based on your watchlist
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.filter(movie => movie.poster_path).map((movie) => (
          <Link 
            key={movie.id} 
            to={`/movie/${movie.id}`}
            className="group"
          >
            <div className="bg-stone-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-400 transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={tmdbService.getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                  }}
                />
                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-white text-xs font-bold">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-white font-semibold text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors">
                  {movie.title}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
