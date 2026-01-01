import { fetchFromTMDB, validateId, validatePage } from '@/lib/tmdb';
import { errorResponse, InvalidParameterError } from '@/lib/errors';

export async function GET(request, { params }) {
  try {
    const id = validateId(params.id);
    if (!id) {
      throw new InvalidParameterError('id', params.id, 'positive integer');
    }
    
    const { searchParams } = new URL(request.url);
    const page = validatePage(searchParams.get('page'));
    
    const data = await fetchFromTMDB(`/movie/${id}/similar?language=en-US&page=${page}`);
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
