import { fetchFromTMDB } from '@/lib/tmdb';
import { errorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const data = await fetchFromTMDB('/trending/movie/week');
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
