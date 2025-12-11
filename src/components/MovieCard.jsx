import { Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';

export default function MovieCard({ movie }) {
  const imageUrl = tmdbService.getImageUrl(movie.poster_path);
  const rating = movie.vote_average?.toFixed(1) || 'N/A';

  return (
    <div className="bg-stone-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all duration-300 group">
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
          <button className="text-gray-400 hover:text-yellow-400 transition-all duration-200 hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>
  );
}
