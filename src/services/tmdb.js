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

  // Search actors
  searchActors: async (query) => {
    const response = await fetch(
      `${BASE_URL}/search/person?api_key=${API_KEY}&language=en-US&query=${query}&page=1`
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
      page: '1',
      ...params
    });
    const response = await fetch(`${BASE_URL}/discover/movie?${queryParams}`);
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
