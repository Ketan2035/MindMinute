/**
 * MindMinute Topic Seed Script
 * Run with: node src/seed.js
 * Populates the Topics collection with 35 diverse practice topics.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Topic from './models/Topic.js';

dotenv.config();

const topics = [
  // --- General ---
  { title: 'The Impact of Social Media on Modern Relationships', category: 'General', difficulty: 'Intermediate' },
  { title: 'Should Everyone Learn to Cook?', category: 'General', difficulty: 'Beginner' },
  { title: 'The Importance of Mental Health Days', category: 'General', difficulty: 'Beginner' },
  { title: 'Is Travel Truly Broadening the Mind?', category: 'General', difficulty: 'Intermediate' },
  { title: 'The Role of Music in Human Culture', category: 'General', difficulty: 'Beginner' },
  { title: 'Are Books More Valuable Than Movies?', category: 'General', difficulty: 'Beginner' },
  { title: 'The Future of Remote Work and Urban Living', category: 'General', difficulty: 'Intermediate' },

  // --- Business ---
  { title: 'Is Entrepreneurship the Future of Work?', category: 'Business', difficulty: 'Intermediate' },
  { title: 'The Ethics of Corporate Greenwashing', category: 'Business', difficulty: 'Advanced' },
  { title: 'Should Companies Prioritize Profit or Purpose?', category: 'Business', difficulty: 'Advanced' },
  { title: 'How to Build a Strong Personal Brand', category: 'Business', difficulty: 'Intermediate' },
  { title: 'The Four-Day Work Week: A Productivity Revolution?', category: 'Business', difficulty: 'Intermediate' },
  { title: 'Leadership vs Management: What Makes a Great Leader?', category: 'Business', difficulty: 'Intermediate' },

  // --- Technology ---
  { title: 'The Impact of Artificial Intelligence on Daily Life', category: 'Technology', difficulty: 'Beginner' },
  { title: 'Will Self-Driving Cars Make Roads Safer?', category: 'Technology', difficulty: 'Intermediate' },
  { title: 'Should Social Media Platforms Regulate Hate Speech?', category: 'Technology', difficulty: 'Advanced' },
  { title: 'The Privacy Trade-Off in a Connected World', category: 'Technology', difficulty: 'Advanced' },
  { title: 'Is Cryptocurrency the Future of Money?', category: 'Technology', difficulty: 'Intermediate' },
  { title: 'Can Technology Solve Climate Change?', category: 'Technology', difficulty: 'Intermediate' },
  { title: 'The Ethics of Gene Editing in Humans', category: 'Technology', difficulty: 'Advanced' },

  // --- Debate ---
  { title: 'Should College Education Be Free for Everyone?', category: 'Debate', difficulty: 'Intermediate' },
  { title: 'Is Universal Basic Income a Good Idea?', category: 'Debate', difficulty: 'Advanced' },
  { title: 'Should Voting Be Mandatory?', category: 'Debate', difficulty: 'Intermediate' },
  { title: 'Are Zoos Ethical in the Modern Age?', category: 'Debate', difficulty: 'Beginner' },
  { title: 'Should Space Exploration Be a Global Priority?', category: 'Debate', difficulty: 'Intermediate' },
  { title: 'Is Nuclear Energy the Answer to the Energy Crisis?', category: 'Debate', difficulty: 'Advanced' },
  { title: 'Should Junk Food Be Taxed?', category: 'Debate', difficulty: 'Beginner' },

  // --- Interview ---
  { title: 'Describe a Challenge You Faced and How You Overcame It', category: 'Interview', difficulty: 'Beginner' },
  { title: 'Where Do You See Yourself in Five Years?', category: 'Interview', difficulty: 'Beginner' },
  { title: 'What Is Your Greatest Professional Weakness?', category: 'Interview', difficulty: 'Intermediate' },
  { title: 'How Do You Handle Conflict in the Workplace?', category: 'Interview', difficulty: 'Intermediate' },
  { title: 'Tell Me About a Time You Demonstrated Leadership', category: 'Interview', difficulty: 'Intermediate' },
  { title: 'How Do You Prioritize Tasks Under Pressure?', category: 'Interview', difficulty: 'Intermediate' },
  { title: 'What Makes You Uniquely Qualified for This Role?', category: 'Interview', difficulty: 'Advanced' },
  { title: 'How Would You Handle an Underperforming Team Member?', category: 'Interview', difficulty: 'Advanced' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing topics
    await Topic.deleteMany({});
    console.log('🗑️  Cleared existing topics');

    // Insert new topics
    const inserted = await Topic.insertMany(topics);
    console.log(`🌱 Inserted ${inserted.length} topics successfully!`);

    inserted.forEach((t, i) => {
      console.log(`  ${i + 1}. [${t.category}/${t.difficulty}] ${t.title}`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected. Seed complete!');
    process.exit(0);
  }
};

seed();
