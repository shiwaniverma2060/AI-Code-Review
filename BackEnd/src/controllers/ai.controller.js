const aiservice = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return res.status(400).json({ error: "Code is required." });
  }

  if (code.length > 10000) {
    return res.status(400).json({ error: "Code too long. Max 10,000 characters." });
  }

  try {
    const response = await aiservice(code);
    res.send(response);
  } catch (error) {
    console.error("AI Service Error:", error.message);

    if (error.status === 429) {
      return res.status(429).json({ error: "Rate limit reached. Try again in a moment." });
    }

    res.status(500).json({ error: "Failed to generate review. Please try again." });
  }
};
