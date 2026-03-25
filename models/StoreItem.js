import mongoose from 'mongoose';

const storeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  type: { type: String, enum: ['category', 'theme', 'powerup'], default: 'category' },
  refId: { type: String }, // For example, the category name or ID
  emoji: { type: String, default: '🎁' }
}, { timestamps: true });

export default mongoose.model('StoreItem', storeItemSchema);
