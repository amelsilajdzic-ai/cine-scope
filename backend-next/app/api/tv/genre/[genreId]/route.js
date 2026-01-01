import { fetchFromTMDB, validateId, validatePage } from '@/lib/tmdb';
import { errorResponse, InvalidParameterError } from '@/lib/errors';

export async function GET(request, { params }) {
  try {
    const genreId = validateId(params.genreId);
    if (!genreId) {
      throw new InvalidParameterError('genreId', params.genreId, 'positive integer');
    }
    
    const { searchParams } = new URL(request.url);
    const page = validatePage(searchParams.get('page'));
    
    const data = await fetchFromTMDB(
      `/discover/tv?language=en-US&with_genres=${genreId}&page=${page}`
    );
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
