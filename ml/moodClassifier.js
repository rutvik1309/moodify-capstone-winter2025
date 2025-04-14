const { spawn } = require("child_process");

exports.classifyMood = async (req, res) => {
  const { userInput } = req.body;
  const py = spawn('python3', ['ml/infer_mood.py', userInput]);

  py.stdout.on("data", (data) => {
    res.json({ mood: data.toString().trim() });
  });

  py.stderr.on("data", (data) => {
    console.error("Error:", data.toString());
    res.status(500).json({ error: "Mood classification failed" });
  });
};
