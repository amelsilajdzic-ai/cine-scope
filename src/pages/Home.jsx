import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { tmdbService } from '../services/tmdb';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trending, popular] = await Promise.all([
          tmdbService.getTrendingMovies(),
          tmdbService.getPopularMovies(),
        ]);
        setTrendingMovies(trending.results?.slice(0, 6) || []);
        setPopularMovies(popular.results?.slice(0, 12) || []);
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
            Welcome to Cine Scope
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Discover movies, TV shows, and more
          </p>
        </div>
      </section>

      {/* Trending Movies */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10h-2v3H8v2h3v3h2v-3h3v-2h-3v-3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          Trending This Week
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
          Popular Movies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-gray-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Cine Scope. Movie data provided by TMDB.</p>
        </div>
      </footer>
    </div>
  );
}
