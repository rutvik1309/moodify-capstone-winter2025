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
};





// 💾 Save Playlist manually
exports.savePlaylist = async (req, res) => {
  const { name, songs, mood, userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const playlist = new Playlist({
      name,
      songs,
      mood,
      userId, // ✅ fixed typo: was userID
      createdByVoice: false,
    });

    await playlist.save();
    res.status(201).json({ message: 'Playlist saved successfully.', playlist });
  } catch (error) {
    console.error('Failed to save playlist:', error.message);
    console.log("Incoming save request:", req.body);
    res.status(500).json({ error: 'Failed to save playlist.' });
  }
};

// 📄 Get all playlists for a user
exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.params.userId }); // ✅ use userId
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

// 🧹 Delete all playlists for a user
exports.clearAllPlaylists = async (req, res) => {
  try {
    await Playlist.deleteMany({ userId: req.params.userId }); // ✅ corrected from 'user'
    res.status(200).json({ message: "All playlists cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear playlists" });
  }
};
