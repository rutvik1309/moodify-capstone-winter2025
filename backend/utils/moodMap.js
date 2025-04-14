// utils/moodMap.js
const moodAudioMap = {
    happy:     { valence: [0.6, 1], energy: [0.6, 1] },
    sad:       { valence: [0, 0.4], energy: [0, 0.5] },
    chill:     { valence: [0.4, 0.7], energy: [0.2, 0.5] },
    romantic:  { valence: [0.5, 1], energy: [0.3, 0.6] },
    angry:     { valence: [0, 0.4], energy: [0.7, 1] },
    energetic: { valence: [0.5, 1], energy: [0.8, 1] },
    // fallback if not matched
    default:   { valence: [0.3, 0.7], energy: [0.3, 0.7] }
  };
  
  module.exports = moodAudioMap;
  