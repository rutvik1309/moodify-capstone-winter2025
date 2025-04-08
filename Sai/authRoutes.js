// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // ✅ Import your controller

// ✅ Route for Spotify login
router.post("/spotify-login", authController.spotifyLogin);

module.exports = router;
