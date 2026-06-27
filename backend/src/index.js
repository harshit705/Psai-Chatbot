require('dotenv').config();
const dns = require('dns');

// Force DNS servers to resolve SRV records correctly on local machine
dns.setServers(['8.8.8.8', '1.1.1.1']);
const app = require('./app');

const PORT = process.env.PORT || 5000;

const mongoose = require('mongoose');

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, shutting down gracefully...');
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnection:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
