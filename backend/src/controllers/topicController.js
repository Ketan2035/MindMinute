import Topic from '../models/Topic.js';
import Video from '../models/Video.js';
import { generateTopicIdea } from '../services/aiService.js';

// @desc    Get all topics
// @route   GET /api/topics
// @access  Public
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find({}).sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single topic
// @route   GET /api/topics/:id
// @access  Public
export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (topic) {
      res.json(topic);
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new topic
// @route   POST /api/topics
// @access  Private/Admin
export const createTopic = async (req, res) => {
  try {
    const { title } = req.body;
    
    const topic = new Topic({
      title
    });

    const createdTopic = await topic.save();
    res.status(201).json(createdTopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a random topic from the database
// @route   POST /api/topics/generate (kept as POST for frontend compatibility)
// @access  Public
export const generateRandomTopic = async (req, res) => {
  try {
    let targetDifficulty = 'Beginner';

    if (req.user) {
      const videoCount = await Video.countDocuments({ user: req.user._id });
      const streak = req.user.streak || 0;

      if (videoCount >= 30 && streak >= 7) {
        targetDifficulty = 'Advanced';
      } else if (videoCount >= 10 && streak >= 3) {
        targetDifficulty = 'Intermediate';
      }
    }

    // Pick a random topic matching the difficulty
    let randomTopics = await Topic.aggregate([
      { $match: { difficulty: targetDifficulty } },
      { $sample: { size: 1 } }
    ]);
    
    // Fallback if no topic of that difficulty exists
    if (randomTopics.length === 0) {
      randomTopics = await Topic.aggregate([{ $sample: { size: 1 } }]);
    }
    
    if (randomTopics.length > 0) {
      return res.json(randomTopics[0]);
    }
    
    // Fallback if database is completely empty
    const fallbackTopic = new Topic({
      title: "The Impact of Artificial Intelligence on Daily Life"
    });
    
    await fallbackTopic.save();
    res.status(201).json(fallbackTopic);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
