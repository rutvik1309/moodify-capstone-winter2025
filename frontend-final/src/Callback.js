// src/components/Callback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");

    if (!accessToken) {
      alert("Spotify login failed.");
      return navigate("/");
    }

    localStorage.setItem("spotify_token", accessToken);

    const fetchSpotifyProfileAndLogin = async () => {
      try {
        // Step 1: Get Spotify user profile
        const profileRes = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const profile = await profileRes.json();
        const { email, display_name, id: spotifyUserId } = profile;

        localStorage.setItem("spotify_user_id", spotifyUserId);

        // Step 2: Login or register to your backend
        const moodifyRes = await axios.post("/api/auth/spotify-login", {
          email,
          name: display_name || "Spotify User",
        });

        const { token, username, userId } = moodifyRes.data;
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("user_id", userId);

        navigate("/home");
      } catch (err) {
        console.error("⚠️ Spotify /me error (non-JSON):", err);
        alert("Spotify authentication failed.");
        navigate("/");
      }
    };

    fetchSpotifyProfileAndLogin();
  }, [navigate]);

  return <p style={{ textAlign: "center", color: "green" }}>Authenticating with Spotify...</p>;
};

export default Callback;
