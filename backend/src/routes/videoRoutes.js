import express from 'express';
import { 
  uploadVideo, 
  submitTextOnly, 
  getMyVideos, 
  getCommunityVideos, 
  getExploreFeed, 
  addReview, 
  toggleStar, 
  getVideoById, 
  getUserVideos,
  toggleVideoVisibility,
  bulkToggleVisibility,
  generateVideoProRewrite
} from '../controllers/videoController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.single('video'), uploadVideo);

router.route('/text-only')
  .post(protect, submitTextOnly);

router.route('/my-videos')
  .get(protect, getMyVideos);

router.route('/user/:userId')
  .get(getUserVideos);

router.route('/topic/:topicId/community')
  .get(protect, getCommunityVideos);

router.route('/explore')
  .get(getExploreFeed);

// Toggle visibility for all user videos (must come before /:id)
router.patch('/visibility/all', protect, bulkToggleVisibility);

// Generate / retrieve Pro Speaker Rewrite
router.post('/:id/pro-rewrite', protect, generateVideoProRewrite);

// Toggle or update video visibility (Public / Private)
router.patch('/:id/visibility', protect, toggleVideoVisibility);

// Add a review to a video
router.post('/:id/reviews', protect, addReview);

// Toggle star on a video
router.post('/:id/star', protect, toggleStar);

// Get single video by ID
router.get('/:id', getVideoById);

export default router;
