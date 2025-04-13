// spotifyServices.js
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

async function getTracksByMood(mood) {
    const token = await getSpotifyAccessToken();
  
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: mood,
        type: 'track',
        limit: 10,
      },
    });
  
    const rawSpotifyTracks = response.data.tracks.items;

const mappedTracks = rawSpotifyTracks.map(track => ({
  name: track.name,
  artist: track.artists[0]?.name || "Unknown",
  albumImage: track.album.images[0]?.url || "",
  url: track.external_urls.spotify,
  spotify_uri: track.uri, // ✅ must exist
}));

return mappedTracks; // ✅ THIS, not tracks or undefined
}
  

module.exports = {
  getSpotifyAccessToken,
  getTracksByMood,
};
