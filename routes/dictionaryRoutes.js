import express from 'express';
import multer from 'multer';
import { uploadDictionary, uploadImage } from '../controllers/dictionaryController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/upload-json', uploadDictionary);
router.post('/upload-image', upload.single('image'), uploadImage);

export default router;
