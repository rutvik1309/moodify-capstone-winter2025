// src/components/Callback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const codeVerifier = localStorage.getItem("code_verifier");

    if (!code || !codeVerifier) {
      alert("Missing authorization code or verifier. Please try logging in again.");
      return navigate("/");
    }

    const exchangeToken = async () => {
      try {
        // Step 1: Exchange code + verifier for access token
        const exchangeRes = await axios.post("https://moodify-capstone-winter2025.onrender.com/api/auth/exchange-token", {
          code,
          code_verifier: codeVerifier
        });

        const { access_token, refresh_token } = exchangeRes.data;
localStorage.setItem("spotify_token", access_token);
localStorage.setItem("spotify_refresh_token", refresh_token);
const expiresIn = exchangeRes.data.expires_in; // seconds
const expiresAt = Date.now() + expiresIn * 1000; // milliseconds
localStorage.setItem("spotify_token_expires_at", expiresAt.toString());


        console.log("✅ Spotify Access Token:", access_token);


        // Step 2: Get user profile from Spotify
        const profileRes = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        const profile = await profileRes.json();
        const { email, display_name, id: spotifyUserId } = profile;
        localStorage.setItem("spotify_user_id", spotifyUserId);

        // Step 3: Log in/register in Moodify backend
        const moodifyRes = await axios.post("https://moodify-capstone-winter2025.onrender.com/api/auth/spotify-login", {
          email,
          name: display_name || "Spotify User",
        });

        const { token, username, userId } = moodifyRes.data;
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("user_id", userId);

        navigate("/home");
      } catch (err) {
        console.error("Authentication error:", err.response?.data || err);
        alert("Spotify authentication failed.");
        navigate("/");
      }
    };

    exchangeToken();
  }, [navigate]);

  return <p style={{ textAlign: "center", color: "green" }}>Authenticating with Spotify...</p>;
};

export default Callback;
