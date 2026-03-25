import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import dictionaryRoutes from './routes/dictionaryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/quiz', quizRoutes);
app.use('/dictionary', dictionaryRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'root' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin1122', 10);
      const admin = new User({
        username: 'root',
        email: 'root@admin.com',
        password: hashedPassword,
        role: 'admin',
        status: 'approved',
        isPremium: true
      });
      await admin.save();
      console.log('Default admin created: root / admin1122');
    }
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
};

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    createDefaultAdmin();
  })
  .catch((error) => console.error('MongoDB connection error:', error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
