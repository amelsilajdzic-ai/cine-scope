import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { tmdbService } from '../services/tmdb';
import Footer from '../components/Footer';

export default function FanFavourites() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Trigger when user is 200px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMoreMovies();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await tmdbService.getPopularMovies(1);
      setMovies((data.results || []).filter(movie => movie.poster_path));
      setPage(1);
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error fetching fan favourite movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await tmdbService.getPopularMovies(nextPage);
      
      if (data.results && data.results.length > 0) {
        const filteredResults = data.results.filter(movie => movie.poster_path);
        setMovies(prev => [...prev, ...filteredResults]);
        setPage(nextPage);
        setHasMore(data.page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoadingMore(false);
    }
  };

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
            <div key={`${movie.id}-${index}`} className="relative">
              <div className="absolute top-2 left-2 bg-yellow-400 text-black font-bold text-lg px-2 py-1 rounded z-10">
                #{index + 1}
              </div>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            <p className="text-gray-400 text-lg mt-4">Loading more movies...</p>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && movies.length > 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg">You've seen all fan favourites! 🎬</div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
