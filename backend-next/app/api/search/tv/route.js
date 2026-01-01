import { fetchFromTMDB, validatePage } from '@/lib/tmdb';
import { errorResponse, ValidationError, NoDataError } from '@/lib/errors';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = validatePage(searchParams.get('page'));
    
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
    
    const data = await fetchFromTMDB(
      `/search/tv?language=en-US&query=${encodeURIComponent(query)}&page=${page}`
    );
    
    if (!data.results || data.results.length === 0) {
      throw new NoDataError(query);
    }
    
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
