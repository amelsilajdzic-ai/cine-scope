import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tmdbService } from '../services/tmdb';
import { watchlistService, ratingService } from '../services/supabase';

export default function MovieCard({ movie }) {
  const imageUrl = tmdbService.getImageUrl(movie.poster_path);
  const rating = movie.vote_average?.toFixed(1) || 'N/A';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (user) {
      checkWatchlist();
      loadUserRating();
    }
  }, [user, movie.id]);

  const checkWatchlist = async () => {
    try {
      const inList = await watchlistService.isInWatchlist(user.id, movie.id, 'movie');
      setIsInWatchlist(inList);
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  const loadUserRating = async () => {
    try {
      const rating = await ratingService.getUserRating(user.id, movie.id, 'movie');
      setUserRating(rating);
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  };

  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(user.id, movie.id, 'movie');
        setIsInWatchlist(false);
      } else {
        await watchlistService.addToWatchlist(user.id, movie.id, {
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
        }, 'movie');
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (e, ratingValue) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    submitRating(ratingValue);
  };

  const submitRating = async (ratingValue) => {
    try {
      await ratingService.rateItem(user.id, movie.id, ratingValue, 'movie');
      setUserRating(ratingValue);
      setShowRating(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div className="bg-stone-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all duration-300 group relative">
      <Link to={`/movie/${movie.id}`}>
        <img
          src={imageUrl}
          alt={movie.title}
          className="w-full h-96 object-cover group-hover:brightness-110 transition-all duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
          }}
        />
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-yellow-400">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="font-bold">{rating}</span>
          </div>
          <button 
            onClick={handleWatchlistClick}
            disabled={loading}
            className={`transition-all duration-200 hover:scale-110 ${
              isInWatchlist ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
            } ${loading ? 'opacity-50' : ''}`}
          >
            <svg className="w-6 h-6" fill={isInWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5-7 3.5V5z" />
            </svg>
          </button>
        </div>
        <Link to={`/movie/${movie.id}`}>
          <h3 className="text-white font-semibold text-lg hover:text-yellow-400 line-clamp-2">
            {movie.title}
          </h3>
        </Link>
        <p className="text-gray-400 text-sm mt-1">
          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
        </p>
        
        {/* User Rating */}
        <div className="mt-2 flex items-center gap-1">
          {userRating ? (
            <div className="flex items-center text-blue-400 text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>Your: {userRating}/10</span>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) {
                  navigate('/login');
                  return;
                }
                setShowRating(!showRating);
              }}
              className="text-gray-500 hover:text-blue-400 text-sm flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Rate
            </button>
          )}
        </div>
      </div>
      
      {/* Rating popup */}
      {showRating && (
        <div 
          className="absolute bottom-24 left-0 right-0 bg-stone-900 rounded-lg p-3 shadow-xl z-20 mx-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                onClick={(e) => handleRatingClick(e, star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
              >
                <svg 
                  className={`w-5 h-5 transition-colors ${
                    star <= (hoverRating || userRating || 0) 
                      ? 'text-blue-400' 
                      : 'text-gray-600'
                  }`} 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowRating(false);
            }}
            className="mt-2 text-gray-500 text-xs w-full text-center hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
