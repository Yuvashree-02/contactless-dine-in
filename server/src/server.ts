import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/database';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('Unable to start server because MongoDB connection failed:', error);
    process.exitCode = 1;
  });
