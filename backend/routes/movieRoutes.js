import express from 'express';
import { movieController } from '../controllers/movieController.js';
import { recommendationService } from '../services/recommendationService.js';
import { ValidationError, AppError } from '../utils/errors.js';

const router = express.Router();

// List endpoints
router.get('/popular', movieController.getPopular);
router.get('/top-rated', movieController.getTopRated);
router.get('/trending', movieController.getTrending);
router.get('/upcoming', movieController.getUpcoming);
router.get('/now-playing', movieController.getNowPlaying);
router.get('/genres', movieController.getGenres);
router.get('/discover', movieController.discover);

// Custom recommendations endpoint
router.post('/recommendations/personalized', async (req, res, next) => {
  try {
    const { watchlist } = req.body;
    
    if (!watchlist) {
      throw new ValidationError(
        'Watchlist is required for personalized recommendations',
        { hint: 'Send a JSON body with a "watchlist" array of movie objects.' }
      );
    }
    
    if (!Array.isArray(watchlist)) {
      throw new ValidationError(
        'Watchlist must be an array',
        { provided: typeof watchlist, expected: 'array' }
      );
    }
    
    const recommendations = await recommendationService.getPersonalizedRecommendations(watchlist);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

router.get('/recommendations/trending', async (req, res, next) => {
  try {
    const recommendations = await recommendationService.getTrendingRecommendations();
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

// Genre-specific
router.get('/genre/:genreId', movieController.getByGenre);

// Single movie endpoints
router.get('/:id', movieController.getDetails);
router.get('/:id/credits', movieController.getCredits);
router.get('/:id/reviews', movieController.getReviews);
router.get('/:id/similar', movieController.getSimilar);
router.get('/:id/recommendations', movieController.getRecommendations);
router.get('/:id/videos', movieController.getVideos);
router.get('/:id/watch-providers', movieController.getWatchProviders);

export default router;
