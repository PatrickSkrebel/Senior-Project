import React, { useEffect, useState } from "react";
import MainHeader from "../../components/mainHeader";

const NFLHome = () => {
  const [games, setGames] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format date as YYYYMMDD for the API call
  const getFormattedDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // Fetch NFL games by formatted date
  const fetchNFLGames = async () => {
    setLoading(true);
    setError(""); // Clear previous errors

    const formattedDate = getFormattedDateForAPI(currentDate);

    try {
      const response = await fetch(
        `https://nfl-api-data.p.rapidapi.com/nfl-scoreboard-day?day=${formattedDate}`,
        {
          headers: {
            "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
            "x-rapidapi-host": "nfl-api-data.p.rapidapi.com",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unexpected response code: ${response.status}`);
      }

      const data = await response.json();

      // Extract games from the response
      if (data?.events?.length > 0) {
        setGames(data.events); // Use the `events` array from the API response
      } else {
        setGames([]);
        console.warn("No games found for the selected date.");
      }
    } catch (err) {
      console.error("Error fetching NFL games:", err.message || err);
      setError("Failed to load games. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFLGames();
  }, [currentDate]);

  const handlePreviousDay = () => {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    setCurrentDate(previousDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  };

  const getFormattedDisplayDate = (date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <MainHeader />
      <div>
        <header className="nfl-header">
          <h1>NFL Scoreboard</h1>
          <h2>{getFormattedDisplayDate(currentDate)}</h2> {/* Display the current date */}
        </header>

        <div className="live-games-wrapper">
          <button className="arrow-button left-arrow" onClick={handlePreviousDay}>
            &#8592;
          </button>
          <div className="live-games-row">
            {loading ? (
              <p>Loading games...</p>
            ) : error ? (
              <p>{error}</p>
            ) : games.length > 0 ? (
              games.map((game) => (
                <div key={game.id} className="game-card-horizontal">
                  {/* Away Team */}
                  <div className="team-row-horizontal">
                    <div className="team-info">
                      <p className="team-short-names">{game.competitors[1]?.team?.shortDisplayName || "N/A"}</p>
                    </div>
                    <div className="quarters-section">
                      <div className="quarters-label">
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                        <span>Q4</span>
                      </div>
                      <div className="quarters-scores">
                        <span>{game.competitors[1]?.linescores?.[0]?.value || 0}</span>
                        <span>{game.competitors[1]?.linescores?.[1]?.value || 0}</span>
                        <span>{game.competitors[1]?.linescores?.[2]?.value || 0}</span>
                        <span>{game.competitors[1]?.linescores?.[3]?.value || 0}</span>
                      </div>
                    </div>
                    <span className="team-score">{game.competitors[1]?.score || 0}</span>
                  </div>

                  {/* Home Team */}
                  <div className="team-row-horizontal">
                    <div className="team-info">
                      <p className="team-short-names">{game.competitors[0]?.team?.shortDisplayName || "N/A"}</p>
                    </div>
                    <div className="quarters-section">
                      <div className="quarters-label">
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                        <span>Q4</span>
                      </div>
                      <div className="quarters-scores">
                        <span>{game.competitors[0]?.linescores?.[0]?.value || 0}</span>
                        <span>{game.competitors[0]?.linescores?.[1]?.value || 0}</span>
                        <span>{game.competitors[0]?.linescores?.[2]?.value || 0}</span>
                        <span>{game.competitors[0]?.linescores?.[3]?.value || 0}</span>
                      </div>
                    </div>
                    <span className="team-score">{game.competitors[0]?.score || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No games available for the selected date</p>
            )}
          </div>
          <button className="arrow-button right-arrow" onClick={handleNextDay}>
            &#8594;
          </button>
        </div>
      </div>

      {/* Scoped Styles */}
      <style jsx>{`
        .nfl-header {
          text-align: center;
          background-color: #002244;
          color: #ffffff;
          padding: 20px;
          margin-bottom: 20px;
          border-bottom: 5px solid #d50a0a;
        }

        .live-games-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }

        .arrow-button {
          background-color: #002244;
          color: #ffffff;
          border: none;
          border-radius: 50%;
          font-size: 1.5em;
          width: 50px;
          height: 50px;
          cursor: pointer;
          margin: 10px;
        }

        .live-games-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
        }

        .game-card-horizontal {
          background-color: #ffffff;
          border: 1px solid #ccc;
          border-radius: 10px;
          padding: 15px;
          width: 300px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        .team-row-horizontal {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quarters-section {
          text-align: center;
        }

        .quarters-label span,
        .quarters-scores span {
          margin: 0 5px;
        }
      `}</style>
    </>
  );
};

export default NFLHome;
