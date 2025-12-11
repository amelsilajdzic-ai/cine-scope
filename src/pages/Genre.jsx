import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';

export default function Genre() {
  const { genreId } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [genreName, setGenreName] = useState('');
  const { t } = useLanguage();

  const genreNames = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };

  useEffect(() => {
    setGenreName(genreNames[genreId] || 'Movies');
    fetchMovies();
  }, [genreId]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

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
      const data = await tmdbService.getMoviesByGenre(genreId, 1);
      setMovies(data.results || []);
      setPage(1);
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await tmdbService.getMoviesByGenre(genreId, nextPage);
      
      if (data.results && data.results.length > 0) {
        setMovies(prev => [...prev, ...data.results]);
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
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">{genreName} Movies</h1>
          <p className="text-gray-400">Discover the best {genreName.toLowerCase()} movies</p>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg">Loading more movies...</div>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && movies.length > 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg">You've seen all {genreName.toLowerCase()} movies! 🎬</div>
          </div>
        )}

        {/* No Results */}
        {movies.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-xl">No movies found in this genre</div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
