export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Next.js Backend API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    endpoints: {
      movies: '/api/movies/*',
      tv: '/api/tv/*',
      actors: '/api/actors/*',
      search: '/api/search/*',
    }
  });
}
