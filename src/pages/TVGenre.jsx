import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import TVShowCard from '../components/TVShowCard';
import Footer from '../components/Footer';

export default function TVGenre() {
  const { genreId } = useParams();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [genreName, setGenreName] = useState('');

  const genreNames = {
    10759: 'Action & Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    10762: 'Kids',
    9648: 'Mystery',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
    37: 'Western'
  };

  useEffect(() => {
    setGenreName(genreNames[genreId] || 'TV Shows');
    fetchShows();
  }, [genreId]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMoreShows();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page]);

  const fetchShows = async () => {
    try {
      setLoading(true);
      const data = await tmdbService.getTVShowsByGenre(genreId, 1);
      setShows((data.results || []).filter(show => show.poster_path));
      setPage(1);
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error fetching TV shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreShows = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await tmdbService.getTVShowsByGenre(genreId, nextPage);
      
      if (data.results && data.results.length > 0) {
        const filteredResults = data.results.filter(show => show.poster_path);
        setShows(prev => [...prev, ...filteredResults]);
        setPage(nextPage);
        setHasMore(data.page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more TV shows:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading {genreName} shows...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{genreName}</h1>
          <p className="text-gray-400">Explore {genreName.toLowerCase()} TV shows</p>
        </div>

        {/* Shows Grid */}
        {shows.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {shows.map((show) => (
                <TVShowCard key={show.id} show={show} />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="text-center mt-8">
                <div className="text-yellow-400 text-xl">Loading more shows...</div>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && shows.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-gray-400">You've reached the end of {genreName.toLowerCase()} shows</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">No {genreName.toLowerCase()} shows found</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
