/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable API-only mode - no React pages needed
  reactStrictMode: true,
  
  // Configure for API-only usage
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },

  // Redirect root to health check
  async redirects() {
    return [
      {
        source: '/',
        destination: '/api/health',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
