/* 
const Playlist = require('../models/Playlist');
const User = require('../models/user');
const { getTracksByMood } = require("../Services/spotifyServices");

exports.createPlaylist = async (req, res) => {
  try {
    const { mood, name } = req.body;
    const userId = req.userId;
    const spotifyToken = req.headers["x-spotify-token"];

    console.log("🔁 Incoming Request:");
    console.log("🔤 Mood:", mood);
    console.log("📛 Playlist Name:", name);
    console.log("🧑‍💻 User ID:", userId);
    console.log("🔑 Spotify Token:", spotifyToken?.slice(0, 25) + "...");

    if (!spotifyToken) {
      console.error("❌ Missing Spotify token");
      return res.status(400).json({ error: "Spotify token missing in request" });
    }

    const tracks = await getTracksByMood(mood, spotifyToken);
    console.log("🎵 Tracks fetched:", tracks?.length);

    const newPlaylist = new Playlist({
      name,
      mood,
      user: userId,
      tracks,
      createdAt: new Date(),
    });

    await newPlaylist.save();
    console.log("✅ Playlist saved.");
    res.status(201).json({ playlist: newPlaylist });
  } catch (error) {
    console.error("🔥 Error generating playlist:", error.message);
    console.error("🧨 Full error:", error); // 👈 super important
    res.status(500).json({ error: "Failed to generate playlist" });
  }
}; */


// controllers/playlistController.js
const Playlist = require('../models/Playlist');
const User = require('../models/user');
const { getTracksByMood } = require("../Services/spotifyServices");

const createPlaylist = async (req, res) => {
  try {
    const { mood, name } = req.body;
    const userId = req.userId;
    const spotifyToken = req.headers["x-spotify-token"];

    if (!spotifyToken) {
      return res.status(400).json({ error: "Spotify token missing in request" });
    }

    if (!mood || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tracks = await getTracksByMood(mood, spotifyToken);

    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: "No tracks found for this mood" });
    }

    const newPlaylist = new Playlist({
      name,
      mood,
      tracks,
      userId,
      createdAt: new Date()
    });

    await newPlaylist.save();
    console.log("✅ Playlist created via legacy route.");
    res.status(201).json({ playlist: newPlaylist });
  } catch (error) {
    console.error("❌ createPlaylist failed:", error.message);
    res.status(500).json({ error: "Failed to generate playlist" });
  }
};

// 🏏 Preview playlist based on mood (no saving)
exports.previewPlaylist = async (req, res) => {
  try {
    const { mood } = req.body;
    const spotifyToken = req.headers["x-spotify-token"];

    if (!spotifyToken) {
      return res.status(400).json({ error: "Spotify token missing in request" });
    }

    if (!mood) {
      return res.status(400).json({ error: "Mood is required" });
    }

    console.log("🎿 Generating preview for:", mood);
    const tracks = await getTracksByMood(mood, spotifyToken);

    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: "No tracks found for this mood" });
    }

    res.status(200).json({ tracks });
  } catch (error) {
    console.error("🔥 Preview failed:", error.message);
    res.status(500).json({ error: "Failed to generate preview" });
  }
};

// 🗕 Save Playlist manually after preview
exports.savePlaylist = async (req, res) => {
  try {
    const { name, mood, tracks, userId, createdByVoice, voiceCommand } = req.body;

    if (!name || !mood || !tracks || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newPlaylist = new Playlist({
      name,
      mood,
      tracks,
      userId,
      createdByVoice: createdByVoice || false,
      voiceCommand: voiceCommand || null,
      createdAt: new Date()
    });

    await newPlaylist.save();
    console.log("✅ Playlist saved.");
    res.status(201).json({ message: "Playlist saved successfully", playlist: newPlaylist });
  } catch (error) {
    console.error("❌ Save failed:", error.message);
    res.status(500).json({ error: "Failed to save playlist" });
  }
};

// 📄 Get all playlists for a user
exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.params.userId });
    res.status(200).json(playlists);
  } catch (err) {
    console.error("Error fetching user playlists:", err);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

// ❌ Delete a single playlist
exports.deletePlaylistById = async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Playlist deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete playlist" });
  }
};

// 🩹 Delete all playlists for a user
exports.clearAllPlaylists = async (req, res) => {
  try {
    await Playlist.deleteMany({ userId: req.params.userId });
    res.status(200).json({ message: "All playlists cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear playlists" });
  }
};

module.exports = {
  previewPlaylist,        // 👀 Generate playlist preview only
  savePlaylist,           // 💾 Save playlist after confirmation
  createPlaylist,         // (Optional legacy method to generate and save directly)
  getUserPlaylists,       // 📄 Fetch user's playlists
  deletePlaylistById,     // ❌ Delete by ID
  clearAllPlaylists       // 🧹 Clear all by userId
};
