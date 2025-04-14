const axios = require("axios");

exports.classifyMood = async (req, res) => {
  try {
    const { text } = req.body;
    const response = await axios.post("http://localhost:5001/predict", { text });

    const predictedMood = response.data.mood;
    res.status(200).json({ mood: predictedMood });
  } catch (error) {
    console.error("🔥 Error classifying mood:", error.message);
    res.status(500).json({ error: "Mood classification failed" });
  }
};
