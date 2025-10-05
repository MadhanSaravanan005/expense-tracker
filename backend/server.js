const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    console.log("App will continue without database connection");
    // Don't exit, let the app run for health checks
  });

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
  app.listen(port, '0.0.0.0', () => {
    console.log(`Expense Tracker Server running on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/api/test`);
  });
} 

// Export the Express app
module.exports = app;