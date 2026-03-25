import User from '../models/User.js';
import CoinPack from '../models/CoinPack.js';
import StoreItem from '../models/StoreItem.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('unlockedItems');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFailedWords = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('failedWords');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user.failedWords);
  } catch (error) {
    console.error('Get failed words error:', error);
    res.status(500).json({ error: 'Internal server error while fetching failed words' });
  }
};

export const buyPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isPremium = true;
    await user.save();

    res.status(200).json({ message: 'To\'lov muvaffaqiyatli! Premium faollashdi.', user });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'To\'lov vaqtida xatolik yuz berdi' });
  }
};

export const getCoinPacks = async (req, res) => {
  try {
    const packs = await CoinPack.find();
    res.status(200).json(packs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coin packs' });
  }
};

export const buyCoins = async (req, res) => {
  try {
    const { packId } = req.body;
    const pack = await CoinPack.findById(packId);
    if (!pack) return res.status(400).json({ error: 'Noto\'g\'ri paket tanlandi.' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });

    user.coins = (user.coins || 0) + pack.coins;
    await user.save();

    res.status(200).json({
      message: `${pack.coins} ta coin hisobingizga qo'shildi! 🎉`,
      coins: user.coins,
      added: pack.coins
    });
  } catch (error) {
    console.error('Buy coins error:', error);
    res.status(500).json({ error: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
  }
};

export const getStoreItems = async (req, res) => {
  try {
    const items = await StoreItem.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store items' });
  }
};

export const buyStoreItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = await StoreItem.findById(itemId);
    if (!item) return res.status(400).json({ error: 'Ma\'lumot topilmadi.' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });

    if (user.coins < item.cost) {
      return res.status(400).json({ error: 'Coinlar yetarli emas.' });
    }

    if (user.unlockedItems.includes(itemId)) {
      return res.status(400).json({ error: 'Bu narsa allaqachon sotib olingan.' });
    }

    user.coins -= item.cost;
    user.unlockedItems.push(itemId);
    await user.save();

    res.status(200).json({
      message: `${item.name} muvaffaqiyatli sotib olindi! 🎉`,
      coins: user.coins,
      item
    });
  } catch (error) {
    console.error('Buy store item error:', error);
    res.status(500).json({ error: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.settings = { ...user.settings, ...settings };
    await user.save();

    res.status(200).json({ message: 'Sozlamalar saqlandi!', settings: user.settings });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find()
      .select('username coins correctAnswers')
      .sort({ coins: -1 })
      .limit(10);
    res.status(200).json(topUsers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
