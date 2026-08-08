import express from 'express';
import { authUser, registerUser, getUserProfile, updateUserProfile, getLeaderboard, googleAuth, getUserById } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleAuth);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/leaderboard', getLeaderboard);
router.get('/users/:id', getUserById);

export default router;
