const fetch = require("node-fetch");
const fs = require("fs");
const { Parser } = require("json2csv");
const cron = require("node-cron");

/**
 * 1. Define a function that fetches your NBA standings from an API.
 *    In this example, we'll assume you have an endpoint that returns an array of team objects.
 */
async function fetchNbaStandingsFromApi() {
  // Replace this with your actual API endpoint
  const NBA_API_ENDPOINT = "https://api.example.com/nba/standings";
  
  const response = await fetch(NBA_API_ENDPOINT);
  if (!response.ok) {
    throw new Error("Failed to fetch NBA standings from API");
  }
  const data = await response.json();
  return data;
}

/**
 * 2. Convert the fetched data to CSV format using `json2csv`.
 */
function convertStandingsToCsv(standings) {
  // Define the fields (columns) for your CSV.
  // These fields should match the object properties in `standings`.
  const fields = [
    "id",
    "name",
    "logo",
    "wins",
    "losses",
    "winPercentage",
    "conference",
    "division",
    "gamesBehind",
    "streak",
    "winStreak",
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(standings);
  return csv;
}

/**
 * 3. Write the CSV string to a file, e.g., `standings.csv`.
 */
function writeCsvToFile(csvData, filePath) {
  fs.writeFileSync(filePath, csvData, "utf-8");
  console.log(`CSV file updated at ${filePath}`);
}

/**
 * 4. The main function: fetch data, convert to CSV, write to file.
 */
async function updateCsvFile() {
  try {
    const standings = await fetchNbaStandingsFromApi();
    
    // Convert to CSV
    const csvData = convertStandingsToCsv(standings);
    
    // Write CSV to a specific directory—here, we're using `public/` so React can serve it.
    writeCsvToFile(csvData, "./public/standings.csv");
  } catch (error) {
    console.error("Error updating CSV:", error);
  }
}

// 5. Use `node-cron` to schedule the update every 30 minutes.
//    The cron expression `0,30 * * * *` means run at minute 0 and 30 of every hour.
cron.schedule("0,30 * * * *", () => {
  console.log("Running scheduled job to update NBA standings CSV...");
  updateCsvFile();
});

// If you want to run it immediately once the script starts (e.g. on server startup):
updateCsvFile();
