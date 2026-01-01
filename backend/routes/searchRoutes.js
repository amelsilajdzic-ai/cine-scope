import express from 'express';
import { searchController } from '../controllers/searchController.js';

const router = express.Router();

router.get('/movies', searchController.searchMovies);
router.get('/tv', searchController.searchTVShows);
router.get('/actors', searchController.searchActors);
router.get('/multi', searchController.multiSearch);

export default router;
