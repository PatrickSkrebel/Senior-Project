import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/NBALeagueLeaders.css';
import '../../components/nbaHeader';
import NBAHeader from '../../components/nbaHeader';

const LeagueLeaders = () => {
  const [leaders, setLeaders] = useState([]);
  const [error, setError] = useState(null);

  const [seasonSelectedValue, setSeasonSelectedValue] = useState('2024-25');
  const [typeSelectValue, setTypeValue] = useState('Regular Season');
  const [perSelectValue, setPerMode] = useState('PerGame');
  const [statSelectValue, setStatTypeValue] = useState('PTS');

  const fetchLeagueLeaders = async (seasonSelectedValue, typeSelectValue, perMode, statCategory) => {
    try {
      const response = await axios.get(`https://stats.nba.com/stats/leagueLeaders`, {
        params: {
          LeagueID: '00',
          PerMode: perMode,
          StatCategory: statCategory,
          Season: seasonSelectedValue,
          SeasonType: typeSelectValue,
          Scope: 'S',
          ActiveFlag: null,
        },
        headers: {
          Accept: 'application/json, text/plain, */*',
          'x-nba-stats-origin': 'stats',
          'x-nba-stats-token': 'true',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });

      setLeaders(response.data.resultSet.rowSet);
    } catch (err) {
      setError(err);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeagueLeaders(seasonSelectedValue, typeSelectValue, perSelectValue, statSelectValue);
  }, [seasonSelectedValue, typeSelectValue, perSelectValue, statSelectValue]);

  const handleSeasonChange = (event) => setSeasonSelectedValue(event.target.value);
  const handleSeasonTypeChange = (event) => setTypeValue(event.target.value);
  const handlePerModeChange = (event) => setPerMode(event.target.value);
  const handleStatCategoryChange = (event) => setStatTypeValue(event.target.value);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
    <NBAHeader />
    <div className="league-leaders-page">
      <h1>NBA League Leaders</h1>
      <p className="disclaimer">* Total Points Isn't correct for any Season Type, Order is correct</p>

      <div className="selectors-container">
        <div className="selector">
          <label>
            Season:
            <select value={seasonSelectedValue} onChange={handleSeasonChange}>
              {Array.from({ length: 74 }, (_, index) => {
                const year = 2024 - index;
                const nextYear = (year + 1).toString().slice(-2);
                return (
                  <option key={year} value={`${year}-${nextYear}`}>
                    {`${year}-${nextYear}`}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <div className="selector">
          <label>
            Season Type:
            <select value={typeSelectValue} onChange={handleSeasonTypeChange}>
              <option value="Pre Season">Preseason</option>
              <option value="Regular Season">Regular Season</option>
              <option value="Playoffs">Playoffs</option>
              <option value="All Star">All-Star</option>
            </select>
          </label>
        </div>

        <div className="selector">
          <label>
            Per Mode:
            <select value={perSelectValue} onChange={handlePerModeChange}>
              <option value="Totals">Totals</option>
              <option value="PerGame">Per Game</option>
              <option value="Per48">Per 48 Minutes</option>
            </select>
          </label>
        </div>

        <div className="selector">
          <label>
            Stat Category:
            <select value={statSelectValue} onChange={handleStatCategoryChange}>
              <option value="MIN">MIN</option>
              <option value="OREB">OREB</option>
              <option value="DREB">DREB</option>
              <option value="REB">REB</option>
              <option value="AST">AST</option>
              <option value="STL">STL</option>
              <option value="BLK">BLK</option>
              <option value="TOV">TOV</option>
              <option value="EFF">EFF</option>
              <option value="PTS">PTS</option>
              <option value="FGM">FGM</option>
              <option value="FGA">FGA</option>
            </select>
          </label>
        </div>
      </div>

      {leaders.length === 0 ? (
        <div className="no-data">No Data</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Team</th>
              <th>GP</th>
              <th>MIN</th>
              <th>PTS</th>
              <th>FGM</th>
              <th>FGA</th>
              <th>FG%</th>
              <th>3PM</th>
              <th>3PA</th>
              <th>3P%</th>
              <th>FTM</th>
              <th>FTA</th>
              <th>FT%</th>
              <th>OREB</th>
              <th>DREB</th>
              <th>REB</th>
              <th>AST</th>
              <th>STL</th>
              <th>BLK</th>
              <th>TOV</th>
              <th>EFF</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((leader, index) => (
              <tr key={index}>
                <td>{leader[1]}</td>
                <td>{leader[2]}</td>
                <td>{leader[4]}</td>
                <td>{leader[5]}</td>
                <td>{leader[6]}</td>
                <td>{leader[23]}</td>
                <td>{leader[7]}</td>
                <td>{leader[8]}</td>
                <td>{parseFloat(leader[9] * 100).toFixed(1)}%</td>
                <td>{leader[10]}</td>
                <td>{leader[11]}</td>
                <td>{parseFloat(leader[12] * 100).toFixed(1)}%</td>
                <td>{leader[13]}</td>
                <td>{leader[14]}</td>
                <td>{parseFloat(leader[15] * 100).toFixed(1)}%</td>
                <td>{leader[16]}</td>
                <td>{leader[17]}</td>
                <td>{leader[18]}</td>
                <td>{leader[19]}</td>
                <td>{leader[20]}</td>
                <td>{leader[21]}</td>
                <td>{parseFloat(leader[22]).toFixed(1)}</td>
                <td>{leader[24]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </>
  );
};

export default LeagueLeaders;
