import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  coins: { type: Number, default: 0 },
  failedWords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Word' }],
  correctAnswers: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isPremium: { type: Boolean, default: false },
  dailyCoinsEarned: { type: Number, default: 0 },
  lastCoinEarnedDate: { type: Date },
  unlockedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoreItem' }],
  settings: {
    theme: { type: String, default: 'light' },
    themeBg: { type: String, default: '#ffffff' },
    themeText: { type: String, default: '#1f2937' },
    accentColor: { type: String, default: '#6366f1' },
    avatar: { type: String, default: '' },
    avatarFrame: { type: String, default: '' },
    avatarBg: { type: String, default: '#6366f1' },
    fontSize: { type: String, default: 'medium' }
  },
  badges: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  achievements: [{
    name: { type: String },
    dateEarned: { type: Date, default: Date.now }
  }],
  activityStats: {
    quizzesTaken: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
