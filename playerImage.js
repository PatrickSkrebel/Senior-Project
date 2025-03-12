import express from "express";
import axios from "axios";
import cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const BASE_URL = "https://basketball.realgm.com";

// Scrape Player Links
const scrapePlayerLinks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/nba/players`);
    const $ = cheerio.load(response.data);
    const playerLinks = [];

    $("td[data-th='Player']").each((i, element) => {
      const link = $(element).find("a").attr("href");
      if (link) playerLinks.push(link);
    });

    return playerLinks;
  } catch (error) {
    console.error("Error scraping player links:", error);
    return [];
  }
};

// Download and Upload Images to Supabase
const scrapeImagesAndUpload = async (playerLinks) => {
  for (const playerLink of playerLinks) {
    try {
      const response = await axios.get(`${BASE_URL}${playerLink}`);
      const $ = cheerio.load(response.data);

      const imgElement = $("img[style*='border: 1px solid #000']");
      if (!imgElement.length) continue;

      const imgUrl = imgElement.attr("src");
      if (!imgUrl) continue;

      // Extract player name from image URL
      const srcParts = imgUrl.split("/");
      const nameParts = srcParts[srcParts.length - 1].split("_");
      const fileName = `${nameParts[1]}-${nameParts[0]}.jpg`;

      // Download image
      const imageResponse = await axios.get(`${BASE_URL}${imgUrl}`, { responseType: "arraybuffer" });
      const buffer = Buffer.from(imageResponse.data, "binary");

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("player_images").upload(fileName, buffer, {
        contentType: "image/jpeg",
      });

      if (error) {
        console.error(`Error uploading ${fileName} to Supabase:`, error);
        continue;
      }

      // Store record in Supabase database
      const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/player_images/${fileName}`;

      const { data: dbData, error: dbError } = await supabase.from("player_images").insert([
        {
          player_name: nameParts[1],
          image_url: publicUrl,
        },
      ]);

      if (dbError) console.error("Error inserting into DB:", dbError);
      else console.log(`Successfully uploaded ${fileName} -> ${publicUrl}`);
    } catch (error) {
      console.error(`Error processing player: ${playerLink}`, error);
    }
  }
};

// API Route to Trigger Scraping
app.get("/scrape-players", async (req, res) => {
  const playerLinks = await scrapePlayerLinks();
  if (playerLinks.length === 0) return res.status(500).json({ message: "Failed to scrape player links." });

  await scrapeImagesAndUpload(playerLinks);
  res.json({ message: "Scraping and upload completed!" });
});

// Start the Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
