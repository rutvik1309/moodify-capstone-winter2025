/* // spotifyServices.js
const axios = require('axios');
require('dotenv').config();

let cachedToken = null;
let tokenExpiry = null;

async function getSpotifyAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const credentials = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  cachedToken = response.data.access_token;
  tokenExpiry = now + response.data.expires_in * 1000;
  return cachedToken;
}

const moodAudioMap = require("./utils/moodMap");

async function getTracksByMood(mood, userToken) {
  try {
    // 👇 Log the token
    console.log("🔐 Checking token:", userToken.slice(0, 20), "...");

    // Optional: Check token scopes via Spotify token introspection (manual API or dev console)

    // 🎯 Step 1: Search for tracks
    const searchRes = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { q: mood, type: "track", limit: 20 },
    });

    const tracks = searchRes.data.tracks.items;
    if (!tracks.length) return [];

    // 🎯 Step 2: Audio features
    const trackIds = tracks.map(t => t.id).join(",");
    const featuresRes = await axios.get("https://api.spotify.com/v1/audio-features", {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { ids: trackIds },
    });

    // 🎯 Step 3: Mood filtering
    const audioFeatures = featuresRes.data.audio_features;
    const moodCriteria = moodAudioMap[mood.toLowerCase()] || moodAudioMap.default;

    const filteredTracks = tracks.filter((track, index) => {
      const features = audioFeatures[index];
      return (
        features &&
        features.valence >= moodCriteria.valence[0] &&
        features.valence <= moodCriteria.valence[1] &&
        features.energy >= moodCriteria.energy[0] &&
        features.energy <= moodCriteria.energy[1]
      );
    });

    return filteredTracks.map(track => ({
      name: track.name,
      artist: track.artists[0]?.name || "Unknown",
      albumImage: track.album.images[0]?.url || "",
      url: track.external_urls.spotify,
      spotify_uri: track.uri,
    }));
  }
  catch (error) {
    console.error("🔥 Error in getTracksByMood:", error?.response?.data || error.message);
    console.error("🧨 Full error:", error);
  
    if (error.response && error.response.status === 403) {
      console.error("🛑 Headers sent:", error.config.headers);
    }
  
    throw new Error("Failed to get mood-based tracks");
  }
  
}


module.exports = {
  getSpotifyAccessToken,
  getTracksByMood,
};
*/

const axios = require("axios");

// 🎯 Map mood input to Spotify search query
function moodToQuery(moodInput) {
  const mood = moodInput.trim().toLowerCase();
  const moodQueryMap = {
    happy: "feel good hits",
    sad: "sad songs",
    romantic: "love songs",
    relaxed: "chill vibes",
    party: "party anthems",
    workout: "gym motivation",
    study: "study focus",
    angry: "heavy metal",
    motivated: "motivational",
    sleepy: "sleep music",
  };
  return moodQueryMap[mood] || "chill hits";
}

async function getTracksByMood(mood, userToken) {
  try {
    const query = moodToQuery(mood);
    console.log(`🎧 Searching Spotify for: ${query}`);

    const searchRes = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { q: query, type: "track", limit: 20 },
    });

    const tracks = searchRes.data.tracks.items;
    return tracks.map((track) => ({
      name: track.name,
      artist: track.artists[0]?.name || "Unknown",
      albumImage: track.album.images[0]?.url || "",
      url: track.external_urls.spotify,
      spotify_uri: track.uri,
    }));
  } catch (error) {
    console.error("🔥 Error in getTracksByMood:", error?.response?.data || error.message);
    throw new Error("Failed to get mood-based tracks");
  }
}

module.exports = { getTracksByMood };

