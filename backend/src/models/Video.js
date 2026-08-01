import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  videoUrl: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
  mediaType: {
    type: String,
    enum: ['video', 'audio', 'text'],
    default: 'video'
  },
  duration: {
    type: Number, // duration in seconds
  },
  transcript: {
    type: String,
  },
  analysis: {
    grammarScore: Number,
    fluencyScore: Number,
    criticalThinkingScore: Number,
    overallScore: Number,
    fillerWords: [String],
    grammarFeedback: [
      {
        type: { type: String, enum: ['positive', 'improvement'] },
        text: String
      }
    ],
    fluencyFeedback: [
      {
        type: { type: String, enum: ['positive', 'improvement'] },
        text: String
      }
    ],
    criticalThinkingFeedback: [
      {
        type: { type: String, enum: ['positive', 'improvement'] },
        text: String
      }
    ],
    thoughtAnalysis: {
      userCoreArgument: String,
      missingCounterargument: String
    }
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  stars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);
export default Video;
