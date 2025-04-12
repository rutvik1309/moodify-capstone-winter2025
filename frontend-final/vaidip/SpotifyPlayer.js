import React, { useEffect, useState } from 'react';

const SpotifyPlayer = () => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

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
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('✅ Spotify player ready with device ID:', device_id);
        localStorage.setItem('device_id', device_id);
        setDeviceId(device_id);
      });

      newPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Initialization Error:', message);
      });

      newPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Auth Error:', message);
      });

      newPlayer.addListener('account_error', ({ message }) => {
        console.error('Account Error:', message);
      });

      newPlayer.addListener('playback_error', ({ message }) => {
        console.error('Playback Error:', message);
      });

      newPlayer.connect();
      setPlayer(newPlayer);
    };
  }, []);

  return (
    <div style={{ padding: "10px", backgroundColor: "#222", color: "#fff" }}>
      <p>🎵 Spotify Web Playback Initialized</p>
      {deviceId ? <p>Device ID: {deviceId}</p> : <p>Waiting for device ID...</p>}
    </div>
  );
};

export default SpotifyPlayer;
