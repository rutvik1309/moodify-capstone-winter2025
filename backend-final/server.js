const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Proper CORS config
const corsOptions = {
  origin: ["https://moodify-ca.onrender.com", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Preflight fix

app.use(bodyParser.json());

// ✅ Connect DB
connectDB();

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlist', playlistRoutes);

// ✅ Default route (for Render health check)
app.get("/", (req, res) => {
  res.send("✅ Moodify backend is running!");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
