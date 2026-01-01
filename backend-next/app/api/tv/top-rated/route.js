import { fetchFromTMDB, validatePage } from '@/lib/tmdb';
import { errorResponse } from '@/lib/errors';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = validatePage(searchParams.get('page'));
    
    const data = await fetchFromTMDB(`/tv/top_rated?language=en-US&page=${page}`);
    return Response.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
