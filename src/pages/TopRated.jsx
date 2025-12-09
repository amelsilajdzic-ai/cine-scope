import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { tmdbService } from '../services/tmdb';

export default function TopRated() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const data = await tmdbService.getTopRatedMovies();
        setMovies(data.results || []);
      } catch (error) {
        console.error('Error fetching top rated movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRated();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading top rated movies...</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Top 100 Movies</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {movies.slice(0, 100).map((movie, index) => (
            <div key={movie.id} className="relative">
              <div className="absolute top-2 left-2 bg-yellow-400 text-black font-bold text-lg px-2 py-1 rounded z-10">
                #{index + 1}
              </div>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
