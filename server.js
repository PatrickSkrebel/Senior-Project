import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());

// API Cache (to minimize requests to the external API)
const apiCache = {};

// Define the endpoint to fetch player statistics
app.get("/api/player-stats", async (req, res) => {
  const { team, season } = req.query; // Get player ID and season from query parameters
  const cacheKey = `${id}-${season}`;

  // Check if data exists in cache
  if (apiCache[cacheKey]) {
    return res.json(apiCache[cacheKey]);
  }

  try {
    // Fetch data from the external API
    const response = await axios.get(
      "https://api-nba-v1.p.rapidapi.com/players/statistics",
      {
        params: { id, season },
        headers: {
          "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
          "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
        },
      }
    );

    // Store response in cache
    apiCache[cacheKey] = response.data;

    // Send the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching player statistics:", error.message);
    res.status(500).json({ error: "Failed to fetch player statistics" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:${PORT}");
});