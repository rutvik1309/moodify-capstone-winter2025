/* 
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
        const topTracksRes = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const topTracksData = await topTracksRes.json();
        const rawSeeds = topTracksData.items?.map((track) => track.id) || [];
  
        const getValidSeedTracks = async (trackIds, token) => {
          const valid = [];
          for (const id of trackIds) {
            const res = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${id}&limit=1`, {
              headers: { Authorization: `Bearer ${token}` },
            });
  
            if (res.ok) {
              const data = await res.json();
              if (data.tracks?.length > 0) valid.push(id);
            }
  
            if (valid.length >= 3) break;
          }
  
          // Fallback to genre
         // inside getValidSeedTracks()
if (valid.length === 0) {
  // ✅ Use only valid genre seeds
  return ['pop', 'rock', 'chill']; 
}

  
          return valid;
        };
  
        const validSeedTracks = await getValidSeedTracks(rawSeeds, token);
        const isGenreSeed = typeof validSeedTracks[0] === "string" && validSeedTracks[0].length <= 10;
  
        const seedType = isGenreSeed ? "seed_genres" : "seed_tracks";
        const url = `https://api.spotify.com/v1/recommendations?${seedType}=${validSeedTracks.join(",")}&limit=10`;
  
        const recRes = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!recRes.ok) {
          const text = await recRes.text();
          console.error("❌ Recommendations failed:", text);
          setMessage("Failed to load recommendations. Spotify token might be expired.");
          return;
        }
  
        const recData = await recRes.json();
        setRecommendations(recData.tracks || []);
        if (!recData.tracks?.length) {
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
*/

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
        // Step 1: Fetch valid genres
        const genreRes = await fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const genreData = await genreRes.json();
        const availableGenres = genreData.genres || [];

        // Step 2: Fetch top tracks
        const topTracksRes = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const topTracksData = await topTracksRes.json();
        const rawSeeds = topTracksData.items?.map((track) => track.id) || [];

        // Step 3: Validate top tracks for recommendation support
        const getValidSeedTracks = async (trackIds) => {
          const valid = [];

          for (const id of trackIds) {
            const res = await fetch(
              `https://api.spotify.com/v1/recommendations?seed_tracks=${id}&limit=1`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.ok) {
              const data = await res.json();
              if (data.tracks && data.tracks.length > 0) valid.push(id);
            }

            if (valid.length >= 3) break;
          }

          // ✅ Fallback: return 3 random genres from Spotify’s valid genre list
          if (valid.length === 0 && availableGenres.length > 0) {
            const randomGenres = availableGenres.sort(() => 0.5 - Math.random()).slice(0, 3);
            return randomGenres;
          }

          return valid;
        };

        const validSeedTracks = await getValidSeedTracks(rawSeeds);
        const isGenreSeed = typeof validSeedTracks[0] === "string" && validSeedTracks[0].length <= 10;

        const seedType = isGenreSeed ? "seed_genres" : "seed_tracks";
        const url = `https://api.spotify.com/v1/recommendations?${seedType}=${validSeedTracks.join(",")}&limit=10`;

        console.log("📡 Final recommendation URL:", url);

        const recRes = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!recRes.ok) {
          const text = await recRes.text();
          console.error("❌ Recommendations failed:", text);
          setMessage("Failed to load recommendations.");
          return;
        }

        const recData = await recRes.json();
        setRecommendations(recData.tracks || []);
        if (!recData.tracks?.length) {
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
