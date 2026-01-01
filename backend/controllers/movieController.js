import { fetchFromTMDB } from '../config/tmdb.js';
import { 
  InvalidParameterError, 
  NoDataError,
  AppError,
  formatErrorResponse 
} from '../utils/errors.js';

/**
 * Validates that a movie/TV ID is a valid positive integer
 * @param {string|number} id - The ID to validate
 * @returns {number} - The validated ID as a number
 * @throws {InvalidParameterError} If ID is invalid
 */
const validateId = (id) => {
  const numId = parseInt(id, 10);
  if (!id || isNaN(numId) || numId <= 0) {
    throw new InvalidParameterError('id', id, 'positive integer');
  }
  return numId;
};

/**
 * Validates pagination parameter
 * @param {string|number} page - The page number
 * @returns {number} - Valid page number (defaults to 1)
 */
const validatePage = (page) => {
  const numPage = parseInt(page, 10);
  if (isNaN(numPage) || numPage < 1) {
    return 1;
  }
  return Math.min(numPage, 500); // TMDB max page limit
};

export const movieController = {
  // Get popular movies
  getPopular: async (req, res, next) => {
    try {
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/movie/popular?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get top rated movies
  getTopRated: async (req, res, next) => {
    try {
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/movie/top_rated?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get trending movies
  getTrending: async (req, res, next) => {
    try {
      const data = await fetchFromTMDB('/trending/movie/week');
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get upcoming movies
  getUpcoming: async (req, res, next) => {
    try {
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/movie/upcoming?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get now playing movies
  getNowPlaying: async (req, res, next) => {
    try {
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/movie/now_playing?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get movie details
  getDetails: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/movie/${id}?language=en-US`);
      
      if (!data.id) {
        throw new AppError(
          `Movie with ID ${id} not found`,
          404,
          { 
            movieId: id,
            hint: 'The movie might have been removed or the ID is incorrect. Try searching by title instead.'
          }
        );
      }
      
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get movie credits
  getCredits: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/movie/${id}/credits?language=en-US`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get movie reviews
  getReviews: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/movie/${id}/reviews?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get similar movies
  getSimilar: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/movie/${id}/similar?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get movie recommendations (enhanced with custom logic)
  getRecommendations: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      
      // Get TMDB recommendations
      const tmdbRecs = await fetchFromTMDB(`/movie/${id}/recommendations?language=en-US&page=1`);
      
      // Get movie details to enhance recommendations
      const movieDetails = await fetchFromTMDB(`/movie/${id}?language=en-US`);
      
      // If TMDB has recommendations, use them
      if (tmdbRecs.results && tmdbRecs.results.length > 0) {
        res.json(tmdbRecs);
      } else {
        // Fallback: discover movies with same genres
        const genreIds = movieDetails.genres?.map(g => g.id).join(',') || '';
        if (genreIds) {
          const fallbackRecs = await fetchFromTMDB(
            `/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=${genreIds}&page=1`
          );
          res.json(fallbackRecs);
        } else {
          res.json({ results: [], total_results: 0, page: 1 });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  // Get movie videos
  getVideos: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/movie/${id}/videos?language=en-US`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get movies by genre
  getByGenre: async (req, res, next) => {
    try {
      const genreId = validateId(req.params.genreId);
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(
        `/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get all genres
  getGenres: async (req, res, next) => {
    try {
      const data = await fetchFromTMDB('/genre/movie/list?language=en-US');
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get watch providers
  getWatchProviders: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/movie/${id}/watch/providers`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Discover movies with filters
  discover: async (req, res, next) => {
    try {
      const params = new URLSearchParams({
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: String(validatePage(req.query.page)),
        ...req.query
      });
      const data = await fetchFromTMDB(`/discover/movie?${params.toString()}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
