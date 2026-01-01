import { fetchFromTMDB } from '@/lib/tmdb';
import { errorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const data = await fetchFromTMDB('/genre/movie/list?language=en-US');
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
