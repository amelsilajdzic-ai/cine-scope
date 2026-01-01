import { fetchFromTMDB, validatePage } from '@/lib/tmdb';
import { errorResponse } from '@/lib/errors';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = validatePage(searchParams.get('page'));
    
    // Build query params from request
    const params = new URLSearchParams({
      language: 'en-US',
      sort_by: searchParams.get('sort_by') || 'popularity.desc',
      page: String(page),
    });
    
    // Add optional filters
    const filters = ['with_genres', 'year', 'primary_release_year', 'vote_average.gte', 'vote_count.gte'];
    filters.forEach(filter => {
      const value = searchParams.get(filter);
      if (value) params.set(filter, value);
    });
    
    const data = await fetchFromTMDB(`/discover/movie?${params.toString()}`);
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
