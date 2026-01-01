import { fetchFromTMDB, validateId } from '@/lib/tmdb';
import { errorResponse, InvalidParameterError } from '@/lib/errors';

export async function GET(request, { params }) {
  try {
    const id = validateId(params.id);
    if (!id) {
      throw new InvalidParameterError('id', params.id, 'positive integer');
    }
    
    const data = await fetchFromTMDB(`/person/${id}/tv_credits?language=en-US`);
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
