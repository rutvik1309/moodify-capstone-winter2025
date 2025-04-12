const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  artist: { type: String },
  albumImage: { type: String },
});

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    songs: [songSchema],
    mood: { type: String, required: true },
    userId: { 
      type: String,
      required: true,
    },
    voiceCommand: {
      type: String,
      default: null,
    },
    createdByVoice: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
