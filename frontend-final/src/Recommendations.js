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

        const topTracksData = await topTracksRes.json();
        const rawSeeds = topTracksData.items?.map((track) => track.id) || [];

        if (rawSeeds.length === 0) {
          setMessage("No top tracks found. Listen to more songs on Spotify.");
          return;
        }

        // Step 2: Validate usable seed tracks
        const getValidSeeds = async (seeds) => {
          const valid = [];
          for (const id of seeds) {
            const res = await fetch(
              `https://api.spotify.com/v1/recommendations?seed_tracks=${id}&limit=1`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (res.ok && data.tracks?.length > 0) valid.push(id);
            if (valid.length >= 3) break;
          }
          return valid;
        };

        const validSeedTracks = await getValidSeeds(rawSeeds);
        console.log("✅ Valid seeds:", validSeedTracks);

        if (validSeedTracks.length === 0) {
          setMessage("No valid top tracks for generating recommendations. Try again later.");
          return;
        }

        // Step 3: Fetch final recommendations
        const recRes = await fetch(
          `https://api.spotify.com/v1/recommendations?seed_tracks=${validSeedTracks.join(",")}&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!recRes.ok) {
          const text = await recRes.text();
          console.error("❌ Recommendations failed:", text);
          setMessage("Failed to load recommendations. Spotify token might be expired.");
          return;
        }

        const recData = await recRes.json();
        setRecommendations(recData.tracks || []);
        if (!recData.tracks || recData.tracks.length === 0) {
          setMessage("No recommendations available at the moment.");
        }
      } catch (err) {
        console.error("💥 Unexpected error:", err);
        setMessage("Error loading recommendations. Try refreshing.");
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
            <img
              src={track.album.images[0]?.url}
              alt="cover"
              width="50"
              style={{ marginRight: "10px", verticalAlign: "middle" }}
            />
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
