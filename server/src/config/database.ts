import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.error('Please install MongoDB locally or configure MongoDB Atlas');
    console.error('The server will continue running but database operations will fail');
    // Don't exit - let server run without DB for now
  }
};

export default connectDB;