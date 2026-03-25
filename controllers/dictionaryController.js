import Word from '../models/Word.js';
import { GoogleGenAI } from '@google/genai';

export const uploadDictionary = async (req, res) => {
  try {
    const { words } = req.body;

    if (!words || !Array.isArray(words)) {
      return res.status(400).json({ error: 'Payload must contain a "words" array' });
    }

    // Attempt to insert words, ignore duplicates based on unique indices
    const operations = words.map(w => ({
      updateOne: {
        filter: { word_en: w.word_en },
        update: { $set: { word_en: w.word_en, word_uz: w.word_uz } },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await Word.bulkWrite(operations);
    }

    const wordEns = words.map(w => w.word_en);
    const savedWords = await Word.find({ word_en: { $in: wordEns } });

    res.status(200).json({ 
      message: `Successfully processed ${words.length} words.`,
      words: savedWords 
    });
  } catch (error) {
    console.error('Dictionary upload error:', error);
    res.status(500).json({ error: 'Internal server error while uploading dictionary' });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server missing GEMINI_API_KEY. Please request the admin to set it up.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const fileMimeType = req.file.mimetype;
    const fileData = req.file.buffer.toString('base64');
    
    const prompt = `
Extract all vocabulary words from this dictionary image.
Translate them exactly as written.
Return the result strictly as a JSON array of objects with the keys "word_en" for the English word and "word_uz" for the Uzbek translation. 
Format: [ { "word_en": "Apple", "word_uz": "Olma" } ]
Only return the JSON. No markdown wrappers.`;

    console.log('Sending image to Gemini API...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: fileMimeType, data: fileData } }
          ]
        }
      ],
      config: { responseMimeType: 'application/json' }
    });
    
    const jsonString = response.text;
    let words;
    try {
      words = JSON.parse(jsonString);
    } catch (err) {
      const cleaned = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
      words = JSON.parse(cleaned);
    }
    
    if (!words || !Array.isArray(words)) {
      return res.status(400).json({ error: 'AI failed to process image into words array' });
    }

    // Return the words directly without saving to DB
    // The frontend will present them for editing and then call upload-json
    res.status(200).json({ 
      message: `Successfully extracted ${words.length} words from image.`,
      words: words 
    });
  } catch (error) {
    console.error('Dictionary image upload error:', error);
    res.status(500).json({ error: 'Internal server error while uploading image' });
  }
};
