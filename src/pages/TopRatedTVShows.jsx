import { useState, useEffect } from 'react';
import TVShowCard from '../components/TVShowCard';
import { tmdbService } from '../services/tmdb';
import Footer from '../components/Footer';

export default function TopRatedTVShows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        // Fetch first 5 pages to get 100 TV shows (20 per page)
        const requests = [1, 2, 3, 4, 5].map(page => 
          tmdbService.getTopRatedTVShows(page)
        );
        const results = await Promise.all(requests);
        const allShows = results.flatMap(data => data.results || []);
        setShows(allShows.slice(0, 100));
      } catch (error) {
        console.error('Error fetching top rated TV shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRated();
  }, []);

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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Top 100 TV Shows</h1>
          <p className="text-gray-400 text-lg">The highest rated TV shows of all time</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {shows.map((show, index) => (
            <div key={show.id} className="relative">
              <div className="absolute top-2 left-2 bg-yellow-400 text-black font-bold text-lg px-2 py-1 rounded z-10">
                #{index + 1}
              </div>
              <TVShowCard show={show} />
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
