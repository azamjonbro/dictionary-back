import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password -email -role -status');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { filter } = req.query; // daily, weekly, monthly, yearly
    // For now, returning top users by coins/correctAnswers (all-time) since date-based tracking would require more complex querying
    // Just sorting by correct answers descending
    const users = await User.find({ role: 'user', status: 'approved' })
      .sort({ correctAnswers: -1, coins: -1 })
      .limit(50)
      .select('username settings isVerified badges coins correctAnswers achievements activityStats');
      
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};
