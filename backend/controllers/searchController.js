import { fetchFromTMDB } from '../config/tmdb.js';
import { ValidationError, NoDataError } from '../utils/errors.js';

export const searchController = {
  // Search movies
  searchMovies: async (req, res, next) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        throw new ValidationError(
          'Search query is required',
          { 
            hint: 'Provide a search term in the "query" parameter. Example: ?query=inception'
          }
        );
      }
      
      if (query.trim().length < 2) {
        throw new ValidationError(
          'Search term must be at least 2 characters long',
          { provided: query, minLength: 2 }
        );
      }
      
      const data = await fetchFromTMDB(`/search/movie?language=en-US&query=${encodeURIComponent(query)}&page=1`);
      
      if (!data.results || data.results.length === 0) {
        throw new NoDataError(query);
      }
      
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Search TV shows
  searchTVShows: async (req, res, next) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        throw new ValidationError(
          'Search query is required',
          { hint: 'Provide a search term in the "query" parameter.' }
        );
      }
      
      if (query.trim().length < 2) {
        throw new ValidationError(
          'Search term must be at least 2 characters long',
          { provided: query, minLength: 2 }
        );
      }
      
      const data = await fetchFromTMDB(`/search/tv?language=en-US&query=${encodeURIComponent(query)}&page=1`);
      
      if (!data.results || data.results.length === 0) {
        throw new NoDataError(query);
      }
      
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Search actors
  searchActors: async (req, res, next) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        throw new ValidationError(
          'Search query is required',
          { hint: 'Provide a search term in the "query" parameter.' }
        );
      }
      
      if (query.trim().length < 2) {
        throw new ValidationError(
          'Search term must be at least 2 characters long',
          { provided: query, minLength: 2 }
        );
      }
      
      const data = await fetchFromTMDB(`/search/person?language=en-US&query=${encodeURIComponent(query)}&page=1`);
      
      if (!data.results || data.results.length === 0) {
        throw new NoDataError(query);
      }
      
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // Multi-search (movies, TV shows, actors)
  multiSearch: async (req, res, next) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        throw new ValidationError(
          'Search query is required',
          { hint: 'Provide a search term in the "query" parameter.' }
        );
      }
      
      if (query.trim().length < 2) {
        throw new ValidationError(
          'Search term must be at least 2 characters long',
          { provided: query, minLength: 2 }
        );
      }
      
      const data = await fetchFromTMDB(`/search/multi?language=en-US&query=${encodeURIComponent(query)}&page=1`);
      
      if (!data.results || data.results.length === 0) {
        throw new NoDataError(query);
      }
      
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
