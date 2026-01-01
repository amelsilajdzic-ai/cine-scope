import { fetchFromTMDB } from '../config/tmdb.js';
import { AppError, ValidationError } from '../utils/errors.js';

/**
 * Custom recommendation engine
 * Provides content-based filtering based on:
 * - Genre similarity
 * - Rating proximity
 * - Release date proximity
 */

export const recommendationService = {
  /**
   * Generate personalized recommendations based on user's watchlist
   * @param {Array} watchlistMovies - Array of movie objects from user's watchlist
   * @returns {Promise<Object>} - Recommended movies
   */
  getPersonalizedRecommendations: async (watchlistMovies) => {
    try {
      if (!watchlistMovies || !Array.isArray(watchlistMovies) || watchlistMovies.length === 0) {
        // Fallback to popular movies when watchlist is empty
        console.log('Empty watchlist, returning popular movies as recommendations');
        return await fetchFromTMDB('/movie/popular?language=en-US&page=1');
      }

      // Extract favorite genres from watchlist
      const genreMap = {};
      watchlistMovies.forEach(movie => {
        if (movie && movie.genres && Array.isArray(movie.genres)) {
          movie.genres.forEach(genre => {
            if (genre && genre.id) {
              genreMap[genre.id] = (genreMap[genre.id] || 0) + 1;
            }
          });
        } else if (movie && movie.genre_ids && Array.isArray(movie.genre_ids)) {
          // Handle movies with genre_ids instead of genres array
          movie.genre_ids.forEach(genreId => {
            genreMap[genreId] = (genreMap[genreId] || 0) + 1;
          });
        }
      });

      // Check if we found any genres
      const genreEntries = Object.entries(genreMap);
      if (genreEntries.length === 0) {
        console.log('No genres found in watchlist, returning popular movies');
        return await fetchFromTMDB('/movie/popular?language=en-US&page=1');
      }

      // Get top 3 genres
      const topGenres = genreEntries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => id);

      // Discover movies with those genres
      const genreIds = topGenres.join(',');
      const recommendations = await fetchFromTMDB(
        `/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=100&with_genres=${genreIds}&page=1`
      );

      return recommendations;
    } catch (error) {
      console.error('Personalized recommendation error:', error.message);
      // Re-throw AppError instances, wrap others
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'Failed to generate personalized recommendations',
        500,
        { hint: 'Please try again later or browse trending movies instead.' }
      );
    }
  },

  /**
   * Calculate similarity score between two movies
   * @param {Object} movie1 
   * @param {Object} movie2 
   * @returns {Number} - Similarity score (0-1)
   */
  calculateSimilarity: (movie1, movie2) => {
    let score = 0;
    let factors = 0;

    // Genre similarity (40% weight)
    if (movie1.genres && movie2.genres) {
      const genres1 = new Set(movie1.genres.map(g => g.id));
      const genres2 = new Set(movie2.genres.map(g => g.id));
      const intersection = [...genres1].filter(g => genres2.has(g));
      const union = new Set([...genres1, ...genres2]);
      score += (intersection.length / union.size) * 0.4;
      factors += 0.4;
    }

    // Rating proximity (30% weight)
    if (movie1.vote_average && movie2.vote_average) {
      const ratingDiff = Math.abs(movie1.vote_average - movie2.vote_average);
      const ratingSimilarity = Math.max(0, 1 - (ratingDiff / 10));
      score += ratingSimilarity * 0.3;
      factors += 0.3;
    }

    // Release year proximity (30% weight)
    if (movie1.release_date && movie2.release_date) {
      const year1 = new Date(movie1.release_date).getFullYear();
      const year2 = new Date(movie2.release_date).getFullYear();
      const yearDiff = Math.abs(year1 - year2);
      const yearSimilarity = Math.max(0, 1 - (yearDiff / 50));
      score += yearSimilarity * 0.3;
      factors += 0.3;
    }

    return factors > 0 ? score / factors : 0;
  },

  /**
   * Get trending recommendations with boost for higher ratings
   * @returns {Promise<Object>} - Trending movies sorted by rating
   */
  getTrendingRecommendations: async () => {
    try {
      const trending = await fetchFromTMDB('/trending/movie/week');
      
      // Sort by vote_average to prioritize quality
      if (trending.results && Array.isArray(trending.results)) {
        trending.results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      }
      
      return trending;
    } catch (error) {
      console.error('Trending recommendation error:', error.message);
      // Re-throw AppError instances, wrap others
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'Failed to fetch trending recommendations',
        500,
        { hint: 'Please try again later.' }
      );
    }
  },
};
