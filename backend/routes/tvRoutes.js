import express from 'express';
import { tvController } from '../controllers/tvController.js';

const router = express.Router();

// List endpoints
router.get('/popular', tvController.getPopular);
router.get('/top-rated', tvController.getTopRated);
router.get('/trending', tvController.getTrending);
router.get('/upcoming', tvController.getUpcoming);
router.get('/genres', tvController.getGenres);

// Genre-specific
router.get('/genre/:genreId', tvController.getByGenre);

// Single TV show endpoints
router.get('/:id', tvController.getDetails);
router.get('/:id/credits', tvController.getCredits);
router.get('/:id/reviews', tvController.getReviews);
router.get('/:id/similar', tvController.getSimilar);
router.get('/:id/recommendations', tvController.getRecommendations);
router.get('/:id/videos', tvController.getVideos);
router.get('/:id/watch-providers', tvController.getWatchProviders);

export default router;
