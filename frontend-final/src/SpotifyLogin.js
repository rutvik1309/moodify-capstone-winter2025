// src/components/SpotifyLogin.js
import React from "react";

const SpotifyLogin = () => {
  const CLIENT_ID = "cdea26e7b85149eeb1e02a6812690634";
  const REDIRECT_URI = "https://moodify-ca.onrender.com";
  const SCOPES = [
    "user-read-email",
    "user-read-private",
    "user-top-read",
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming",
    "playlist-modify-public",
    "playlist-modify-private"
  ];

  const loginUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES.join(" "))}`;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>
        Login with Spotify to start Moodify{" "}
        <span role="img" aria-label="headphone">🎧</span>
      </h2>
      <a href={loginUrl}>
        <button style={{ padding: "10px 20px", marginTop: "20px" }}>
          Login with Spotify
        </button>
      </a>
    </div>
  );
};

export default SpotifyLogin;
