const express = require("express");
const path = require("path");
const cors = require("cors"); 
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

// --- CORS Configuration ---
app.use(
  cors({
    origin: ["https://moodify-i9qm.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-spotify-token"],
    credentials: true,
  })
);

// --- Body Parser Middleware ---
app.use(express.json());
app.use(bodyParser.json());

// --- Connect to the Database ---
connectDB();

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/playlist", playlistRoutes);

// An example API route (if you need one)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// --- Serving the React Frontend ---
const buildPath = path.join(__dirname, "../frontend-final/build");
app.use(express.static(buildPath));
// Serve static files from /callback too
app.use("/callback", express.static(buildPath));


// --- Health Check Route ---
app.get("/", (req, res) => {
  res.send("✅ Moodify backend is running!");
});

// --- Catch-all Route ---
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
