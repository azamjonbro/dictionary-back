import express from 'express';
import { uploadDictionary } from '../controllers/dictionaryController.js';

const router = express.Router();

router.post('/upload-json', uploadDictionary);

export default router;
