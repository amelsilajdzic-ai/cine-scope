import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { reviewService } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import TVShowCard from '../components/TVShowCard';

export default function TVShowDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    content: ''
  });

  useEffect(() => {
    const fetchShowData = async () => {
      try {
        const [showData, reviewsData, creditsData, similarData, videosData] = await Promise.all([
          tmdbService.getTVShowDetails(id),
          tmdbService.getTVShowReviews(id),
          tmdbService.getTVShowCredits(id),
          tmdbService.getSimilarTVShows(id),
          tmdbService.getTVShowVideos(id),
        ]);
        
        setShow(showData);
        setReviews(reviewsData.results?.slice(0, 5) || []);
        setCast(creditsData.cast?.slice(0, 10) || []);
        setSimilar(similarData.results?.slice(0, 6) || []);
        
        const trailerVideo = videosData.results?.find(
          v => v.type === 'Trailer' && v.site === 'YouTube'
        ) || videosData.results?.find(v => v.site === 'YouTube');
        setTrailer(trailerVideo);
      } catch (error) {
        console.error('Error fetching TV show details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowData();
    fetchUserReviews();
  }, [id]);

  const fetchUserReviews = async () => {
    try {
      const allReviews = await reviewService.getMovieReviews(parseInt(id));
      setUserReviews(allReviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newReview.content.trim()) {
      alert('Please write a review');
      return;
    }

    try {
      await reviewService.addReview(
        user.id,
        parseInt(id),
        newReview.rating,
        newReview.content,
        {
          title: show.name,
          poster_path: show.poster_path
        }
      );

      // Refresh reviews
      await fetchUserReviews();

      // Reset form
      setNewReview({ rating: 5, content: '' });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading...</div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-white text-2xl">TV Show not found</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 text-white min-h-screen">
      {/* Backdrop */}
      <div className="relative h-96">
        <img
          src={tmdbService.getImageUrl(show.backdrop_path, 'w1280')}
          alt={show.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-stone-950 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-48 relative z-10">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <img
            src={tmdbService.getImageUrl(show.poster_path, 'w500')}
            alt={show.name}
            className="w-64 rounded-lg shadow-2xl"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{show.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-yellow-400 text-2xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {show.vote_average.toFixed(1)}
              </span>
              <span className="text-gray-300">{show.first_air_date?.substring(0, 4)}</span>
              <span className="text-gray-300">{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
              <span className="text-gray-300">{show.number_of_episodes} Episodes</span>
            </div>

            {trailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold py-3 px-8 rounded-lg mb-6 flex items-center gap-2 transition"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play Trailer
              </button>
            )}

            {/* Genres */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {show.genres?.map((genre) => (
                <span key={genre.id} className="bg-stone-700 px-3 py-1 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-4">{show.overview}</p>
          </div>
        </div>

        {/* Cast */}
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
            <h2 className="text-3xl font-bold text-white">Reviews ({userReviews.length + reviews.length})</h2>
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
                  <span className="text-yellow-400 font-bold text-2xl w-16">
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
                  placeholder="Share your thoughts about this show..."
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
          {(userReviews.length > 0 || reviews.length > 0) ? (
            <div className="space-y-6">
              {[...userReviews, ...reviews].map((review) => {
                // For user reviews from Supabase (has user_id field)
                const isUserReview = review.user_id !== undefined;
                const displayName = isUserReview 
                  ? (review.username || 'User')
                  : review.author;
                const reviewRating = isUserReview ? review.rating : review.author_details?.rating;
                
                return (
                  <div key={review.id} className="bg-stone-800 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-stone-900 font-bold text-xl">
                      {displayName[0]?.toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="text-white font-bold">{displayName}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                      {reviewRating && (
                        <div className="ml-auto flex items-center text-yellow-400">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span>{reviewRating}/10</span>
                        </div>
                      )}
                  </div>
                  <p className="text-gray-300 line-clamp-4">{review.content || review.comment}</p>
                  {isUserReview && review.user_id === user?.id && (
                    <span className="inline-block mt-2 bg-yellow-400 text-stone-900 text-xs font-bold px-2 py-1 rounded">
                      Your Review
                    </span>
                  )}
                </div>
              );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to write one!</p>
          )}
        </section>

        {/* Similar Shows */}
        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-6">Similar TV Shows</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {similar.map((show) => (
                <TVShowCard key={show.id} show={show} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-yellow-400"
            >
              ×
            </button>
            <iframe
              className="w-full aspect-video"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="TV Show Trailer"
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
