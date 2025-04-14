// src/components/SpotifyLogin.js
import React, { useEffect } from "react";

const SpotifyLogin = () => {
  const CLIENT_ID = "cdea26e7b85149eeb1e02a6812690634"; // ✅ Replace with process.env var in future if bundling securely
  const REDIRECT_URI =
    window.location.hostname === "localhost"
      ? "http://localhost:3000/callback"
      : "https://moodify-ca.onrender.com/callback";

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
      

  // 🔐 Generates a random code_verifier
  const generateCodeVerifier = (length = 128) => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  // 🔐 Hash the verifier to generate a code_challenge
  const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const handleLogin = async () => {
    // ✅ Clear all old tokens from local storage
    localStorage.clear();
  
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem("code_verifier", codeVerifier); // ✅ Store for use in callback
  
    const args = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      redirect_uri: REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });
  
    window.location = `https://accounts.spotify.com/authorize?${args.toString()}`;
  };
  

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>
        Login with Spotify to start Moodify{" "}
        <span role="img" aria-label="headphone">🎧</span>
      </h2>
      <button
        style={{ padding: "10px 20px", marginTop: "20px" }}
        onClick={handleLogin}
      >
        Login with Spotify
      </button>
    </div>
  );
};

export default SpotifyLogin;
