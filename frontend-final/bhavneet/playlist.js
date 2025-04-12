import React, { useState } from 'react';
import axios from 'axios';

const Playlist = ({ mood }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylist = async () => {
    const token = localStorage.getItem("spotify_token");

    if (!token) {
      alert("Please login with Spotify first!");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(mood)}&type=track&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const items = response.data.tracks.items.map((track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || "Unknown",
        url: track.external_urls.spotify,
        albumImage: track.album.images[0]?.url || "",
        spotify_uri: track.uri,
      }));

      setSongs(items);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      alert("Failed to fetch playlist from Spotify.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchPlaylist} disabled={loading}>
        {loading ? "Loading..." : `Generate Playlist for "${mood}"`}
      </button>
      <ul>
        {songs.map((song) => (
          <li key={song.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            {song.albumImage && (
              <img src={song.albumImage} alt="Album Cover" width="50" height="50" style={{ marginRight: '10px', borderRadius: '4px' }} />
            )}
            <a
              href={song.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#1DB954" }}
            >
              {song.name} – {song.artist}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;
