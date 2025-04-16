// controllers/authController.js
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const axios = require("axios");


exports.spotifyLogin = async (req, res) => {
  const { email, name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, username: name, provider: "spotify" });
      await user.save();
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      username: user.username,
      userId: user._id,
    });
  } catch (err) {
    console.error("Spotify login backend error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
};
exports.exchangeSpotifyToken = async (req, res) => {
  const { code, code_verifier } = req.body;
  const redirect_uri =  "https://moodify-i9qm.onrender.com/callback";

  try {
    const response = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri,
      code_verifier,
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    res.json(response.data); // ✅ includes access_token, refresh_token
  } catch (err) {
    console.error("Token exchange failed", err.response?.data || err);
    res.status(500).json({ error: "Token exchange failed" });
  }
};


