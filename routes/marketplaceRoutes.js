import express from 'express';
import { getItems, buyItem, equipItem } from '../controllers/marketplaceController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getItems);
router.post('/buy', requireAuth, buyItem);
router.post('/equip', requireAuth, equipItem);

export default router;
