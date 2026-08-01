import express from 'express';
import { uploadVideo, submitTextOnly, getMyVideos, getCommunityVideos, getExploreFeed, addReview, toggleStar, getVideoById } from '../controllers/videoController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.single('video'), uploadVideo);

router.route('/text-only')
  .post(protect, submitTextOnly);

router.route('/my-videos')
  .get(protect, getMyVideos);

router.route('/topic/:topicId/community')
  .get(protect, getCommunityVideos);

router.route('/explore')
  .get(getExploreFeed);

// Add a review to a video
router.post('/:id/reviews', protect, addReview);

// Toggle star on a video
router.post('/:id/star', protect, toggleStar);

// Get single video by ID
router.get('/:id', getVideoById);

export default router;
