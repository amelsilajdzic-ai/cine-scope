import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import movieRoutes from './routes/movieRoutes.js';
import tvRoutes from './routes/tvRoutes.js';
import actorRoutes from './routes/actorRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import { formatErrorResponse, AppError } from './utils/errors.js';
import { generateErrorHTML } from './utils/errorPages.js';
import { validateApiKey } from './config/tmdb.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Validate configuration on startup
const validateConfig = () => {
  const errors = [];
  
  if (!process.env.TMDB_API_KEY) {
    errors.push('❌ TMDB_API_KEY is not set in .env file');
  } else {
    console.log('✅ TMDB API key configured');
  }
  
  if (errors.length > 0) {
    console.error('\n⚠️  Configuration Errors:');
    errors.forEach(err => console.error(`   ${err}`));
    console.error('\n📝 Please check your .env file. See .env.example for required variables.\n');
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Run validation
validateConfig();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/tv', tvRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  const userAgent = req.get('User-Agent') || '';
  const isBrowser = userAgent.includes('Mozilla') && !userAgent.includes('fetch');
  const isApiRequest = !isBrowser;
  
  const error = new AppError(
    `The endpoint ${req.method} ${req.path} does not exist`,
    404,
    { 
      method: req.method,
      path: req.path,
      hint: 'Check the API documentation for available endpoints.'
    }
  );

  if (isApiRequest) {
    return res.status(404).json(formatErrorResponse(error));
  }

  res.setHeader('Content-Type', 'text/html');
  res.status(404).send(generateErrorHTML(error));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log errors in development only
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.message);
  }

  // Determine if request is from browser or API client
  const userAgent = req.get('User-Agent') || '';
  const isBrowser = userAgent.includes('Mozilla');
  
  if (err instanceof AppError) {
    const response = formatErrorResponse(err);
    
    if (!isBrowser) {
      return res.status(err.statusCode).json(response);
    }
    res.setHeader('Content-Type', 'text/html');
    return res.status(err.statusCode).send(generateErrorHTML(err));
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    const error = new AppError(
      'Invalid JSON in request body',
      400,
      { hint: 'Ensure your request body is valid JSON.' }
    );
    
    if (!isBrowser) {
      return res.status(400).json(formatErrorResponse(error));
    }
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send(generateErrorHTML(error));
  }

  // Default error
  console.error('Unexpected error:', err);
  const error = new AppError(
    'An unexpected error occurred on the server',
    500,
    { 
      errorId: Math.random().toString(36).substr(2, 9),
      hint: 'Our team has been notified. Please try again later.' 
    }
  );

  if (!isBrowser) {
    return res.status(500).json(formatErrorResponse(error));
  }
  res.setHeader('Content-Type', 'text/html');
  return res.status(500).send(generateErrorHTML(error));
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
