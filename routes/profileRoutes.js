import express from 'express';
import { getProfile, getLeaderboard } from '../controllers/profileController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get leaderboard
router.get('/leaderboard', requireAuth, getLeaderboard);

// Get user profile by username
router.get('/:username', requireAuth, getProfile);

export default router;
