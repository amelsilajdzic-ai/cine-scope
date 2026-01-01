import { fetchFromTMDB } from '../config/tmdb.js';
import { InvalidParameterError, AppError } from '../utils/errors.js';

/**
 * Validates that a TV show ID is a valid positive integer
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

export const tvController = {
  // Get popular TV shows
  getPopular: async (req, res, next) => {
    try {
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/tv/popular?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get top rated TV shows
  getTopRated: async (req, res, next) => {
    try {
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/tv/top_rated?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get trending TV shows
  getTrending: async (req, res, next) => {
    try {
      const data = await fetchFromTMDB('/trending/tv/week');
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get upcoming TV shows (airing soon)
  getUpcoming: async (req, res, next) => {
    try {
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/tv/on_the_air?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get TV show details
  getDetails: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/tv/${id}?language=en-US`);
      
      if (!data.id) {
        throw new AppError(
          `TV Show with ID ${id} not found`,
          404,
          {
            tvShowId: id,
            hint: 'The TV show might have been removed or the ID is incorrect. Try searching by title instead.'
          }
        );
      }
      
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get TV show credits
  getCredits: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/tv/${id}/credits?language=en-US`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get TV show reviews
  getReviews: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/tv/${id}/reviews?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get similar TV shows
  getSimilar: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/tv/${id}/similar?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get TV show recommendations
  getRecommendations: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/tv/${id}/recommendations?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get TV show videos
  getVideos: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/tv/${id}/videos?language=en-US`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get TV shows by genre
  getByGenre: async (req, res, next) => {
    try {
      const genreId = validateId(req.params.genreId);
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(
        `/discover/tv?language=en-US&with_genres=${genreId}&page=${page}`
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get TV genres
  getGenres: async (req, res, next) => {
    try {
      const data = await fetchFromTMDB('/genre/tv/list?language=en-US');
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get watch providers
  getWatchProviders: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/tv/${id}/watch/providers`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
