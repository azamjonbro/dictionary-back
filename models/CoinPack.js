import mongoose from 'mongoose';

const coinPackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coins: { type: Number, required: true },
  price: { type: Number, required: true },
  emoji: { type: String, default: '🪙' },
  popular: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('CoinPack', coinPackSchema);
