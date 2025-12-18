import { useState, useEffect } from 'react';
import TVShowCard from '../components/TVShowCard';
import { tmdbService } from '../services/tmdb';
import Footer from '../components/Footer';

export default function TopRatedTVShows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Trigger when user is 200px from bottom
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
      const data = await tmdbService.getTopRatedTVShows(1);
      setShows((data.results || []).filter(show => show.poster_path));
      setPage(1);
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error fetching top rated TV shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreShows = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await tmdbService.getTopRatedTVShows(nextPage);
      
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
        <div className="text-yellow-400 text-2xl">Loading top rated TV shows...</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Top Rated TV Shows</h1>
          <p className="text-gray-400 text-lg">The highest rated TV shows of all time</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {shows.map((show, index) => (
            <div key={`${show.id}-${index}`} className="relative">
              <div className="absolute top-2 left-2 bg-yellow-400 text-black font-bold text-lg px-2 py-1 rounded z-10">
                #{index + 1}
              </div>
              <TVShowCard show={show} />
            </div>
          ))}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            <p className="text-gray-400 text-lg mt-4">Loading more shows...</p>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && shows.length > 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg">You've seen all top rated TV shows! 📺</div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
