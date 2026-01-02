const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdbService = {
  // Get popular movies
  getPopularMovies: async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return response.json();
  },

  // Get top rated movies
  getTopRatedMovies: async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return response.json();
  },

  // Get trending movies
  getTrendingMovies: async () => {
    const response = await fetch(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
    );
    return response.json();
  },

  // Get upcoming movies
  getUpcomingMovies: async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return response.json();
  },

  // Get now playing movies
  getNowPlayingMovies: async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return response.json();
  },

  // Search movies
  searchMovies: async (query) => {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=1`
    );
    return response.json();
  },

  // Get movie details
  getMovieDetails: async (movieId) => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get movie reviews
  getMovieReviews: async (movieId) => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Get movie credits (cast & crew)
  getMovieCredits: async (movieId) => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get similar movies
  getSimilarMovies: async (movieId) => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Get movie recommendations
  getMovieRecommendations: async (movieId) => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Get movie videos (trailers, teasers, etc.)
  getMovieVideos: async (movieId) => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get popular actors
  getPopularActors: async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/person/popular?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return response.json();
  },

  // Get trending actors (daily)
  getTrendingActors: async (page = 1) => {
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
      const moviesResponse = await fetch(
        `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${page}`
      );
      const moviesData = await moviesResponse.json();
      
      // Then get cast from first few movies
      const actorSet = new Set();
      const actors = [];
      
      for (const movie of moviesData.results.slice(0, 5)) {
        try {
          const castResponse = await fetch(
            `${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`
          );
          const castData = await castResponse.json();
          
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
    const response = await fetch(
      `${BASE_URL}/search/person?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
    );
    return response.json();
  },

  // Get actors by gender (1=female, 2=male, 0=not specified)
  getActorsByGender: async (gender = 0, page = 1) => {
    const response = await fetch(
      `${BASE_URL}/discover/person?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_gender=${gender}&page=${page}`
    );
    return response.json();
  },

  // Get actor details
  getActorDetails: async (actorId) => {
    const response = await fetch(
      `${BASE_URL}/person/${actorId}?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get actor movie credits
  getActorMovieCredits: async (actorId) => {
    const response = await fetch(
      `${BASE_URL}/person/${actorId}/movie_credits?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get actor TV credits
  getActorTVCredits: async (actorId) => {
    const response = await fetch(
      `${BASE_URL}/person/${actorId}/tv_credits?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get actor combined credits (movies + TV)
  getActorCombinedCredits: async (actorId) => {
    const response = await fetch(
      `${BASE_URL}/person/${actorId}/combined_credits?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get actor images
  getActorImages: async (actorId) => {
    const response = await fetch(
      `${BASE_URL}/person/${actorId}/images?api_key=${API_KEY}`
    );
    return response.json();
  },

  // Get movies by genre
  getMoviesByGenre: async (genreId, page = 1) => {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`
    );
    return response.json();
  },

  // Get all movie genres
  getGenres: async () => {
    const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // TV Shows APIs
  // Get popular TV shows
  getPopularTVShows: async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return response.json();
  },

  // Get top rated TV shows
  getTopRatedTVShows: async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return response.json();
  },

  // Get trending TV shows
  getTrendingTVShows: async () => {
    const response = await fetch(
      `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`
    );
    return response.json();
  },

  // Get upcoming TV shows (airing soon)
  getUpcomingTVShows: async (page = 1) => {
    const response = await fetch(
      `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    return response.json();
  },

  // Search TV shows
  searchTVShows: async (query) => {
    const response = await fetch(
      `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${query}&page=1`
    );
    return response.json();
  },

  // Get TV show details
  getTVShowDetails: async (tvId) => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get TV show credits (cast)
  getTVShowCredits: async (tvId) => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/credits?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get TV show reviews
  getTVShowReviews: async (tvId) => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/reviews?api_key=${API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Get TV show videos (trailers)
  getTVShowVideos: async (tvId) => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/videos?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get similar TV shows
  getSimilarTVShows: async (tvId) => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/similar?api_key=${API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Get TV shows by genre
  getTVShowsByGenre: async (genreId, page = 1) => {
    const response = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=${genreId}&page=${page}`
    );
    return response.json();
  },

  // Get TV show genres
  getTVGenres: async () => {
    const response = await fetch(
      `${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get TV show recommendations
  getTVShowRecommendations: async (tvId) => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Discover movies by multiple criteria (for personalized recommendations)
  discoverMovies: async (params = {}) => {
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

  // Get watch providers for a movie (streaming services)
  getMovieWatchProviders: async (movieId) => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`
    );
    return response.json();
  },

  // Get watch providers for a TV show
  getTVShowWatchProviders: async (tvId) => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/watch/providers?api_key=${API_KEY}`
    );
    return response.json();
  },

  // Helper function to get image URL
  getImageUrl: (path, size = 'w500') => {
    if (!path) return '/placeholder.jpg';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  },
};
