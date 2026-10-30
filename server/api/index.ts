import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import connectDB from '../src/config/database';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    await connectDB();
    return app(request, response);
  } catch (error) {
    console.error('Serverless request could not connect to MongoDB:', error);
    return response.status(503).json({
      message: 'Database unavailable',
    });
  }
}
