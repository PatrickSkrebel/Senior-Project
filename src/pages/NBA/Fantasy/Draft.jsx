import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import FantasyHeader from "../../../components/nbaFantasyHeader";
import { useAuth } from "../../../providers/AuthProvider";
import '../../../css/draft.css';

// Define positions & round limit
const positions = ["PG", "SG", "SF", "PF", "C"];
const totalRounds = 14;

const DraftScreen = () => {
  const { leagueId } = useParams();
  const { session } = useAuth();
  const [league, setLeague] = useState(null);
  const [members, setMembers] = useState([]);
  const [draftOrder, setDraftOrder] = useState([]);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftPicks, setDraftPicks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    fetchLeagueData();
    fetchDraftPicks();
  }, [leagueId]);

  useEffect(() => {
    if (timeLeft > 0 && draftOrder[currentPickIndex]?.userId === session?.user?.id) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      autoPickPlayer();
    }
  }, [timeLeft, currentPickIndex]);

  const fetchLeagueData = async () => {
    try {
      setLoading(true);
      const { data: leagueData } = await supabase.from("FantasyLeagues").select("*").eq("id", leagueId).single();
      setLeague(leagueData);
      setCurrentPickIndex(leagueData.currentPickIndex || 0);
      setCurrentRound(leagueData.currentRound || 1);

      const { data: membersData } = await supabase
        .from("FantasyLeague")
        .select("userId, profiles!FantasyLeague_userId_fkey(username)")
        .eq("league_id", leagueId)
        .order("created_at", { ascending: true });

      setMembers(membersData);

      const order = membersData.map(m => ({
        userId: m.userId,
        username: m.profiles?.username || "Unknown",
      }));
      setDraftOrder(order);

      const { data: playersData } = await supabase.from("Players").select("*").or(`draftedInLeagueId.is.null,draftedInLeagueId.eq.${leagueId}`);
      setPlayers(playersData);
    } catch (err) {
      console.error(err);
      setError("Failed to load league data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDraftPicks = async () => {
    try {
      const { data: picksData } = await supabase
        .from("DraftPicks")
        .select("pick_number, round, user_id, player_id, user:profiles(username), player:Players(firstName, lastName, position)")
        .eq("league_id", leagueId)
        .order("pick_number", { ascending: true });

      setDraftPicks(picksData);
    } catch (err) {
      console.error("Error fetching draft picks:", err);
      setError("Failed to load draft picks.");
    }
  };

  const handlePickPlayer = async () => {
    if (!selectedPlayer) return setError("Please select a player first.");
    if (draftOrder[currentPickIndex]?.userId !== session?.user?.id) return setError("It's not your turn.");

    try {
      setLoading(true);
      setError("");

      const pickNumber = draftPicks.length + 1;
      await supabase
        .from("DraftPicks")
        .insert([{ league_id: leagueId, user_id: session.user.id, player_id: selectedPlayer.id, pick_number: pickNumber, round: currentRound }]);

      await supabase.from("Players").update({ draftedInLeagueId: leagueId }).eq("id", selectedPlayer.id);

      let nextPickIndex = currentPickIndex + 1;
      let nextRound = currentRound;

      if (nextPickIndex >= draftOrder.length) {
        nextPickIndex = 0;
        nextRound += 1; // Start new round
      }

      setCurrentPickIndex(nextPickIndex);
      setCurrentRound(nextRound);
      setTimeLeft(120);

      await supabase.from("FantasyLeagues").update({ currentPickIndex: nextPickIndex, currentRound: nextRound }).eq("id", leagueId);

      setDraftPicks([...draftPicks, { pickNumber, round: currentRound, userId: session.user.id, username: "You", player: selectedPlayer }]);
      setPlayers(players.filter(p => p.id !== selectedPlayer.id));
      setSelectedPlayer(null);
    } catch (err) {
      console.error("Error drafting player:", err);
      setError("Failed to draft player.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NBAHeader />
      <FantasyHeader />
      <div className="draft-container">
        <h1 className="draft-header">Draft for {league?.leagueName || "League"}</h1>
        {error && <p className="error-message">{error}</p>}
        {loading && <p className="loading-message">Loading...</p>}

        <div className="draft-layout">
          {/* Left Panel - League Members */}
          <div className="league-members">
            <h3>League Members</h3>
            <ul>
              {draftOrder.map((member, index) => (
                <li key={member.userId} className={index === currentPickIndex ? "current-turn" : ""}>
                  {member.username} {index === currentPickIndex && "⬅ (Current Pick)"}
                </li>
              ))}
            </ul>
          </div>

          {/* Center Panel - Draft Info */}
          <div className="draft-info">
            <h2>Current Turn: {draftOrder[currentPickIndex]?.username || "N/A"}</h2>
            <h3>Time Left: {timeLeft}s</h3>

            {/* Round Tabs */}
            <div className="round-tabs">
              {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => (
                <button key={round} className={`tab-button ${round === currentRound ? "active" : ""}`} onClick={() => setCurrentRound(round)}>
                  Round {round}
                </button>
              ))}
            </div>

            <h3>Drafted Players - Round {currentRound}</h3>
            <ol>
              {draftPicks.filter(pick => pick.round === currentRound).map(pick => (
                <li key={pick.pickNumber}>
                  {pick.username} selected {pick.player.firstName} {pick.player.lastName} ({pick.player.position})
                </li>
              ))}
            </ol>

            <h3>Available Players</h3>
            <input type="text" placeholder="Search players..." className="search-bar" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

            <div className="player-list">
              {players.map(player => (
                <div key={player.id} onClick={() => setSelectedPlayer(player)} className="player-item">
                  {player.firstName} {player.lastName} ({player.position})
                </div>
              ))}
            </div>

            <button onClick={handlePickPlayer} disabled={!selectedPlayer} className="draft-button">
              Draft Player
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DraftScreen;
