/**
 * Custom error classes and utilities for meaningful error responses
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Validation error - bad request from client
 */
export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error - resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource, id) {
    super(
      `${resource} not found`,
      404,
      { hint: `This ${resource.toLowerCase()} doesn't exist or may have been removed.` }
    );
    this.name = 'NotFoundError';
  }
}

/**
 * API error - external API call failed
 */
export class ApiError extends AppError {
  constructor(apiName, statusCode, details = {}) {
    const messages = {
      401: 'Authentication failed',
      403: 'Access denied',
      404: 'Content not found',
      429: 'Too many requests. Please try again later',
      500: 'Service temporarily unavailable',
      503: 'Service currently unavailable',
    };

    const message = messages[statusCode] || 'An error occurred';
    super(message, statusCode, details);
    this.name = 'ApiError';
  }
}

/**
 * Invalid parameter error
 */
export class InvalidParameterError extends ValidationError {
  constructor(paramName, value, expectedType) {
    super(
      `Invalid parameter: ${paramName}`,
      {
        parameter: paramName,
        provided: value,
        expectedType,
        hint: `${paramName} should be of type ${expectedType}, but got "${typeof value}"`
      }
    );
    this.name = 'InvalidParameterError';
  }
}

/**
 * No data error - empty results
 */
export class NoDataError extends AppError {
  constructor(searchTerm) {
    super(
      `No results found for "${searchTerm}"`,
      404,
      {
        searchTerm,
        hint: 'Try a different search term, check spelling, or browse popular content instead.'
      }
    );
    this.name = 'NoDataError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super(
      `Too many requests. Please wait before trying again.`,
      429,
      {
        retryAfter,
        hint: `Wait ${retryAfter} seconds before making another request.`
      }
    );
    this.name = 'RateLimitError';
  }
}

/**
 * Service unavailable error
 */
export class ServiceUnavailableError extends AppError {
  constructor(serviceName) {
    super(
      `${serviceName} is currently unavailable`,
      503,
      {
        service: serviceName,
        hint: 'The service is temporarily down for maintenance. Please try again shortly.'
      }
    );
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Format error response
 */
export const formatErrorResponse = (error) => {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        type: error.name,
        statusCode: error.statusCode,
        details: error.details,
        timestamp: error.timestamp,
      }
    };
  }

  // Fallback for generic errors
  return {
    error: {
      message: 'An unexpected error occurred',
      type: 'UnexpectedError',
      statusCode: 500,
      details: {
        hint: 'Our team has been notified. Please try again later.'
      },
      timestamp: new Date().toISOString(),
    }
  };
};

/**
 * Get appropriate error from TMDB API response
 */
export const getTmdbError = (statusCode) => {
  return new ApiError('TMDB API', statusCode, {
    documentationUrl: 'https://www.themoviedb.org/settings/api'
  });
};
