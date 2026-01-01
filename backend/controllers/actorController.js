import { fetchFromTMDB } from '../config/tmdb.js';
import { InvalidParameterError, AppError } from '../utils/errors.js';

/**
 * Validates that an actor ID is a valid positive integer
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

export const actorController = {
  // Get popular actors
  getPopular: async (req, res, next) => {
    try {
      const page = validatePage(req.query.page);
      const data = await fetchFromTMDB(`/person/popular?language=en-US&page=${page}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get actor details
  getDetails: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/person/${id}?language=en-US`);
      
      if (!data.id) {
        throw new AppError(
          `Actor with ID ${id} not found`,
          404,
          {
            actorId: id,
            hint: 'The actor profile might have been removed or the ID is incorrect. Try searching by name instead.'
          }
        );
      }
      
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get actor movie credits
  getMovieCredits: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/person/${id}/movie_credits?language=en-US`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get actor TV credits
  getTVCredits: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/person/${id}/tv_credits?language=en-US`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get actor combined credits (movies + TV)
  getCombinedCredits: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/person/${id}/combined_credits?language=en-US`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Get actor images
  getImages: async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const data = await fetchFromTMDB(`/person/${id}/images`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
