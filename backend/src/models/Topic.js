import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['General', 'Business', 'Technology', 'Debate', 'Interview'],
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
}, { timestamps: true });

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;
