import User from '../models/User.js';
import CoinPack from '../models/CoinPack.js';
import StoreItem from '../models/StoreItem.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching users' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.status = status;
    await user.save();
    
    res.status(200).json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error updating status' });
  }
};

export const updateUserPremium = async (req, res) => {
  try {
    const { id, isPremium } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.isPremium = isPremium;
    await user.save();
    
    res.status(200).json({ message: `User premium status updated to ${isPremium}`, user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error updating premium' });
  }
};

// Coin Pack Management
export const addCoinPack = async (req, res) => {
  try {
    const { name, coins, price, emoji, popular } = req.body;
    const newPack = new CoinPack({ name, coins, price, emoji, popular });
    await newPack.save();
    res.status(201).json({ message: 'Coin pack added successfully', pack: newPack });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add coin pack' });
  }
};

export const updateCoinPack = async (req, res) => {
  try {
    const { id, name, coins, price, emoji, popular } = req.body;
    const pack = await CoinPack.findByIdAndUpdate(id, { name, coins, price, emoji, popular }, { new: true });
    if (!pack) return res.status(404).json({ error: 'Pack not found' });
    res.status(200).json({ message: 'Coin pack updated', pack });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coin pack' });
  }
};

export const deleteCoinPack = async (req, res) => {
  try {
    const { id } = req.params;
    const pack = await CoinPack.findByIdAndDelete(id);
    if (!pack) return res.status(404).json({ error: 'Pack not found' });
    res.status(200).json({ message: 'Coin pack deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coin pack' });
  }
};

// Store Item Management
export const addStoreItem = async (req, res) => {
  try {
    const { name, description, cost, type, refId, emoji } = req.body;
    const newItem = new StoreItem({ name, description, cost, type, refId, emoji });
    await newItem.save();
    res.status(201).json({ message: 'Store item added successfully', item: newItem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add store item' });
  }
};

export const updateStoreItem = async (req, res) => {
  try {
    const { id, name, description, cost, type, refId, emoji } = req.body;
    const item = await StoreItem.findByIdAndUpdate(id, { name, description, cost, type, refId, emoji }, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Store item updated', item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update store item' });
  }
};

export const deleteStoreItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await StoreItem.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Store item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete store item' });
  }
};
