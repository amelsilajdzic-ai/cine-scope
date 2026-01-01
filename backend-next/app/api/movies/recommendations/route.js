import { fetchFromTMDB } from '@/lib/tmdb';
import { errorResponse, ValidationError, AppError } from '@/lib/errors';

// GET: Trending recommendations
export async function GET() {
  try {
    const trending = await fetchFromTMDB('/trending/movie/week');
    
    // Sort by vote_average to prioritize quality
    if (trending.results && Array.isArray(trending.results)) {
      trending.results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    }
    
    return Response.json(trending);
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Personalized recommendations based on watchlist
export async function POST(request) {
  try {
    const body = await request.json();
    const { watchlist } = body;
    
    if (!watchlist) {
      throw new ValidationError(
        'Watchlist is required for personalized recommendations',
        { hint: 'Send a JSON body with a "watchlist" array of movie objects.' }
      );
    }
    
    if (!Array.isArray(watchlist)) {
      throw new ValidationError(
        'Watchlist must be an array',
        { provided: typeof watchlist, expected: 'array' }
      );
    }
    
    if (watchlist.length === 0) {
      // Return popular movies as fallback
      const popular = await fetchFromTMDB('/movie/popular?language=en-US&page=1');
      return Response.json(popular);
    }
    
    // Extract genres from watchlist
    const genreMap = {};
    watchlist.forEach(movie => {
      if (movie?.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach(genre => {
          if (genre?.id) {
            genreMap[genre.id] = (genreMap[genre.id] || 0) + 1;
          }
        });
      } else if (movie?.genre_ids && Array.isArray(movie.genre_ids)) {
        movie.genre_ids.forEach(genreId => {
          genreMap[genreId] = (genreMap[genreId] || 0) + 1;
        });
      }
    });
    
    const genreEntries = Object.entries(genreMap);
    if (genreEntries.length === 0) {
      const popular = await fetchFromTMDB('/movie/popular?language=en-US&page=1');
      return Response.json(popular);
    }
    
    // Get top 3 genres
    const topGenres = genreEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
    
    const genreIds = topGenres.join(',');
    const recommendations = await fetchFromTMDB(
      `/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=100&with_genres=${genreIds}&page=1`
    );
    
    return Response.json(recommendations);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse(new ValidationError('Invalid JSON in request body'));
    }
    return errorResponse(error);
  }
}
