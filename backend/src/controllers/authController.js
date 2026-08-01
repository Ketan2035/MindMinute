import User from '../models/User.js';
import Video from '../models/Video.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        xp: user.xp,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.googleId && !userExists.password) {
        return res.status(400).json({ message: 'This email is already registered via Google. Please log in with Google.' });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        xp: user.xp,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --- Calculate XP as sum of overallScore from all completed videos ---
    const completedVideos = await Video.find({ user: user._id, status: 'completed' }).select('analysis');
    const totalXP = completedVideos.reduce((acc, v) => acc + (v.analysis?.overallScore || 0), 0);

    // --- Calculate streak from session dates ---
    const allVideos = await Video.find({ user: user._id }).select('createdAt');
    const dates = [
      ...new Set(allVideos.map(v => new Date(v.createdAt).toISOString().split('T')[0]))
    ].sort().reverse();

    let streak = 0;
    if (dates.length > 0) {
      let tempStreak = 0;
      let expectedDate = new Date();
      const toDateStr = (d) => d.toISOString().split('T')[0];

      if (dates.includes(toDateStr(expectedDate))) {
        tempStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        expectedDate.setDate(expectedDate.getDate() - 1);
        if (dates.includes(toDateStr(expectedDate))) {
          tempStreak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        }
      }

      if (tempStreak > 0) {
        while (dates.includes(toDateStr(expectedDate))) {
          tempStreak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        }
        streak = tempStreak;
      }
    }

    // --- Persist if changed ---
    let changed = false;
    if (user.xp !== totalXP) { user.xp = totalXP; changed = true; }
    if (user.streak !== streak) { user.streak = streak; changed = true; }
    if (changed) await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      xp: user.xp,
      streak: user.streak,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (name, avatar, password)
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      xp: updatedUser.xp,
      streak: updatedUser.streak,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/auth/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name avatar streak xp')
      .sort({ xp: -1, streak: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user with Google
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'No Google token provided' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { name, email, picture, sub: googleId } = ticket.getPayload();

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have a googleId, update it
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = user.avatar || picture;
        await user.save();
      }
    } else {
      // Create new user (password is optional now)
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      xp: user.xp,
      streak: user.streak,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: `Google Auth Error: ${error.message || 'Invalid token'}` });
  }
};
