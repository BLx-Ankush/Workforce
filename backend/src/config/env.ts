import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workforce_ai',
  JWT_SECRET: process.env.JWT_SECRET || 'workforce_intelligence_hackathon_secret_2026',
  OPTIMIZER_URL: process.env.OPTIMIZER_URL || 'http://127.0.0.1:8001',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  WORKLOAD_BLOCKING_THRESHOLD: parseFloat(process.env.WORKLOAD_BLOCKING_THRESHOLD || '90.0'),
};
