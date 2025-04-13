/* import React, { useEffect, useState } from 'react';

const SpotifyPlayer = () => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [error, setError] = useState(null); // 🆕

  useEffect(() => {
    const token = localStorage.getItem('spotify_token');
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new window.Spotify.Player({
        name: 'Moodify Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });

      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('✅ Spotify player ready with device ID:', device_id);
        localStorage.setItem('device_id', device_id);
        setDeviceId(device_id);
      });

      newPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Initialization Error:', message);
        setError(message); // 🆕
      });

      newPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Auth Error:', message);
        setError(message); // 🆕
      });

      newPlayer.addListener('account_error', ({ message }) => {
        console.error('Account Error:', message);
        setError("This feature requires Spotify Premium.");
      });

      newPlayer.addListener('playback_error', ({ message }) => {
        console.error('Playback Error:', message);
        setError(message); // 🆕
      });

      newPlayer.connect().then(success => {
        if (!success) {
          console.error("❌ Player connection failed (likely no Premium).");
          setError("Spotify Web Playback only works with Premium accounts.");
        }
      });

      setPlayer(newPlayer);
    };
  }, []);

  return (
    <div style={{ padding: "10px", backgroundColor: "#222", color: "#fff" }}>
      <p>🎵 Spotify Web Playback Initialized</p>
      {error ? (
        <p style={{ color: "red" }}>⚠️ {error}</p>
      ) : deviceId ? (
        <p>Device ID: {deviceId}</p>
      ) : (
        <p>Waiting for device ID...</p>
      )}
    </div>
  );
};

export default SpotifyPlayer; */

import React, { useEffect, useState } from 'react';

const SpotifyPlayer = () => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('spotify_token');
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new window.Spotify.Player({
        name: 'Moodify Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });

      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('✅ Spotify player ready with device ID:', device_id);
        localStorage.setItem('device_id', device_id);
        setDeviceId(device_id);

        // Optional: Transfer playback to this device
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_ids: [device_id], play: false }),
        });
      });

      newPlayer.addListener('initialization_error', ({ message }) => setError(message));
      newPlayer.addListener('authentication_error', ({ message }) => setError(message));
      newPlayer.addListener('account_error', ({ message }) => setError("This feature requires Spotify Premium."));
      newPlayer.addListener('playback_error', ({ message }) => setError(message));

      newPlayer.connect();
      setPlayer(newPlayer);
    };
  }, []);

  // 🔸 Playback control handlers
  const token = localStorage.getItem('spotify_token');

  const handlePlay = () => {
    const uri = localStorage.getItem("last_uri"); // optional
    const deviceId = localStorage.getItem('device_id');
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({}) // add uris: [] here if you want to play a track
    });
  };

  const handlePause = () => {
    fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleNext = () => {
    fetch("https://api.spotify.com/v1/me/player/next", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handlePrevious = () => {
    fetch("https://api.spotify.com/v1/me/player/previous", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <div style={{ padding: "10px", backgroundColor: "#222", color: "#fff" }}>
      <p>🎵 Spotify Web Playback Initialized</p>
      {error ? (
        <p style={{ color: "red" }}>⚠️ {error}</p>
      ) : deviceId ? (
        <>
          <p>Device ID: {deviceId}</p>
          <div style={{ marginTop: "10px" }}>
            <button onClick={handlePrevious}>⏮️</button>
            <button onClick={handlePlay}>▶️</button>
            <button onClick={handlePause}>⏸️</button>
            <button onClick={handleNext}>⏭️</button>
          </div>
        </>
      ) : (
        <p>Waiting for device ID...</p>
      )}
    </div>
  );
};

export default SpotifyPlayer;

