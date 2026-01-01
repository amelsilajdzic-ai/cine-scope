/**
 * Custom error classes for meaningful API error responses
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

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
 * Format error for API response
 */
export function formatErrorResponse(error) {
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

  return {
    error: {
      message: 'An unexpected error occurred',
      type: 'UnexpectedError',
      statusCode: 500,
      details: {
        hint: 'Please try again later.'
      },
      timestamp: new Date().toISOString(),
    }
  };
}

/**
 * Get appropriate error from TMDB API response
 */
export function getTmdbError(statusCode) {
  return new ApiError('TMDB API', statusCode, {
    documentationUrl: 'https://www.themoviedb.org/settings/api'
  });
}

/**
 * Create error Response for Next.js API routes
 */
export function errorResponse(error) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  return Response.json(formatErrorResponse(error), { status: statusCode });
}
