import express from 'express';
import { getRandomWord, answerQuiz, getCustomRandomWord } from '../controllers/quizController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/random-word', requireAuth, getRandomWord);
router.post('/custom-random-word', requireAuth, getCustomRandomWord);
router.post('/answer', requireAuth, answerQuiz);

export default router;
