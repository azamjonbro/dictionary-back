import StoreItem from '../models/StoreItem.js';
import User from '../models/User.js';

export const getItems = async (req, res) => {
  try {
    const items = await StoreItem.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching marketplace items', error: error.message });
  }
};

export const buyItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.id;

    const item = await StoreItem.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.unlockedItems.includes(itemId)) {
      return res.status(400).json({ message: 'Item already purchased' });
    }

    if (user.coins < item.cost) {
      return res.status(400).json({ message: 'Not enough coins' });
    }

    user.coins -= item.cost;
    user.unlockedItems.push(itemId);

    // If it's a verification or badge, apply instantly
    if (item.type === 'verification') {
      user.isVerified = true;
    } else if (item.type === 'badge') {
      if (!user.badges.includes(item.name)) {
        user.badges.push(item.name);
      }
    }

    await user.save();
    res.status(200).json({ message: 'Item purchased successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error buying item', error: error.message });
  }
};

export const equipItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.id;

    const item = await StoreItem.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const user = await User.findById(userId);
    
    // Check if unlocked (or if cost is 0 and it's free)
    if (!user.unlockedItems.includes(itemId) && item.cost > 0) {
      return res.status(400).json({ message: 'You do not own this item' });
    }

    // Apply settings
    if (item.type === 'frame') {
      user.settings.avatarFrame = item.refId; // assuming refId stores the CSS class or URL of the frame
    } else if (item.type === 'theme') {
      // For themes, refId could be 'dark', 'light', or a JSON string of colors
      try {
        const themeData = JSON.parse(item.refId);
        user.settings.theme = themeData.theme || user.settings.theme;
        user.settings.themeBg = themeData.themeBg || user.settings.themeBg;
        user.settings.themeText = themeData.themeText || user.settings.themeText;
        user.settings.accentColor = themeData.accentColor || user.settings.accentColor;
      } catch (e) {
        user.settings.theme = item.refId; // fallback
      }
    }

    await user.save();
    res.status(200).json({ message: 'Item equipped successfully', settings: user.settings });
  } catch (error) {
    res.status(500).json({ message: 'Error equipping item', error: error.message });
  }
};
