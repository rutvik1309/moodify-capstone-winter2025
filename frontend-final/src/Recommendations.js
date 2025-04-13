// src/components/Recommendations.js
import React, { useEffect, useState } from "react";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem("spotify_token");
      if (!token) {
        setMessage("Please log in with Spotify first.");
        return;
      }
  
      try {
        // Step 1: Fetch top tracks
        const topTracksRes = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const topTracksText = await topTracksRes.text();
  
        if (!topTracksRes.ok) {
          console.error("❌ Top tracks fetch failed:", topTracksRes.status, topTracksText);
          setMessage("Failed to fetch top tracks. Please make sure you’ve listened to songs on Spotify.");
          return;
        }
  
        let topTracksData;
        try {
          topTracksData = JSON.parse(topTracksText);
        } catch (jsonErr) {
          console.error("❌ JSON parsing failed for top tracks:", jsonErr, topTracksText);
          setMessage("Spotify returned unreadable data for top tracks.");
          return;
        }
  
        const seedTracks = topTracksData.items?.slice(0, 3).map((track) => track.id);
        console.log("🎯 Seed tracks:", seedTracks);
  
        if (!seedTracks || seedTracks.length === 0) {
          setMessage("No top tracks found to generate recommendations.");
          return;
        }
  
        // Step 2: Fetch recommendations
        const recRes = await fetch(
          `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks.join(",")}&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const recText = await recRes.text();
  
        if (!recRes.ok) {
          console.error("❌ Recommendations fetch failed:", recRes.status, recText);
          setMessage("Failed to fetch recommendations. Your Spotify token might be expired.");
          return;
        }
  
        if (!recText) {
          console.warn("⚠️ Spotify recommendation response was empty.");
          setMessage("Spotify returned no recommendations. Try again later.");
          return;
        }
  
        let recData;
        try {
          recData = JSON.parse(recText);
        } catch (jsonErr) {
          console.error("❌ JSON parsing failed for recommendations:", jsonErr, recText);
          setMessage("Spotify returned unreadable data for recommendations.");
          return;
        }
  
        console.log("✅ Recommendations:", recData);
        setRecommendations(recData.tracks || []);
      } catch (err) {
        console.error("💥 Unexpected error fetching recommendations:", err);
        setMessage("Failed to load recommendations.");
      }
    };
  
    fetchRecommendations();
  }, []);
  
  

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎧 Recommended For You</h2>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <ul>
        {recommendations.map((track) => (
          <li key={track.id} style={{ marginBottom: "10px" }}>
            <img src={track.album.images[0]?.url} alt="cover" width="50" style={{ marginRight: "10px" }} />
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "#1DB954" }}
            >
              {track.name} - {track.artists[0].name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
