import express from 'express';
import { actorController } from '../controllers/actorController.js';

const router = express.Router();

// List endpoints
router.get('/popular', actorController.getPopular);

// Single actor endpoints
router.get('/:id', actorController.getDetails);
router.get('/:id/movie-credits', actorController.getMovieCredits);
router.get('/:id/tv-credits', actorController.getTVCredits);
router.get('/:id/combined-credits', actorController.getCombinedCredits);
router.get('/:id/images', actorController.getImages);

export default router;
