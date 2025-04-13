import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        const res = await axios.get(`https://moodify-capstone-winter2025.onrender.com/api/playlist/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("🎧 Fetched playlists:", res.data);

        // Ensure it's an array
        setPlaylists(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching user playlists:", error);
        setPlaylists([]); // fallback
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchUserPlaylists();
    }
  }, [userId, token]);

  const handleDelete = async (playlistId) => {
    try {
      await axios.delete(`https://moodify-capstone-winter2025.onrender.com/api/playlist/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(playlists.filter((p) => p._id !== playlistId));
    } catch (err) {
      console.error("Failed to delete playlist:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all playlists?")) return;

    try {
      await axios.delete(`https://moodify-capstone-winter2025.onrender.com/api/playlist/user/${userId}/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists([]);
    } catch (err) {
      console.error("Failed to clear playlists:", err);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container">
      <h2><span role="img" aria-label="music">🎵</span> My Saved Playlists</h2>
      {loading ? (
        <p>Loading playlists...</p>
      ) : playlists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
        <>
          {playlists.map((playlist, index) => (
            <div key={index} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
              <h3>{playlist.name}</h3>
              <p><strong>Created:</strong> {formatDate(playlist.createdAt)}</p>
              <ul>
                {Array.isArray(playlist.songs) && playlist.songs.length > 0 ? (
                  playlist.songs.map((song, i) => (
                    <li key={i}>
                      <a href={song.url} target="_blank" rel="noopener noreferrer">
                        {song.name} - {song.artist}
                      </a>
                    </li>
                  ))
                ) : (
                  <li>No songs in this playlist.</li>
                )}
              </ul>
              <button
                onClick={() => handleDelete(playlist._id)}
                style={{ backgroundColor: '#dc3545', color: '#fff', padding: '5px 10px', border: 'none' }}
              >
                <span role="img" aria-label="delete">🗑️</span> Delete
              </button>
            </div>
          ))}
          <button
            onClick={handleClearAll}
            style={{ backgroundColor: '#dc3545', color: '#fff', padding: '8px 15px', border: 'none', marginTop: '10px' }}
          >
            <span role="img" aria-label="clear">❌</span> Clear All
          </button>
        </>
      )}
    </div>
  );
};

export default MyPlaylists;
