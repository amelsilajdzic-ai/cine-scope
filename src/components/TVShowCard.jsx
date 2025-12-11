import { Link } from 'react-router-dom';

export default function TVShowCard({ show }) {
  return (
    <Link to={`/tv/${show.id}`} className="group">
      <div className="bg-stone-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-400 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all duration-300">
        <div className="relative">
          <img
            src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
            alt={show.name}
            className="w-full aspect-[2/3] object-cover group-hover:brightness-110 transition-all duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster';
            }}
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded">
            <span className="text-yellow-400 font-bold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {show.vote_average.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-white font-semibold group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1">
            {show.name}
          </h3>
          <p className="text-gray-400 text-sm">
            {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
          </p>
        </div>
      </div>
    </Link>
  );
}
