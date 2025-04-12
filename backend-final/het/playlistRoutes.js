const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/authMiddleware');
const playlistController = require('../controllers/playlistController');

// 🎵 Generate a new playlist from mood
router.post('/generate', authMiddleware, playlistController.createPlaylist);

// 💾 Save playlist manually
router.post('/save', authMiddleware, playlistController.savePlaylist);

// 📄 Get all playlists for a user
router.get('/user/:userId', authMiddleware, playlistController.getUserPlaylists);

// ❌ Delete a playlist by ID
router.delete('/:id', authMiddleware, playlistController.deletePlaylistById);

// 🧹 Clear all playlists for a user
router.delete('/user/:userId/clear', authMiddleware, playlistController.clearAllPlaylists);

module.exports = router;
