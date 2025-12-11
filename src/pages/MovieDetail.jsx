import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';

export default function MovieDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [localReviews, setLocalReviews] = useState([]);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    author: '',
    rating: 5,
    content: ''
  });

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [movieData, reviewsData, creditsData, similarData, videosData] = await Promise.all([
          tmdbService.getMovieDetails(id),
          tmdbService.getMovieReviews(id),
          tmdbService.getMovieCredits(id),
          tmdbService.getSimilarMovies(id),
          tmdbService.getMovieVideos(id),
        ]);
        
        setMovie(movieData);
        setReviews(reviewsData.results?.slice(0, 5) || []);
        setCast(creditsData.cast?.slice(0, 10) || []);
        setSimilar(similarData.results?.slice(0, 6) || []);
        
        // Find the official trailer or first video
        const trailerVideo = videosData.results?.find(
          v => v.type === 'Trailer' && v.site === 'YouTube'
        ) || videosData.results?.find(v => v.site === 'YouTube');
        setTrailer(trailerVideo);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
    
    // Load local reviews from localStorage
    const savedReviews = localStorage.getItem(`movie_reviews_${id}`);
    if (savedReviews) {
      setLocalReviews(JSON.parse(savedReviews));
    }
  }, [id]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!newReview.author.trim() || !newReview.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const review = {
      id: Date.now().toString(),
      author: newReview.author,
      author_details: { rating: newReview.rating },
      content: newReview.content,
      created_at: new Date().toISOString(),
      isLocal: true
    };

    const updatedReviews = [review, ...localReviews];
    setLocalReviews(updatedReviews);
    localStorage.setItem(`movie_reviews_${id}`, JSON.stringify(updatedReviews));

    // Reset form
    setNewReview({ author: '', rating: 5, content: '' });
    setShowReviewForm(false);
  };

  const allReviews = [...localReviews, ...reviews];

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-white text-2xl">Movie not found</div>
      </div>
    );
  }

  const backdropUrl = tmdbService.getImageUrl(movie.backdrop_path, 'original');
  const posterUrl = tmdbService.getImageUrl(movie.poster_path, 'w500');
  const rating = movie.vote_average?.toFixed(1) || 'N/A';

  return (
    <div className="bg-stone-950 min-h-screen">
      {/* Backdrop Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent"></div>
      </div>

      {/* Movie Info Section */}
      <div className="container mx-auto px-4 -mt-64 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-64 rounded-lg shadow-2xl"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
            }}
          />

          {/* Details */}
          <div className="flex-1 text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-2xl font-bold">{rating}</span>
                <span className="text-gray-400 ml-2">({movie.vote_count} votes)</span>
              </div>
              <span className="text-gray-400">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
              </span>
              {movie.runtime && (
                <span className="text-gray-400">{movie.runtime} min</span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-stone-800 px-3 py-1 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Play Trailer Button */}
            {trailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold py-3 px-8 rounded-lg flex items-center gap-2 mb-6 transition"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play Trailer
              </button>
            )}

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Overview</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {movie.budget > 0 && (
                <div>
                  <span className="text-gray-400">Budget:</span>
                  <span className="ml-2">${(movie.budget / 1000000).toFixed(1)}M</span>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <span className="text-gray-400">Revenue:</span>
                  <span className="ml-2">${(movie.revenue / 1000000).toFixed(1)}M</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {cast.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
              {cast.map((person) => (
                <Link 
                  key={person.id} 
                  to={`/actor/${person.id}`}
                  className="text-center group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg mb-2">
                    <img
                      src={tmdbService.getImageUrl(person.profile_path, 'w185')}
                      alt={person.name}
                      className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/185x278?text=No+Photo';
                      }}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                  </div>
                  <p className="text-white text-sm font-semibold group-hover:text-yellow-400 transition-colors">{person.name}</p>
                  <p className="text-gray-400 text-xs">{person.character}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Reviews ({allReviews.length})</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold py-2 px-6 rounded-lg transition"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="bg-stone-800 p-6 rounded-lg mb-6">
              <div className="mb-4">
                <label className="block text-white font-bold mb-2">Your Name</label>
                <input
                  type="text"
                  value={newReview.author}
                  onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                  className="w-full p-3 rounded bg-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-white font-bold mb-2">Rating</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-yellow-400 font-bold text-2xl w-12">
                    {newReview.rating}/10
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white font-bold mb-2">Your Review</label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  className="w-full p-3 rounded bg-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 h-32"
                  placeholder="Share your thoughts about this movie..."
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold py-3 px-8 rounded-lg transition"
              >
                Submit Review
              </button>
            </form>
          )}

          {/* Reviews List */}
          {allReviews.length > 0 && (
            <div className="space-y-6">
              {allReviews.map((review) => (
                <div key={review.id} className="bg-stone-800 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-stone-900 font-bold text-xl">
                      {review.author[0].toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="text-white font-bold">{review.author}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {review.author_details?.rating && (
                      <div className="ml-auto flex items-center text-yellow-400">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{review.author_details.rating}/10</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 line-clamp-4">{review.content}</p>
                  {review.isLocal && (
                    <span className="inline-block mt-2 bg-yellow-400 text-stone-900 text-xs font-bold px-2 py-1 rounded">
                      Your Review
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Similar Movies */}
        {similar.length > 0 && (
          <section className="mt-16 pb-16">
            <h2 className="text-3xl font-bold text-white mb-6">Similar Movies</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {similar.map((movie) => (
                <Link key={movie.id} to={`/movie/${movie.id}`}>
                  <div className="bg-stone-800 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                    <img
                      src={tmdbService.getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                      }}
                    />
                    <div className="p-3">
                      <p className="text-white font-semibold text-sm line-clamp-2">
                        {movie.title}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div 
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-yellow-400 text-4xl font-bold"
            >
              ×
            </button>
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
