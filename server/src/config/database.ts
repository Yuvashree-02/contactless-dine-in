import mongoose from 'mongoose';

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    const connection = await connectionPromise;
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return connection;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
};

export default connectDB;
