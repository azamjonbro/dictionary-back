import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema({
  word_en: { type: String, required: true, unique: true, index: true },
  word_uz: { type: String, required: true, index: true }
});

export default mongoose.model('Word', wordSchema);
