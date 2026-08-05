import express from 'express';
import { getTopics, getTopicById, createTopic, generateRandomTopic } from '../controllers/topicController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTopics)
  .post(protect, createTopic); // Typically you'd have an admin middleware here too

router.post('/generate', optionalAuth, generateRandomTopic);

router.route('/:id')
  .get(getTopicById);

export default router;
