import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { tmdbService } from '../services/tmdb';
import Footer from '../components/Footer';

export default function FanFavourites() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFanFavourites = async () => {
      try {
        // Fetch first 5 pages to get 100 movies (20 per page)
        // Using popular movies as fan favourites
        const requests = [1, 2, 3, 4, 5].map(page => 
          tmdbService.getPopularMovies(page)
        );
        const results = await Promise.all(requests);
        const allMovies = results.flatMap(data => data.results || []);
        setMovies(allMovies.slice(0, 100));
      } catch (error) {
        console.error('Error fetching fan favourite movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFanFavourites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading fan favourites...</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Fan Favourites</h1>
          <p className="text-gray-400 text-lg">The most beloved movies by audiences worldwide</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {movies.map((movie, index) => (
            <div key={movie.id} className="relative">
              <div className="absolute top-2 left-2 bg-yellow-400 text-black font-bold text-lg px-2 py-1 rounded z-10">
                #{index + 1}
              </div>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
