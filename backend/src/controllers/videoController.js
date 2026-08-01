import Video from '../models/Video.js';
import Topic from '../models/Topic.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { uploadVideoToCloudinary } from '../services/cloudinaryService.js';
import { analyzeVideoWithGemini, analyzeTextWithGemini } from '../services/geminiService.js';

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private
export const uploadVideo = async (req, res) => {
  try {
    const { topicId, transcript, mediaType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    if (!topicId) {
      return res.status(400).json({ message: 'Topic ID is required' });
    }

    // Upload to Cloudinary
    const result = await uploadVideoToCloudinary(req.file.buffer);

    // Create Video record
    const video = new Video({
      user: req.user._id,
      topic: topicId,
      videoUrl: result.secure_url,
      cloudinaryId: result.public_id,
      mediaType: mediaType || 'video',
      duration: result.duration || 0,
      status: 'processing', // Will be updated by AI service later
    });

    const createdVideo = await video.save();

    // Trigger AI analysis asynchronously using the live transcript
    const topicData = await Topic.findById(topicId);
    if (topicData && transcript) {
      analyzeTextWithGemini(transcript, topicData)
        .then(async (analysisData) => {
          console.log('AI Analysis Complete for video:', createdVideo._id);
          createdVideo.transcript = analysisData.transcript || transcript;
          createdVideo.analysis = analysisData;
          createdVideo.status = 'completed';
          await createdVideo.save();

          // Award XP to the user based on the overall score
          const xpEarned = analysisData.overallScore || 0;
          if (xpEarned > 0) {
            await User.findByIdAndUpdate(createdVideo.user, { $inc: { xp: xpEarned } });
            console.log(`Awarded ${xpEarned} XP to user ${createdVideo.user}`);
          }
        })
        .catch(async (err) => {
          console.error('AI Analysis Failed:', err);
          createdVideo.status = 'failed';
          await createdVideo.save();
        });
    } else if (!transcript) {
      console.log('No transcript provided, skipping AI text analysis');
      createdVideo.status = 'completed';
      await createdVideo.save();
    }

    res.status(201).json(createdVideo);
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit text transcript for analysis (skip video upload)
// @route   POST /api/videos/text-only
// @access  Private
export const submitTextOnly = async (req, res) => {
  try {
    const { topicId, transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ message: 'Transcript text is required' });
    }

    if (!topicId) {
      return res.status(400).json({ message: 'Topic ID is required' });
    }

    // Create Video record (as a text-only session)
    const video = new Video({
      user: req.user._id,
      topic: topicId,
      transcript: transcript, // store initial transcript immediately
      mediaType: 'text',
      duration: 0,
      status: 'processing',
    });

    const createdVideo = await video.save();

    // Trigger AI analysis asynchronously
    const topicData = await Topic.findById(topicId);
    if (topicData) {
      analyzeTextWithGemini(transcript, topicData)
        .then(async (analysisData) => {
          console.log('AI Text Analysis Complete for session:', createdVideo._id);
          createdVideo.analysis = analysisData;
          createdVideo.status = 'completed';
          await createdVideo.save();

          // Award XP to the user based on the overall score
          const xpEarned = analysisData.overallScore || 0;
          if (xpEarned > 0) {
            await User.findByIdAndUpdate(createdVideo.user, { $inc: { xp: xpEarned } });
            console.log(`Awarded ${xpEarned} XP to user ${createdVideo.user}`);
          }
        })
        .catch(async (err) => {
          console.error('AI Text Analysis Failed:', err);
          createdVideo.status = 'failed';
          await createdVideo.save();
        });
    }

    res.status(201).json(createdVideo);
  } catch (error) {
    console.error('Text submission error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's videos
// @route   GET /api/videos/my-videos
// @access  Private
export const getMyVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user._id })
      .populate('topic', 'title category')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get community videos for a topic
// @route   GET /api/videos/topic/:topicId/community
// @access  Private
export const getCommunityVideos = async (req, res) => {
  try {
    const { topicId } = req.params;
    const videos = await Video.find({ 
      topic: topicId,
      status: 'completed'
    })
      .populate('user', 'name')
      .sort({ 'analysis.overallScore': -1, createdAt: -1 }) // Sort by score, then newest
      .limit(20);
      
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get global video feed for Explore page
// @route   GET /api/videos/explore
// @access  Public
export const getExploreFeed = async (req, res) => {
  try {
    // Include completed videos. Also include 'processing' ones older than 3 minutes
    // (they are stuck — Gemini likely failed silently — but we still want to show them)
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

    const videos = await Video.find({
      $or: [
        { status: 'completed' },
        { status: 'processing', createdAt: { $lt: threeMinutesAgo } },
      ]
    })
      .populate('user', 'name avatar')
      .populate('topic', 'title category difficulty')
      .populate('reviews.user', 'name avatar')
      .sort('-createdAt')
      .limit(50);

    res.json(videos);
  } catch (error) {
    console.error('Failed to get explore feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a review to a video
// @route   POST /api/videos/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Review text is required' });
    }

    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const review = {
      user: req.user._id,
      text,
    };

    video.reviews.push(review);
    await video.save();

    // Create notification for the video owner
    if (video.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: video.user,
        sender: req.user._id,
        type: 'review',
        video: video._id,
        message: 'left a review on your speech'
      });
    }

    // Re-fetch with populated user so the frontend has avatar/name immediately
    const updatedVideo = await Video.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('topic', 'title')
      .populate('reviews.user', 'name avatar');

    res.status(201).json(updatedVideo);
  } catch (error) {
    console.error('Failed to add review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle star on a video
// @route   POST /api/videos/:id/star
// @access  Private
export const toggleStar = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const userId = req.user._id;
    const index = video.stars.indexOf(userId);

    if (index === -1) {
      // Star
      video.stars.push(userId);
      
      // Create notification
      if (video.user.toString() !== userId.toString()) {
        await Notification.create({
          recipient: video.user,
          sender: userId,
          type: 'star',
          video: video._id,
          message: 'starred your speech'
        });
      }
    } else {
      // Unstar
      video.stars.splice(index, 1);
      
      // Optional: We could delete the notification if they unstar, but usually platforms leave it or delete it.
      // We will leave it simple for now.
    }

    await video.save();

    // Re-fetch populated
    const updatedVideo = await Video.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('topic', 'title')
      .populate('reviews.user', 'name avatar');

    res.json(updatedVideo);
  } catch (error) {
    console.error('Failed to toggle star:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single video by ID
// @route   GET /api/videos/:id
// @access  Public
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('topic', 'title')
      .populate('reviews.user', 'name avatar');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Failed to get video by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
