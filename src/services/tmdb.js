// Configuration: Use backend API or call TMDB directly
// Set VITE_USE_BACKEND=true in your .env file to use the backend
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Helper function to make requests (uses backend or TMDB directly based on config)
const fetchData = async (backendPath, tmdbPath) => {
  if (USE_BACKEND) {
    const response = await fetch(`${BACKEND_URL}${backendPath}`);
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    return response.json();
  } else {
    const separator = tmdbPath.includes('?') ? '&' : '?';
    const response = await fetch(`${BASE_URL}${tmdbPath}${separator}api_key=${API_KEY}`);
    return response.json();
  }
};

export const tmdbService = {
  // Get popular movies
  getPopularMovies: async (page = 1) => {
    return fetchData(
      `/movies/popular?page=${page}`,
      `/movie/popular?language=en-US&page=${page}`
    );
  },

  // Get top rated movies
  getTopRatedMovies: async (page = 1) => {
    return fetchData(
      `/movies/top-rated?page=${page}`,
      `/movie/top_rated?language=en-US&page=${page}`
    );
  },

  // Get trending movies
  getTrendingMovies: async () => {
    return fetchData(
      '/movies/trending',
      '/trending/movie/week'
    );
  },

  // Get upcoming movies
  getUpcomingMovies: async (page = 1) => {
    return fetchData(
      `/movies/upcoming?page=${page}`,
      `/movie/upcoming?language=en-US&page=${page}`
    );
  },

  // Get now playing movies
  getNowPlayingMovies: async (page = 1) => {
    return fetchData(
      `/movies/now-playing?page=${page}`,
      `/movie/now_playing?language=en-US&page=${page}`
    );
  },

  // Search movies
  searchMovies: async (query) => {
    return fetchData(
      `/search/movies?query=${encodeURIComponent(query)}`,
      `/search/movie?language=en-US&query=${encodeURIComponent(query)}&page=1`
    );
  },

  // Get movie details
  getMovieDetails: async (movieId) => {
    return fetchData(
      `/movies/${movieId}`,
      `/movie/${movieId}?language=en-US`
    );
  },

  // Get movie reviews
  getMovieReviews: async (movieId) => {
    return fetchData(
      `/movies/${movieId}/reviews`,
      `/movie/${movieId}/reviews?language=en-US&page=1`
    );
  },

  // Get movie credits (cast & crew)
  getMovieCredits: async (movieId) => {
    return fetchData(
      `/movies/${movieId}/credits`,
      `/movie/${movieId}/credits?language=en-US`
    );
  },

  // Get similar movies
  getSimilarMovies: async (movieId) => {
    return fetchData(
      `/movies/${movieId}/similar`,
      `/movie/${movieId}/similar?language=en-US&page=1`
    );
  },

  // Get movie recommendations
  getMovieRecommendations: async (movieId) => {
    return fetchData(
      `/movies/${movieId}/recommendations`,
      `/movie/${movieId}/recommendations?language=en-US&page=1`
    );
  },

  // Get movie videos (trailers, teasers, etc.)
  getMovieVideos: async (movieId) => {
    return fetchData(
      `/movies/${movieId}/videos`,
      `/movie/${movieId}/videos?language=en-US`
    );
  },

  // Get movie watch providers
  getMovieWatchProviders: async (movieId) => {
    return fetchData(
      `/movies/${movieId}/watch-providers`,
      `/movie/${movieId}/watch/providers`
    );
  },

  // Get popular actors
  getPopularActors: async (page = 1) => {
    return fetchData(
      `/actors/popular?page=${page}`,
      `/person/popular?language=en-US&page=${page}`
    );
  },

  // Get trending actors (daily)
  getTrendingActors: async (page = 1) => {
    // Backend doesn't have this endpoint, call TMDB directly
    const response = await fetch(
      `${BASE_URL}/trending/person/day?api_key=${API_KEY}&page=${page}`
    );
    return response.json();
  },

  // Get trending actors (weekly)
  getTrendingActorsWeekly: async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/trending/person/week?api_key=${API_KEY}&page=${page}`
    );
    return response.json();
  },

  // Get actors from latest movies
  getActorsFromLatestMovies: async (page = 1) => {
    try {
      // First get latest popular movies
      const moviesData = await tmdbService.getNowPlayingMovies(page);
      
      // Then get cast from first few movies
      const actorSet = new Set();
      const actors = [];
      
      for (const movie of moviesData.results.slice(0, 5)) {
        try {
          const castData = await tmdbService.getMovieCredits(movie.id);
          
          castData.cast.slice(0, 10).forEach(actor => {
            if (!actorSet.has(actor.id) && actor.profile_path) {
              actorSet.add(actor.id);
              actors.push({
                ...actor,
                known_for_department: actor.known_for_department || 'Acting',
                popularity: actor.popularity || movie.popularity || 0
              });
            }
          });
        } catch (err) {
          console.log('Error fetching cast for movie:', movie.id);
        }
      }
      
      return {
        results: actors.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)),
        page: page,
        total_pages: 10,
        total_results: actors.length
      };
    } catch (error) {
      console.error('Error fetching actors from latest movies:', error);
      return { results: [], page: 1, total_pages: 1, total_results: 0 };
    }
  },

  // Search actors (enhanced)
  searchActors: async (query, page = 1) => {
    return fetchData(
      `/search/actors?query=${encodeURIComponent(query)}&page=${page}`,
      `/search/person?language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
    );
  },

  // Get actors by gender (1=female, 2=male, 0=not specified)
  getActorsByGender: async (gender = 0, page = 1) => {
    try {
      const results = [];
      const startApiPage = (page - 1) * 3 + 1;
      let totalPages = 500;
      
      for (let apiPage = startApiPage; apiPage <= startApiPage + 4 && results.length < 20; apiPage++) {
        const data = await tmdbService.getPopularActors(apiPage);
        totalPages = Math.min(data.total_pages || 500, 500);
        
        const filtered = (data.results || []).filter(actor => 
          actor.gender === gender && actor.profile_path
        );
        results.push(...filtered);
        
        if (apiPage >= totalPages) break;
      }
      
      return {
        results: results.slice(0, 20),
        page: page,
        total_pages: Math.ceil(totalPages / 3),
        total_results: results.length
      };
    } catch (error) {
      console.error('Error fetching actors by gender:', error);
      return { results: [], page: 1, total_pages: 1, total_results: 0 };
    }
  },

  // Get actor details
  getActorDetails: async (actorId) => {
    return fetchData(
      `/actors/${actorId}`,
      `/person/${actorId}?language=en-US`
    );
  },

  // Get actor movie credits
  getActorMovieCredits: async (actorId) => {
    return fetchData(
      `/actors/${actorId}/movie-credits`,
      `/person/${actorId}/movie_credits?language=en-US`
    );
  },

  // Get actor TV credits
  getActorTVCredits: async (actorId) => {
    return fetchData(
      `/actors/${actorId}/tv-credits`,
      `/person/${actorId}/tv_credits?language=en-US`
    );
  },

  // Get actor combined credits (movies + TV)
  getActorCombinedCredits: async (actorId) => {
    return fetchData(
      `/actors/${actorId}/combined-credits`,
      `/person/${actorId}/combined_credits?language=en-US`
    );
  },

  // Get actor images
  getActorImages: async (actorId) => {
    return fetchData(
      `/actors/${actorId}/images`,
      `/person/${actorId}/images`
    );
  },

  // Get movies by genre
  getMoviesByGenre: async (genreId, page = 1) => {
    return fetchData(
      `/movies/genre/${genreId}?page=${page}`,
      `/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`
    );
  },

  // Get all movie genres
  getGenres: async () => {
    return fetchData(
      '/movies/genres',
      '/genre/movie/list?language=en-US'
    );
  },

  // TV Shows APIs
  // Get popular TV shows
  getPopularTVShows: async (page = 1) => {
    return fetchData(
      `/tv/popular?page=${page}`,
      `/tv/popular?language=en-US&page=${page}`
    );
  },

  // Get top rated TV shows
  getTopRatedTVShows: async (page = 1) => {
    return fetchData(
      `/tv/top-rated?page=${page}`,
      `/tv/top_rated?language=en-US&page=${page}`
    );
  },

  // Get trending TV shows
  getTrendingTVShows: async () => {
    return fetchData(
      '/tv/trending',
      '/trending/tv/week'
    );
  },

  // Get upcoming TV shows (airing soon)
  getUpcomingTVShows: async (page = 1) => {
    return fetchData(
      `/tv/upcoming?page=${page}`,
      `/tv/on_the_air?language=en-US&page=${page}`
    );
  },

  // Search TV shows
  searchTVShows: async (query) => {
    return fetchData(
      `/search/tv?query=${encodeURIComponent(query)}`,
      `/search/tv?language=en-US&query=${encodeURIComponent(query)}&page=1`
    );
  },

  // Get TV show details
  getTVShowDetails: async (tvId) => {
    return fetchData(
      `/tv/${tvId}`,
      `/tv/${tvId}?language=en-US`
    );
  },

  // Get TV show credits (cast)
  getTVShowCredits: async (tvId) => {
    return fetchData(
      `/tv/${tvId}/credits`,
      `/tv/${tvId}/credits?language=en-US`
    );
  },

  // Get TV show reviews
  getTVShowReviews: async (tvId) => {
    return fetchData(
      `/tv/${tvId}/reviews`,
      `/tv/${tvId}/reviews?language=en-US&page=1`
    );
  },

  // Get TV show videos (trailers)
  getTVShowVideos: async (tvId) => {
    return fetchData(
      `/tv/${tvId}/videos`,
      `/tv/${tvId}/videos?language=en-US`
    );
  },

  // Get similar TV shows
  getSimilarTVShows: async (tvId) => {
    return fetchData(
      `/tv/${tvId}/similar`,
      `/tv/${tvId}/similar?language=en-US&page=1`
    );
  },

  // Get TV shows by genre
  getTVShowsByGenre: async (genreId, page = 1) => {
    return fetchData(
      `/tv/genre/${genreId}?page=${page}`,
      `/discover/tv?language=en-US&with_genres=${genreId}&page=${page}`
    );
  },

  // Get TV show genres
  getTVGenres: async () => {
    return fetchData(
      '/tv/genres',
      '/genre/tv/list?language=en-US'
    );
  },

  // Get TV show recommendations
  getTVShowRecommendations: async (tvId) => {
    return fetchData(
      `/tv/${tvId}/recommendations`,
      `/tv/${tvId}/recommendations?language=en-US&page=1`
    );
  },

  // Get TV show watch providers
  getTVShowWatchProviders: async (tvId) => {
    return fetchData(
      `/tv/${tvId}/watch-providers`,
      `/tv/${tvId}/watch/providers`
    );
  },

  // Discover movies by multiple criteria (for personalized recommendations)
  discoverMovies: async (params = {}) => {
    if (USE_BACKEND) {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${BACKEND_URL}/movies/discover?${queryString}`);
      return response.json();
    }
    const queryParams = new URLSearchParams({
      api_key: API_KEY,
      language: 'en-US',
      sort_by: 'popularity.desc',
      page: params.page || '1',
      include_adult: 'false',
      include_video: 'false',
      ...params
    });
    const response = await fetch(`${BASE_URL}/discover/movie?${queryParams}`);
    return response.json();
  },

  // Discover TV shows by multiple criteria
  discoverTV: async (params = {}) => {
    const queryParams = new URLSearchParams({
      api_key: API_KEY,
      language: 'en-US',
      sort_by: 'popularity.desc',
      page: params.page || '1',
      include_adult: 'false',
      ...params
    });
    const response = await fetch(`${BASE_URL}/discover/tv?${queryParams}`);
    return response.json();
  },

  // Helper function to get image URL
  getImageUrl: (path, size = 'w500') => {
    if (!path) return '/placeholder.jpg';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  },
};
