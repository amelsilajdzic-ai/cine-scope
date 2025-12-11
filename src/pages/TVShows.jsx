import { useState, useEffect } from 'react';
import TVShowCard from '../components/TVShowCard';
import { tmdbService } from '../services/tmdb';
import Footer from '../components/Footer';

export default function TVShows() {
  const [trendingShows, setTrendingShows] = useState([]);
  const [popularShows, setPopularShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        const [trending, popular1, popular2] = await Promise.all([
          tmdbService.getTrendingTVShows(),
          tmdbService.getPopularTVShows(1),
          tmdbService.getPopularTVShows(2),
        ]);
        setTrendingShows(trending.results?.slice(0, 6) || []);
        const allPopular = [...(popular1.results || []), ...(popular2.results || [])];
        setPopularShows(allPopular);
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTVShows();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading TV shows...</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-stone-900 to-stone-800 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Discover TV Shows
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Explore the best TV series from around the world
          </p>
        </div>
      </section>

      {/* Trending TV Shows */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10h-2v3H8v2h3v3h2v-3h3v-2h-3v-3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          Trending This Week
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingShows.map((show) => (
            <TVShowCard key={show.id} show={show} />
          ))}
        </div>
      </section>

      {/* Popular TV Shows */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Popular TV Shows
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularShows.map((show) => (
            <TVShowCard key={show.id} show={show} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
