import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { watchlistService } from '../services/supabase';
import Footer from '../components/Footer';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadWatchlist();
  }, [user, navigate]);

  const loadWatchlist = async () => {
    try {
      const data = await watchlistService.getWatchlist(user.id);
      setWatchlist(data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (movieId) => {
    try {
      await watchlistService.removeFromWatchlist(user.id, movieId);
      setWatchlist(watchlist.filter(item => item.movie_id !== movieId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading watchlist...</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-gray-400">{watchlist.length} movies saved</p>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📽️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
            <p className="text-gray-400 mb-6">Start adding movies to watch later!</p>
            <Link
              to="/"
              className="inline-block bg-yellow-400 text-stone-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {watchlist.map((item) => (
              <div key={item.id} className="bg-stone-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-all duration-300 group relative">
                <Link to={`/movie/${item.movie_id}`}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title}
                    className="w-full h-96 object-cover group-hover:brightness-110 transition-all duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                    }}
                  />
                </Link>
                <button
                  onClick={() => handleRemove(item.movie_id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove from watchlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-yellow-400">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="font-bold">{item.vote_average?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  <Link to={`/movie/${item.movie_id}`}>
                    <h3 className="text-white font-semibold text-lg hover:text-yellow-400 line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-gray-400 text-sm mt-1">
                    {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
