import express from 'express';
import { getAllUsers, updateUserStatus, updateUserPremium, addCoinPack, updateCoinPack, deleteCoinPack, addStoreItem, updateStoreItem, deleteStoreItem } from '../controllers/adminController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(requireAuth, requireAdmin);

router.get('/users', getAllUsers);
router.put('/users/status', updateUserStatus);
router.put('/users/premium', updateUserPremium);

// Coin Pack Management
router.post('/coin-packs', addCoinPack);
router.put('/coin-packs', updateCoinPack);
router.delete('/coin-packs/:id', deleteCoinPack);

// Store Item Management
router.post('/store-items', addStoreItem);
router.put('/store-items', updateStoreItem);
router.delete('/store-items/:id', deleteStoreItem);

export default router;
