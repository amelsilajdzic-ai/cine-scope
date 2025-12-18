import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { useAuth } from '../context/AuthContext';

export default function RecommendedTVShows({ currentShowId }) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [currentShowId, user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(false);
    try {
      // Get TMDB recommendations for TV shows
      const tmdbRecommendations = await tmdbService.getTVShowRecommendations(currentShowId);
      setRecommendations(tmdbRecommendations.results?.slice(0, 12) || []);
    } catch (err) {
      console.error('Error fetching TV show recommendations:', err);
      setError(true);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-white mb-6">
          Recommended For You
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
          ✨ You Might Also Like
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.filter(show => show.poster_path).map((show) => (
          <Link 
            key={show.id} 
            to={`/tv/${show.id}`}
            className="group"
          >
            <div className="bg-stone-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-400 transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={tmdbService.getImageUrl(show.poster_path)}
                  alt={show.name}
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
                    {show.vote_average?.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-white font-semibold text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors">
                  {show.name}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
