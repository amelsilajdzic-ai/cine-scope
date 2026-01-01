import { AppError, getTmdbError } from './errors';

/**
 * TMDB API Configuration
 */
const TMDB_CONFIG = {
  API_KEY: process.env.TMDB_API_KEY,
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
};

/**
 * Validates that the API key is configured
 */
function validateApiKey() {
  if (!TMDB_CONFIG.API_KEY) {
    throw new AppError(
      'TMDB API key is not configured',
      500,
      {
        hint: 'Set TMDB_API_KEY in your .env.local file. Get a free key at https://www.themoviedb.org/settings/api',
        documentation: 'https://developers.themoviedb.org/3/getting-started/introduction'
      }
    );
  }
}

/**
 * Fetch data from TMDB API
 * @param {string} endpoint - API endpoint (e.g., '/movie/popular')
 * @returns {Promise<Object>} - JSON response from TMDB
 */
export async function fetchFromTMDB(endpoint) {
  validateApiKey();
  
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TMDB_CONFIG.BASE_URL}${endpoint}${separator}api_key=${TMDB_CONFIG.API_KEY}`;
  
  try {
    const response = await fetch(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      const error = getTmdbError(response.status);
      
      try {
        const errorData = await response.json();
        if (errorData.status_message) {
          error.details.tmdbMessage = errorData.status_message;
        }
      } catch {
        // Ignore JSON parse errors
      }
      
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new AppError(
        'Unable to connect to TMDB API',
        503,
        { hint: 'The TMDB service may be temporarily unavailable.' }
      );
    }
    
    if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
      throw new AppError(
        'Request to TMDB timed out',
        504,
        { hint: 'The request took too long. Please try again.' }
      );
    }
    
    console.error('TMDB fetch error:', error.message);
    throw new AppError(
      'Failed to fetch data from TMDB',
      500,
      { hint: 'An unexpected error occurred.' }
    );
  }
}

/**
 * Validate ID parameter
 */
export function validateId(id) {
  const numId = parseInt(id, 10);
  if (!id || isNaN(numId) || numId <= 0) {
    return null;
  }
  return numId;
}

/**
 * Validate page parameter
 */
export function validatePage(page) {
  const numPage = parseInt(page, 10);
  if (isNaN(numPage) || numPage < 1) {
    return 1;
  }
  return Math.min(numPage, 500);
}
