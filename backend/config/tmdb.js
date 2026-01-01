import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTmdbError, AppError } from '../utils/errors.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory (one level up from backend)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * TMDB API Configuration
 * API Key is loaded from environment variables for security
 */
export const TMDB_CONFIG = {
  API_KEY: process.env.TMDB_API_KEY,
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
};

/**
 * Validates that the API key is configured
 * @throws {AppError} If API key is missing
 */
export const validateApiKey = () => {
  if (!TMDB_CONFIG.API_KEY) {
    throw new AppError(
      'TMDB API key is not configured',
      500,
      {
        hint: 'Set TMDB_API_KEY in your .env file. Get a free key at https://www.themoviedb.org/settings/api',
        documentation: 'https://developers.themoviedb.org/3/getting-started/introduction'
      }
    );
  }
};

/**
 * Fetch data from TMDB API
 * @param {string} endpoint - API endpoint (e.g., '/movie/popular')
 * @returns {Promise<Object>} - JSON response from TMDB
 * @throws {AppError} On API errors or network failures
 */
export const fetchFromTMDB = async (endpoint) => {
  // Validate API key before making request
  validateApiKey();
  
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TMDB_CONFIG.BASE_URL}${endpoint}${separator}api_key=${TMDB_CONFIG.API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // Get specific error based on status code
      const error = getTmdbError(response.status);
      
      // Try to extract more details from TMDB response
      try {
        const errorData = await response.json();
        if (errorData.status_message) {
          error.details.tmdbMessage = errorData.status_message;
        }
      } catch {
        // Ignore JSON parse errors for error response
      }
      
      throw error;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw AppError instances (already formatted)
    if (error instanceof AppError || (error.statusCode && error.details)) {
      throw error;
    }
    
    // Handle network errors (timeout, DNS, connection refused, etc.)
    if (error.code === 'ECONNREFUSED') {
      throw new AppError(
        'Unable to connect to TMDB API',
        503,
        {
          hint: 'The TMDB service may be temporarily unavailable. Please try again later.',
          errorCode: error.code
        }
      );
    }
    
    if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
      throw new AppError(
        'Request to TMDB timed out',
        504,
        {
          hint: 'The request took too long. Please try again.',
          errorCode: error.code || 'TIMEOUT'
        }
      );
    }
    
    if (error.code === 'ENOTFOUND') {
      throw new AppError(
        'Unable to resolve TMDB API domain',
        503,
        {
          hint: 'Check your internet connection or DNS settings.',
          errorCode: error.code
        }
      );
    }
    
    // Generic network error
    console.error('TMDB fetch error:', error.message);
    throw new AppError(
      'Failed to fetch data from TMDB',
      500,
      {
        hint: 'An unexpected error occurred while communicating with TMDB.',
        errorType: error.name || 'NetworkError'
      }
    );
  }
};
