import { fetchFromTMDB, validateId } from '@/lib/tmdb';
import { errorResponse, InvalidParameterError, AppError } from '@/lib/errors';

export async function GET(request, { params }) {
  try {
    const id = validateId(params.id);
    if (!id) {
      throw new InvalidParameterError('id', params.id, 'positive integer');
    }
    
    const data = await fetchFromTMDB(`/tv/${id}?language=en-US`);
    
    if (!data.id) {
      throw new AppError(
        `TV Show with ID ${id} not found`,
        404,
        { 
          tvShowId: id,
          hint: 'The TV show might have been removed or the ID is incorrect.'
        }
      );
    }
    
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
