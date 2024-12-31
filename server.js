import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/api/fantasy", async (req, res) => {
  const url =
    "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/teams";
  const consumerKey = "YOUR_CONSUMER_KEY";
  const consumerSecret = "YOUR_CONSUMER_SECRET";

  // Add OAuth logic here if needed

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: "OAuth YOUR_AUTH_HEADER",
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
