const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");

// -- 1) Initialize Supabase Client --
const supabaseUrl = "https://rrolkubksaqlkusokhcw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyb2xrdWJrc2FxbGt1c29raGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NjE3NDksImV4cCI6MjA0NjEzNzc0OX0.C1bYh29tnq38wz7uLMZpLsKPRktG4OL39yR20sTa-jI";
const supabase = createClient(supabaseUrl, supabaseKey);

// -- 2) RapidAPI Config --
const RAPID_API_KEY = "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02";
const teams = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 38, 40, 41];
const season = 2024;

// Optional: Map NBA team IDs to UUIDs from your "Teams" table
const teamUuidMap = {
  // Add all mappings...
};

// -- 3) Main Function to Pull and Insert Players --
async function populatePlayers() {
  try {
    for (const teamId of teams) {
      // 1) Fetch players from the NBA API
      const url = `https://api-nba-v1.p.rapidapi.com/players?team=${teamId}&season=${season}`;
      const response = await axios.get(url, {
        headers: {
          "x-rapidapi-key": RAPID_API_KEY,
          "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
        },
      });

      // 2) Map the API data to your table structure
      const players = response.data?.response || [];
      const playersToInsert = players.map((p) => ({
        apiId: p.id,                // external player ID (must be UNIQUE)
        firstName: p.firstname || "",
        lastName: p.lastname || "",
        teamId: teamUuidMap[teamId], // map external team ID to UUID
        isDrafted: false,           // default
        position: p.leagues?.standard?.pos || null,
      }));

      // 3) Upsert into your "Players" table
      const { error } = await supabase
        .from("Players")
        .upsert(playersToInsert, {
          onConflict: "apiId", // requires UNIQUE(apiId) in your table
        });

      if (error) {
        console.error(`Error inserting players for team ${teamId}:`, error.message);
      } else {
        console.log(`Inserted/updated ${playersToInsert.length} players for team ${teamId}.`);
      }
    }

    console.log("All teams processed successfully!");
  } catch (err) {
    console.error("populatePlayers error:", err);
  }
}

// -- 4) Run the script --
populatePlayers()
  .then(() => {
    console.log("Player population complete. Exiting script...");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error in populatePlayers:", err);
    process.exit(1);
  });
