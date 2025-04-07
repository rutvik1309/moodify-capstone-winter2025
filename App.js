import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import VoiceCommand from "./components/voicecommand";
import SpotifyLogin from "./components/SpotifyLogin"; // make sure no space!
import Callback from "./components/Callback";
import Recommendations from "./components/Recommendations"; 
import Myplaylists from "./components/Myplaylists";

const App = () => {
  return (
    <Router>
      <div>
        <h1>Moodify: AI Playlist Generator</h1>
        <Routes>
  <Route path="/" element={<SpotifyLogin />} />
  <Route path="/callback" element={<Callback />} />
  <Route path="/home" element={<Home />} />
  <Route path="/voicecommand" element={<VoiceCommand />} />
  <Route path="/recommendations" element={<Recommendations />} />
  <Route path="/playlists" element={<Myplaylists />} />
</Routes>

      </div>
    </Router>
  );
};

export default App;
