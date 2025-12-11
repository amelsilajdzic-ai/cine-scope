import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';
import Footer from '../components/Footer';

export default function Genres() {
  const [genreImages, setGenreImages] = useState({});
  
  const genres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];

  useEffect(() => {
    // Fetch a representative movie for each genre
    const fetchGenreImages = async () => {
      const images = {};
      for (const genre of genres) {
        try {
          const data = await tmdbService.getMoviesByGenre(genre.id, 1);
          if (data.results && data.results.length > 0) {
            images[genre.id] = tmdbService.getImageUrl(data.results[0].backdrop_path, 'w780');
          }
        } catch (error) {
          console.error(`Error fetching image for ${genre.name}:`, error);
        }
      }
      setGenreImages(images);
    };
    
    fetchGenreImages();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Browse by Genre</h1>
          <p className="text-gray-400">Explore movies by your favorite genres</p>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              to={`/genre/${genre.id}`}
              className="relative group rounded-lg overflow-hidden hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-2xl"
              style={{ paddingBottom: '56.25%' }}
            >
              {genreImages[genre.id] ? (
                <>
                  <img
                    src={genreImages[genre.id]}
                    alt={genre.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  <div className="absolute inset-0 flex items-end p-4">
                    <div>
                      <h3 className="font-bold text-xl text-white mb-1">{genre.name}</h3>
                      <button className="flex items-center gap-2 text-white text-sm opacity-80 hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Explore
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-stone-800 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-white">{genre.name}</h3>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
