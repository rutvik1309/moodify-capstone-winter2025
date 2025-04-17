/* import React from "react";
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
*/

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./home";
import VoiceCommand from "./voicecommand";
import SpotifyLogin from "./SpotifyLogin";
import Callback from "./Callback";
import Recommendations from "./Recommendations";
import Myplaylists from "./Myplaylists";

const App = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <div>
        <h1 style={{ textAlign: "center", marginTop: "20px" }}>Moodify: AI Playlist Generator 🎧</h1>
        <Routes>
          <Route path="/" element={<SpotifyLogin />} />
          <Route path="/callback" element={<Callback />} />

          {/* 🔒 Protect app routes */}
          <Route
            path="/home"
            element={isAuthenticated ? <Home /> : <Navigate to="/" />}
          />
          <Route
            path="/voicecommand"
            element={isAuthenticated ? <VoiceCommand /> : <Navigate to="/" />}
          />
          <Route
            path="/recommendations"
            element={isAuthenticated ? <Recommendations /> : <Navigate to="/" />}
          />
          <Route
            path="/playlists"
            element={isAuthenticated ? <Myplaylists /> : <Navigate to="/" />}
          />

          {/* 🚫 Optional: 404 route */}
          <Route path="*" element={<p style={{ textAlign: "center" }}>404 - Page not found</p>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
