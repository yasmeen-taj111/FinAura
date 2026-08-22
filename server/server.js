require('dotenv').config();
const app = require('./app');
const connectDB = async () => {
  const db = require('./config/db');
  await db();
};

const startServer = async () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production');
  }
  // Connect to Database
  await connectDB();

  const PORT = process.env.PORT || 5001;

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Promise Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Closing server gracefully.`);
    server.close(() => process.exit(0));
  };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
};

startServer();
