const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
const corsOptions = {
    origin: '*', // TEMP for testing – make sure to lock this down later
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  app.use(cors(corsOptions));
  
  
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);              // ✅ /api/auth/...
app.use('/api/playlist', playlistRoutes);      // ✅ /api/playlist/...

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
