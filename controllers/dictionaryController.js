import Word from '../models/Word.js';

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
