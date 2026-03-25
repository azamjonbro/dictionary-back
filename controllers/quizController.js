import mongoose from 'mongoose';
import Word from '../models/Word.js';
import User from '../models/User.js';

// Helper to check if limit should be reset (at 00:30)
const shouldResetLimit = (lastDate) => {
  if (!lastDate) return true;
  const now = new Date();
  const resetPoint = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 30, 0);
  
  // If current time is before today's 00:30, the reset happened at yesterday's 00:30
  if (now < resetPoint) {
    resetPoint.setDate(resetPoint.getDate() - 1);
  }
  
  return new Date(lastDate) < resetPoint;
};

export const getRandomWord = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Check reset
    if (shouldResetLimit(user.lastCoinEarnedDate)) {
      user.dailyCoinsEarned = 0;
      await user.save();
    }

    if (!user.isPremium && user.dailyCoinsEarned >= 100) {
      return res.status(403).json({ error: 'LIMIT_REACHED' });
    }

    const totalWords = await Word.countDocuments();
    if (totalWords < 3) {
      return res.status(400).json({ error: 'Not enough words in the dictionary. Please upload more.' });
    }

    const isEngToUz = Math.random() < 0.5;
    const randomWords = await Word.aggregate([{ $sample: { size: 3 } }]);
    
    const correctWord = randomWords[0];
    const questionWord = isEngToUz ? correctWord.word_en : correctWord.word_uz;

    const options = randomWords.map(w => isEngToUz ? w.word_uz : w.word_en);
    options.sort(() => Math.random() - 0.5);

    res.status(200).json({
      wordId: correctWord._id,
      question: questionWord,
      language: isEngToUz ? 'en' : 'uz',
      options
    });
  } catch (error) {
    console.error('Get random word error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomRandomWord = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    // Check reset
    if (shouldResetLimit(user.lastCoinEarnedDate)) {
      user.dailyCoinsEarned = 0;
      await user.save();
    }

    if (!user.isPremium && user.dailyCoinsEarned >= 100) {
      return res.status(403).json({ error: 'LIMIT_REACHED' });
    }

    const { wordIds } = req.body;
    if (!wordIds || wordIds.length < 3) {
      return res.status(400).json({ error: 'Need at least 3 words for this custom quiz.' });
    }

    const objectIds = wordIds.map(id => new mongoose.Types.ObjectId(id));
    const isEngToUz = Math.random() < 0.5;
    
    const randomWords = await Word.aggregate([
      { $match: { _id: { $in: objectIds } } },
      { $sample: { size: 3 } }
    ]);

    if (randomWords.length < 3) {
      return res.status(400).json({ error: 'Not enough words retrieved.' });
    }
    
    const correctWord = randomWords[0];
    const questionWord = isEngToUz ? correctWord.word_en : correctWord.word_uz;
    
    const options = randomWords.map(w => isEngToUz ? w.word_uz : w.word_en);
    options.sort(() => Math.random() - 0.5);

    res.status(200).json({
      wordId: correctWord._id,
      question: questionWord,
      language: isEngToUz ? 'en' : 'uz',
      options
    });
  } catch (error) {
    console.error('Get custom random word error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const answerQuiz = async (req, res) => {
  try {
    const { wordId, selectedOption, language } = req.body;
    const userId = req.user.userId;

    const correctWord = await Word.findById(wordId);
    if (!correctWord) return res.status(404).json({ error: 'Word not found' });

    const isEngToUz = language === 'en';
    const correctAnswerText = isEngToUz ? correctWord.word_uz : correctWord.word_en;
    const isCorrect = selectedOption === correctAnswerText;

    const user = await User.findById(userId);

    // Check reset before processing result
    if (shouldResetLimit(user.lastCoinEarnedDate)) {
      user.dailyCoinsEarned = 0;
    }

    let msg = null;

    if (isCorrect) {
      if (!user.isPremium && user.dailyCoinsEarned >= 100) {
        msg = "LIMIT_REACHED_AWARD"; // Specialized client message
      } else {
        user.coins += 5;
        user.dailyCoinsEarned += 5;
        user.lastCoinEarnedDate = new Date();
        user.correctAnswers += 1;
        
        if (!user.isPremium && user.dailyCoinsEarned >= 100) {
          msg = "Tabriklaymiz, siz kunlik 100 coin ishladingiz! Davom etish uchun Premium xarid qiling.";
        }
      }
      user.failedWords = user.failedWords.filter(id => id.toString() !== wordId.toString());
    } else {
      if (!user.failedWords.includes(wordId)) {
        user.failedWords.push(wordId);
      }
    }

    await user.save();

    res.status(200).json({
      isCorrect,
      correctAnswer: correctAnswerText,
      coins: user.coins,
      dailyCoinsEarned: user.dailyCoinsEarned,
      message: msg
    });
  } catch (error) {
    console.error('Answer quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
