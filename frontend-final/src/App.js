import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./home";
import VoiceCommand from "./voicecommand";
import SpotifyLogin from "./SpotifyLogin"; // make sure no space!
import Callback from "./Callback";
import Recommendations from "./Recommendations"; 
import Myplaylists from "./Myplaylists";

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
