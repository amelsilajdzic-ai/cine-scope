import { fetchFromTMDB, validateId } from '@/lib/tmdb';
import { errorResponse, InvalidParameterError } from '@/lib/errors';

export async function GET(request, { params }) {
  try {
    const id = validateId(params.id);
    if (!id) {
      throw new InvalidParameterError('id', params.id, 'positive integer');
    }
    
    // Get TMDB recommendations
    const tmdbRecs = await fetchFromTMDB(`/movie/${id}/recommendations?language=en-US&page=1`);
    
    // If we have results, return them
    if (tmdbRecs.results && tmdbRecs.results.length > 0) {
      return Response.json(tmdbRecs);
    }
    
    // Fallback: get movie details and discover by genre
    const movieDetails = await fetchFromTMDB(`/movie/${id}?language=en-US`);
    const genreIds = movieDetails.genres?.map(g => g.id).join(',') || '';
    
    if (genreIds) {
      const fallbackRecs = await fetchFromTMDB(
        `/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=${genreIds}&page=1`
      );
      return Response.json(fallbackRecs);
    }
    
    return Response.json({ results: [], total_results: 0, page: 1 });
  } catch (error) {
    return errorResponse(error);
  }
}
