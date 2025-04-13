const Playlist = require('../models/Playlist');
const User = require('../models/user');
const { getTracksByMood } = require('../Services/spotifyServices');

// 🎵 Create Playlist (auto from mood)
exports.createPlaylist = async (req, res) => {
  const { mood, createdByVoice = false, voiceCommand = '' } = req.body;

  try {
    const user = await User.findById(req.userId); // Comes from auth middleware
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tracks = await getTracksByMood(mood);
    console.log("✅ Final tracks being saved:", tracks); // Should include `spotify_uri`

    const playlist = new Playlist({
      name: `Moodify - ${mood}`,
      mood,
      songs: tracks,
      createdByVoice,
      voiceCommand,
      userId: req.userId, 
    });

    await playlist.save();

    res.status(201).json({ success: true, playlist });
  } catch (error) {
    console.error('Error creating playlist from Spotify:', error.message);
    res.status(500).json({ error: 'Failed to generate playlist from Spotify' });
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
