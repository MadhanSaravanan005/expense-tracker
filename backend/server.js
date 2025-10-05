const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

console.log("🚀 Starting Expense Tracker application...");
console.log("📁 Current working directory:", process.cwd());
console.log("🗂️  __dirname:", __dirname);

dotenv.config();
console.log("⚙️  Environment variables loaded");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV || 'not set');
console.log("🔌 PORT:", process.env.PORT || 'not set');
console.log("🗄️  MONGO_URI:", process.env.MONGO_URI ? 'configured' : 'not configured');

const app = express();
app.use(express.json());
app.use(cors());

console.log("📦 Express middleware configured");

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB (with better error handling)
if (process.env.MONGO_URI) {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => {
      console.error("❌ MongoDB connection error:", err.message);
      console.log("⚠️  App will continue without database connection");
      // Don't exit, let the app run for health checks
    });
} else {
  console.log("⚠️  No MONGO_URI environment variable found - running without database");
}

// Add a simple test route
app.get("/api/test", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    message: "Expense Tracker Backend is working!", 
    timestamp: new Date(),
    database: dbStatus,
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Add root health check as backup
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Debug route to check if React build files exist
app.get("/api/debug", (req, res) => {
  const fs = require('fs');
  const publicPath = path.join(__dirname, '../public');
  const indexPath = path.join(publicPath, 'index.html');
  
  try {
    const publicFiles = fs.readdirSync(publicPath);
    const indexExists = fs.existsSync(indexPath);
    const indexStats = indexExists ? fs.statSync(indexPath) : null;
    
    res.json({
      publicPath,
      indexPath,
      indexExists,
      indexSize: indexStats ? indexStats.size : null,
      publicFiles,
      cwd: process.cwd(),
      __dirname
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/expenses", require("./routes/expenseRoutes"));

// Serve the main app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  console.log(`Serving React app: ${req.path} -> ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error serving React app');
    }
  });
});

// If this file is run directly (node backend/server.js), start a server for local development.
if (require.main === module) {
  const port = process.env.PORT || 5000;
  
  // Ensure we have a port
  if (!port) {
    console.error('No PORT environment variable set');
    process.exit(1);
  }
  
  console.log(`Starting server on port ${port}...`);
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`__dirname: ${__dirname}`);
  
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Expense Tracker Server running on port ${port}`);
    console.log(`🔍 Health check available at: http://0.0.0.0:${port}/api/test`);
    console.log(`🔍 Debug info available at: http://0.0.0.0:${port}/api/debug`);
    console.log(`🌐 Server is listening on all interfaces (0.0.0.0)`);
  });
  
  server.on('error', (err) => {
    console.error('Server startup error:', err);
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
} 

// Export the Express app
module.exports = app;