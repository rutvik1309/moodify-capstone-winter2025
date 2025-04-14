// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // ✅ Import your controller
const axios = require("axios"); 


// ✅ Route for Spotify login
router.post("/spotify-login", authController.spotifyLogin);
router.post("/exchange-token", authController.exchangeSpotifyToken);
router.post("/refresh-token", async (req, res) => {
    const { refresh_token } = req.body;
  
    try {
      const response = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id: process.env.SPOTIFY_CLIENT_ID,
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
  
      res.json(response.data); // includes new access_token
    } catch (err) {
      console.error("Token refresh failed", err.response?.data || err);
      res.status(500).json({ error: "Token refresh failed" });
    }
  })  

module.exports = router;
