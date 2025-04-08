// controllers/authController.js
const User = require("../models/user");
const jwt = require("jsonwebtoken");

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
