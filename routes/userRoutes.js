import express from 'express';
import { 
  getProfile, getFailedWords, buyPremium, getLeaderboard, 
  getCoinPacks, buyCoins, getStoreItems, buyStoreItem, updateSettings 
} from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', requireAuth, getProfile);
router.get('/failed-words', requireAuth, getFailedWords);
router.post('/buy-premium', requireAuth, buyPremium);
router.get('/leaderboard', getLeaderboard);
router.get('/coin-packs', requireAuth, getCoinPacks);
router.post('/buy-coins', requireAuth, buyCoins);
router.get('/store-items', requireAuth, getStoreItems);
router.post('/buy-store-item', requireAuth, buyStoreItem);
router.put('/settings', requireAuth, updateSettings);

export default router;
