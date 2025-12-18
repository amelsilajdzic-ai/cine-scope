import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { tmdbService } from '../services/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [upcomingContent, setUpcomingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroMovies, setHeroMovies] = useState([]);
  const [playingTrailer, setPlayingTrailer] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trending, popular1, popular2, upcomingMovies, upcomingTV, nowPlaying] = await Promise.all([
          tmdbService.getTrendingMovies(),
          tmdbService.getPopularMovies(1),
          tmdbService.getPopularMovies(2),
          tmdbService.getUpcomingMovies(1),
          tmdbService.getUpcomingTVShows(1),
          tmdbService.getNowPlayingMovies(),
        ]);
        setTrendingMovies((trending.results || []).filter(movie => movie.poster_path).slice(0, 6));
        
        // Set hero carousel movies with trailers
        const heroMoviesData = (nowPlaying.results || []).filter(movie => movie.backdrop_path).slice(0, 5);
        const moviesWithTrailers = await Promise.all(
          heroMoviesData.map(async (movie) => {
            try {
              const videos = await tmdbService.getMovieVideos(movie.id);
              // Try to find a trailer - look for Trailer type first, then any video
              let trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
              
              // If no trailer found, try Teaser
              if (!trailer) {
                trailer = videos.results?.find(v => v.type === 'Teaser' && v.site === 'YouTube');
              }
              
              // If still no trailer, just take the first YouTube video
              if (!trailer) {
                trailer = videos.results?.find(v => v.site === 'YouTube');
              }
              
              return { ...movie, trailerKey: trailer?.key };
            } catch (error) {
              console.error(`Error fetching trailer for ${movie.title}:`, error);
              return movie;
            }
          })
        );
        setHeroMovies(moviesWithTrailers);
        
        // Combine first 2 pages to get 40 movies (20 per page), filter those without posters
        const allPopular = [...(popular1.results || []), ...(popular2.results || [])].filter(movie => movie.poster_path);
        setPopularMovies(allPopular);
        
        // Combine upcoming movies and TV shows, add type field, filter those without posters
        const moviesWithType = (upcomingMovies.results || []).filter(item => item.poster_path || item.backdrop_path).slice(0, 10).map(item => ({ ...item, mediaType: 'movie', displayTitle: item.title, displayDate: item.release_date }));
        const tvWithType = (upcomingTV.results || []).filter(item => item.poster_path || item.backdrop_path).slice(0, 10).map(item => ({ ...item, mediaType: 'tv', displayTitle: item.name, displayDate: item.first_air_date }));
        const combined = [...moviesWithType, ...tvWithType]
          .sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate))
          .slice(0, 12);
        setUpcomingContent(combined);
        
        // Set specific featured trailers
        setTrailers([
          {
            id: 'breaking-bad',
            title: 'Breaking Bad',
            trailerKey: 'HhesaQXLuRY',
            vote_average: 9.5,
            release_date: '2008-01-20',
            type: 'TV Show'
          },
          {
            id: 'game-of-thrones',
            title: 'Game of Thrones',
            trailerKey: 'KPLWWIOCOOQ',
            vote_average: 9.2,
            release_date: '2011-04-17',
            type: 'TV Show'
          },
          {
            id: 'interstellar',
            title: 'Interstellar',
            trailerKey: 'zSWdZVtXT7E',
            vote_average: 8.6,
            release_date: '2014-11-07',
            type: 'Movie'
          }
        ]);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (heroMovies.length === 0 || playingTrailer !== null) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [heroMovies.length, playingTrailer]);

  const nextSlide = () => {
    setPlayingTrailer(null);
    setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
  };

  const prevSlide = () => {
    setPlayingTrailer(null);
    setCurrentSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading movies...</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      {/* Hero Carousel */}
      {heroMovies.length > 0 && (
        <section className="relative h-[600px] bg-stone-900 overflow-hidden">
          <div className="flex h-full">
            {/* Main Carousel Area */}
            <div className="flex-1 relative">
              {heroMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
                  }}></div>

                  {/* Main Content Area */}
                  <div className="relative h-full container mx-auto px-4 flex items-center gap-6">
                    {/* Movie Poster */}
                    <div className="shrink-0 relative group">
                      <Link to={`/movie/${movie.id}`}>
                        <img
                          src={tmdbService.getImageUrl(movie.poster_path, 'w500')}
                          alt={movie.title}
                          className="w-48 h-72 object-cover rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                          }}
                        />
                        {/* Plus Icon for Watchlist */}
                        <div className="absolute top-2 left-2 w-10 h-10 bg-black/80 hover:bg-black/90 rounded flex items-center justify-center cursor-pointer transition-colors">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                          </svg>
                        </div>
                      </Link>
                    </div>

                    {/* Backdrop Image with Play Button */}
                    <div 
                      className="flex-1 relative h-[450px] rounded-lg overflow-hidden group cursor-pointer"
                      onClick={() => {
                        if (movie.trailerKey) {
                          setPlayingTrailer(movie.id);
                        } else {
                          alert(`No trailer available for ${movie.title}`);
                        }
                      }}
                    >
                      {playingTrailer === movie.id && movie.trailerKey ? (
                        <div className="relative w-full h-full bg-black" onClick={(e) => e.stopPropagation()}>
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&rel=0`}
                            title={movie.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlayingTrailer(null);
                            }}
                            className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full z-10"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                            style={{
                              backgroundImage: `url(${tmdbService.getImageUrl(movie.backdrop_path, 'original')})`,
                            }}
                          >
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
                          </div>

                          {/* Play Button - Clickable */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-20 h-20 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group-hover:scale-110">
                              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>

                          {/* Movie Info at Bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-stone-900/90 backdrop-blur-sm px-2 py-1 rounded text-yellow-400 font-bold text-sm">
                                {movie.vote_average?.toFixed(1)} ★
                              </span>
                              <span className="text-white font-semibold text-lg">
                                {movie.title}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">Watch the Trailer</p>
                            <div className="flex items-center gap-4 text-sm text-gray-400 pointer-events-auto">
                              <button className="flex items-center gap-1 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                                </svg>
                                <span>{Math.floor(movie.popularity)}</span>
                              </button>
                              <button className="flex items-center gap-1 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"></path>
                                </svg>
                                <span>{Math.floor(movie.popularity / 10)}</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm transition-all z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm transition-all z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {heroMovies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Up Next Sidebar */}
            <div className="w-96 bg-black/40 backdrop-blur-sm p-6 overflow-y-auto">
              <h3 className="text-yellow-400 text-xl font-bold mb-4">Up next</h3>
              <div className="space-y-4">
                {upcomingContent.slice(0, 3).map((item, index) => (
                  <Link
                    key={item.id}
                    to={`/${item.mediaType}/${item.id}`}
                    className="flex gap-3 group cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="relative shrink-0 w-32 h-20 rounded overflow-hidden">
                      <img
                        src={tmdbService.getImageUrl(item.backdrop_path || item.poster_path, 'w300')}
                        alt={item.displayTitle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {Math.floor(Math.random() * 3) + 1}:0{Math.floor(Math.random() * 9)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {item.displayTitle}
                      </h4>
                      <p className="text-gray-400 text-xs mb-2">Watch the Trailer</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                          </svg>
                          {Math.floor(item.popularity / 2)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {Math.floor(item.popularity / 5)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Browse Trailers Link */}
              <Link
                to="/genres"
                className="mt-6 flex items-center justify-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold text-sm transition-colors"
              >
                Browse trailers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="bg-linear-to-r from-stone-900 to-stone-800 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {t('welcomeTitle')}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {t('welcomeSubtitle')}
          </p>
        </div>
      </section>

      {/* Featured Trailers */}
      {trailers.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Featured Trailers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trailers.map((movie) => (
              <div key={movie.id} className="bg-stone-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${movie.trailerKey}?rel=0`}
                    title={movie.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2">{movie.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Movies & TV Shows */}
      {upcomingContent.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            Coming Soon
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {upcomingContent.map((item) => (
              <div key={`${item.mediaType}-${item.id}`} className="bg-stone-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all duration-300 group">
                <Link to={item.mediaType === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`}>
                  <div className="relative">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.displayTitle}
                      className="w-full h-96 object-cover group-hover:brightness-110 transition-all duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-yellow-400 text-stone-900 px-2 py-1 rounded text-xs font-bold uppercase">
                      {item.mediaType === 'movie' ? '🎬 Movie' : '📺 TV'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm hover:text-yellow-400 line-clamp-2 mb-2">
                      {item.displayTitle}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {item.displayDate ? new Date(item.displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Movies */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <svg className="w-8 h-8 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10h-2v3H8v2h3v3h2v-3h3v-2h-3v-3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          {t('trendingThisWeek')}
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
          {t('popularMovies')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
