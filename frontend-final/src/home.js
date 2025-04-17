import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import SpotifyPlayer from "./SpotifyPlayer";

// ✅ Token refresh helper
async function refreshSpotifyToken() {
  const refreshToken = localStorage.getItem("spotify_refresh_token");

  try {
    const res = await axios.post(
      "https://moodify-i9qm.onrender.com/api/auth/refresh-token",
      { refresh_token: refreshToken }
    );

    const { access_token } = res.data;
    localStorage.setItem("spotify_token", access_token);
    return access_token;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    alert("Spotify session expired. Please log in again.");
    window.location.href = "/";
  }
}

const Home = () => {
  const [mood, setMood] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [message, setMessage] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isNaming, setIsNaming] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const spotifyToken = localStorage.getItem("spotify_token");
    if (!spotifyToken) {
      alert("Spotify login failed. Please try again.");
      window.location.href = "/";
    }
  }, []); // Removed the extra closing brace here

  const ensureValidToken = async () => {
    let token = localStorage.getItem("spotify_token");
    const expiryTime = localStorage.getItem("spotify_token_expires_at");
    const now = Date.now();

    if (!token || !expiryTime || now >= Number(expiryTime)) {
      token = await refreshSpotifyToken();
    }
    return token;
  };
  
  const fetchPlaylist = async (mood) => {
    if (!mood.trim()) {
      setMessage("Please enter a mood first.");
      return;
    }
  
    try {
      const spotifyToken = await ensureValidToken();
      const token = localStorage.getItem("token");
  
      const response = await axios.post(
        "https://moodify-i9qm.onrender.com/api/playlist/preview",
        { mood },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-spotify-token": spotifyToken,
          },
        }
      );
  
      setPlaylist(response.data.tracks || []);
      setMessage("");
    } catch (err) {
      console.error("❌ Error previewing playlist:", err);
      setMessage(err.response?.data?.error || "Failed to preview playlist.");
    }
  };
  
  

  // Dummy classifyMood function for demonstration purposes.
  // Replace this function with your actual implementation.
  const classifyMood = async (transcript) => {
    return transcript.trim();
  };

  const startListening = () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMessage("Speech recognition is not supported in your browser.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setMood(transcript);

        // ✅ Classify mood using your Python ML API
        const predictedMood = await classifyMood(transcript);
        if (!predictedMood) {
          setMessage("Unable to determine mood. Try again.");
          return;
        }

        fetchPlaylist(predictedMood);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event);
        setMessage(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.error("Speech recognition failed:", err);
      setMessage("Speech recognition not supported or blocked.");
    }
  };

  const startNamingByVoice = () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMessage("Speech recognition is not supported in your browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.start();

      recognition.onstart = () => setIsNaming(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPlaylistName(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Voice naming error:", event);
        setMessage(`Voice naming error: ${event.error}`);
      };

      recognition.onend = () => setIsNaming(false);
    } catch (err) {
      console.error("Voice naming failed:", err);
      setMessage("Voice naming not supported or blocked.");
    }
  };

  const playTrack = async (uri) => {
    const token = localStorage.getItem("spotify_token");
    const deviceId = localStorage.getItem("device_id");
    if (!token || !deviceId) {
      alert("Spotify is not connected.");
      return;
    }
    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [uri] }),
      });
    } catch (err) {
      console.error("Error playing track:", err);
      alert("Playback failed. Make sure Spotify is open and logged in.");
    }
  };

  const savePlaylist = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!playlist.length) {
      alert("Please generate a playlist first.");
      return;
    }

    try {
      await axios.post(
        "https://moodify-i9qm.onrender.com/api/playlist/save",
        {
          name: playlistName,
          songs: playlist,
          mood,
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Playlist saved successfully!");
      setPlaylistName("");
    } catch (err) {
      console.error("Failed to save playlist:", err);
      alert("Failed to save playlist.");
    }
  };

  const saveToSpotify = async () => {
    const token = localStorage.getItem("spotify_token");
    const spotifyUserId = localStorage.getItem("spotify_user_id");

    if (!playlistName || playlist.length === 0) {
      alert("Please generate and name a playlist first.");
      return;
    }

    // 🔍 Log here
    console.log("🎵 Playlist being sent to Spotify:", playlist);

    const uris = playlist
      .map((track) => {
        const match = track.url?.match(/track\/([a-zA-Z0-9]+)/);
        return match ? `spotify:track:${match[1]}` : null;
      })
      .filter(Boolean);

    // 🔍 Log URIs
    console.log("🎯 Extracted URIs:", uris);

    if (uris.length === 0) {
      alert("No valid tracks to add. Please regenerate playlist.");
      return;
    }

    try {
      // Step 1: Create the playlist
      const createRes = await fetch(
        `https://api.spotify.com/v1/users/${spotifyUserId}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: playlistName,
            description: "Created with Moodify 🎵",
            public: false,
          }),
        }
      );

      const created = await createRes.json();

      if (!createRes.ok || !created.id) {
        console.error("Spotify playlist creation failed:", created);
        alert("Spotify playlist creation failed.");
        return;
      }

      // Step 2: Add tracks
      await fetch(
        `https://api.spotify.com/v1/playlists/${created.id}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris }),
        }
      );

      alert("✅ Playlist saved to your Spotify account!");
      window.open(created.external_urls?.spotify || "https://open.spotify.com", "_blank");
    } catch (err) {
      console.error("❌ Failed to sync to Spotify:", err);
      alert("Failed to save playlist to Spotify.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("user_id");
    window.location.href = "/login";
  };

  return (
    <div className="container">
      <SpotifyPlayer />

      {/* 🧭 Navigation Menu */}
      <nav style={{ background: "#1DB954", padding: "10px" }}>
        <a href="/home" style={{ color: "#fff", marginRight: "15px" }}>
          Home
        </a>
        <a href="/recommendations" style={{ color: "#fff", marginRight: "15px" }}>
          Recommendations
        </a>
        <a href="/playlists" style={{ color: "#fff" }}>
          My Playlists
        </a>
      </nav>

      <h1>Welcome to Moodify!</h1>
      {username && (
        <h2>
          Login with Spotify to start Moodify{" "}
          <span role="img" aria-label="headphone">
            🎧
          </span>
        </h2>
      )}
      <button onClick={handleLogout}>Logout</button>

      <div>
        <h2>Generate Playlist</h2>
        <input
          type="text"
          placeholder="Enter your mood (e.g., happy, sad)"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
        <button onClick={() => fetchPlaylist(mood)}>Generate Playlist</button>
      </div>

      <div>
        <button onClick={startListening} disabled={isListening}>
          {isListening ? "Listening..." : "Speak Your Mood"}
        </button>
      </div>

      <h3>Playlist:</h3>
      {message && <p>{message}</p>}
      <ul>
        {playlist.map((track, index) => (
          <li
            key={index}
            style={{
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {track.albumImage && (
              <img
                src={track.albumImage}
                alt="Album Cover"
                width="50"
                height="50"
                style={{ borderRadius: "5px", marginRight: "10px" }}
              />
            )}
            <div style={{ flex: 1 }}>
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#1DB954" }}
              >
                {track.name} <span style={{ color: "#555" }}>– {track.artist}</span>
              </a>
              {track.spotify_uri && (
                <div>
                  <button onClick={() => playTrack(track.spotify_uri)} style={{ marginTop: "5px" }}>
                    ▶️ Play in Moodify
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {playlist.length > 0 && (
        <>
          <input
            type="text"
            placeholder="Custom Playlist Name (optional)"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            style={{ marginTop: "10px", padding: "8px", width: "80%" }}
          />
          <button
            onClick={startNamingByVoice}
            disabled={isNaming}
            style={{ marginLeft: "10px", padding: "8px" }}
          >
            🎤 {isNaming ? "Listening..." : "Name by Voice"}
          </button>

          <br />
          <button onClick={savePlaylist} style={{ marginTop: "10px" }}>
            <span role="img" aria-label="save">
              💾
            </span>{" "}
            Save this Playlist
          </button>

          <br />
          <button onClick={saveToSpotify} style={{ marginTop: "10px" }}>
            💚 Save to Spotify
          </button>
        </>
      )}

<button
  onClick={async () => {
    try {
      const token = localStorage.getItem("spotify_token");

      // 🎯 Step 1: Get top tracks
      const topTracksRes = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!topTracksRes.ok) {
        console.error("❌ Top tracks fetch failed:", topTracksRes.status);
        setMessage("Failed to fetch top tracks.");
        return;
      }

      const topTracksData = await topTracksRes.json();
      const rawTrackIds = topTracksData.items?.map((track) => track.id) || [];

      if (rawTrackIds.length === 0) {
        setMessage("No top tracks found. Try listening to more music on Spotify.");
        return;
      }

      // ✅ Step 2: Validate which ones are usable for recommendations
      const validTrackIds = [];
      for (const id of rawTrackIds) {
       // Step 3: Decide whether to use track or genre seed
const isGenreSeed = validSeedTracks[0] && validSeedTracks[0].length <= 5;

const url = isGenreSeed
  ? `https://api.spotify.com/v1/recommendations?seed_genres=${validSeedTracks.join(",")}&limit=10`
  : `https://api.spotify.com/v1/recommendations?seed_tracks=${validSeedTracks.join(",")}&limit=10`;

console.log("📡 Final recommendation URL:", url);

const recRes = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
});


        if (res.ok) {
          const json = await res.json();
          if (json.tracks && json.tracks.length > 0) validTrackIds.push(id);
        }

        if (validTrackIds.length === 3) break;
      }

      // ✅ Step 3: Decide fallback or proceed
      let recUrl = "";

      if (validTrackIds.length > 0) {
        recUrl = `https://api.spotify.com/v1/recommendations?seed_tracks=${validTrackIds.join(",")}&limit=10`;
      } else {
        // ⛑ Fallback using genre
        recUrl = `https://api.spotify.com/v1/recommendations?seed_genres=pop,rock,hip-hop&limit=10`;
      }

      const recRes = await fetch(recUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!recRes.ok) {
        console.error("❌ Failed to fetch recommendations:", await recRes.text());
        setMessage("Unable to fetch recommendations.");
        return;
      }

      const recData = await recRes.json();

      setRecommendations(
        (recData.tracks || []).map((track) => ({
          name: track.name,
          artist: track.artists[0]?.name || "Unknown",
          albumImage: track.album.images[0]?.url || "",
          url: track.external_urls.spotify,
          spotify_uri: track.uri,
        }))
      );
    } catch (err) {
      console.error("💥 Error fetching personalized recommendations:", err);
      setMessage("Something went wrong. Try again later.");
    }
  }}
>
  <span role="img" aria-label="target">🎯</span> Show Personalized Recommendations
</button>


      <ul>
        {recommendations.map((track, index) => (
          <li
            key={index}
            style={{
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {track.albumImage && (
              <img
                src={track.albumImage}
                alt="Album Cover"
                width="50"
                height="50"
                style={{ borderRadius: "5px", marginRight: "10px" }}
              />
            )}
            <div style={{ flex: 1 }}>
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#1DB954" }}
              >
                {track.name}{" "}
                <span style={{ color: "#555" }}>– {track.artist}</span>
              </a>
              {track.spotify_uri && (
                <div>
                  <button onClick={() => playTrack(track.spotify_uri)} style={{ marginTop: "5px" }}>
                    <span role="img" aria-label="target">
                      ▶️
                    </span>{" "}
                    Play in Moodify
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;




