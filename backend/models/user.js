const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: false }, // for Spotify login
  provider: { type: String, enum: ['local', 'spotify'], default: 'local' },
});

// ✅ Export the model properly
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
