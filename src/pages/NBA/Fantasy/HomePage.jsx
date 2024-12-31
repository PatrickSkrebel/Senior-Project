import React from "react";
import NBAHeader from "../../../components/nbaHeader";
import FantasyHeader from "../../../components/nbaFantasyHeader";

const FantasyHome = () => {
  return (
    <div>
      <NBAHeader />
      <FantasyHeader />
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Fantasy Basketball Home</h1>
        <h2>Top Performers</h2>
        {/* Placeholder for top performers */}
        <div style={{ display: "flex", gap: "20px", overflowX: "auto" }}>
          {/* Example player card */}
          <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "10px", width: "200px" }}>
            <img
              src="https://via.placeholder.com/150"
              alt="Player"
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <h3>Player Name</h3>
            <p>Points: 25</p>
            <p>Rebounds: 10</p>
            <p>Assists: 5</p>
          </div>
        </div>
        <h2>Recent News</h2>
        <p>Placeholder for news articles.</p>
      </div>
    </div>
  );
};

export default FantasyHome;
