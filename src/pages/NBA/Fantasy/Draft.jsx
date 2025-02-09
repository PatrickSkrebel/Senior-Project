import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import FantasyHeader from "../../../components/nbaFantasyHeader";
import { useAuth } from "../../../providers/AuthProvider"; // If you have an auth context

const DraftScreen = () => {
  const { leagueId } = useParams();
  const { session } = useAuth(); // Current logged-in user
  const [league, setLeague] = useState(null); // League info
  const [members, setMembers] = useState([]);
  const [draftOrder, setDraftOrder] = useState([]); // List of members in draft order
  const [currentPickIndex, setCurrentPickIndex] = useState(0); // Which index in draftOrder is up
  const [players, setPlayers] = useState([]); // List of available players
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [error, setError] = useState(""); //  Error message
  const [loading, setLoading] = useState(false); // Loading state
  const [draftPicks, setDraftPicks] = useState([]); // List of all draft picks

  const fetchLeagueData = async () => {
    try {
      setLoading(true);

      // 1) Fetch league info
      const { data: leagueData, error: leagueError } = await supabase
        .from("FantasyLeagues")
        .select("*")
        .eq("id", leagueId)
        .single();
        setCurrentPickIndex(leagueData.currentPickIndex || 0);
      if (leagueError) throw leagueError;
      setLeague(leagueData);

      // 2) Fetch members who joined this league
      const { data: membersData, error: membersError } = await supabase
        .from("FantasyLeague")
        .select("userId, created_at, profiles!FantasyLeague_userId_fkey(username)")
        .eq("league_id", leagueId)
        .order("created_at", { ascending: true });
      if (membersError) throw membersError;
      setMembers(membersData);

      // 3) Generate draft order (e.g., by join order)
      //    Here we just use the order from membersData, but you could randomize it.
      //    We'll store an array of { userId, username } in state
      const order = membersData.map(m => ({
        userId: m.userId,
        username: m.profiles?.username || "Unknown",
      }));
      setDraftOrder(order);

      // 4) Fetch the current pick index from the league data
      // Fetch available players for this league
      const { data: playersData, error: playersError } = await supabase
        .from("Players")
        .select("*")
        .or(`draftedInLeagueId.is.null,draftedInLeagueId.eq.${leagueId}`); // Include undrafted or drafted in this league

      if (playersError) throw playersError;
      setPlayers(playersData);


      

    } catch (err) {
      console.error(err);
      setError("Failed to load league data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagueData();
  }, [leagueId]);

  // Helper: Check if the draft date/time has passed
  const isDraftStarted = () => {
    if (!league) return false; // Ensure league data exists
    const draftDateStr = league.draftDate; // e.g., "2025-01-31"
    const draftTimeStr = league.time;      // e.g., "13:00"
    if (!draftDateStr || !draftTimeStr) return false;
  
    const draftDateTime = new Date(`${draftDateStr}T${draftTimeStr}`);
    const now = new Date();
    return now >= draftDateTime; // True if the current time is after the draft start time
  };
  

  // Handler: When user picks a player
  const handlePickPlayer = async () => {
    if (!selectedPlayer) {
      setError("Please select a player first.");
      return;
    }
  
    const currentUserId = session?.user?.id;
    const currentUserInOrder = draftOrder[currentPickIndex]?.userId;
  
    if (currentUserId !== currentUserInOrder) {
      setError("It's not your turn.");
      return;
    }
  
    try {
      setLoading(true);
      setError("");
  
      const pickNumber = currentPickIndex + 1;
  
      // 1) Insert draft pick into database
      const { error: draftError } = await supabase
        .from("DraftPicks")
        .insert([{
          league_id: leagueId,
          user_id: currentUserId,
          player_id: selectedPlayer.id,
          pick_number: pickNumber,
        }]);
  
      if (draftError) throw draftError;
  
      // 2) Mark the player as drafted in the current league
      const { error: updateError } = await supabase
        .from("Players")
        .update({ draftedInLeagueId: leagueId })
        .eq("id", selectedPlayer.id);
  
      if (updateError) throw updateError;
  
      // 3) Update local state
      setDraftPicks((prev) => [
        ...prev,
        {
          pickNumber,
          userId: currentUserId,
          username: draftOrder[currentPickIndex].username,
          player: selectedPlayer,
        },
      ]);
      setPlayers((prev) => prev.filter((p) => p.id !== selectedPlayer.id));
      setCurrentPickIndex((prev) => prev + 1);
      setSelectedPlayer(null);
    } catch (err) {
      console.error("Error drafting player:", err);
      setError("Failed to draft the player. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  const fetchDraftPicks = async () => {
    try {
      const { data: picksData, error: picksError } = await supabase
        .from("DraftPicks")
        .select("pick_number, user_id, player_id, user:profiles(username), player:Players(firstName, lastName)")
        .eq("league_id", leagueId)
        .order("pick_number", { ascending: true });
  
      if (picksError) throw picksError;
  
      setDraftPicks(
        picksData.map((pick) => ({
          pickNumber: pick.pick_number,
          userId: pick.user_id,
          username: pick.user?.username || "Unknown",
          player: pick.player,
        }))
      );
    } catch (err) {
      console.error("Error fetching draft picks:", err);
      setError("Failed to load draft picks. Please try again later.");
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchLeagueData();  // Fetch league data and members
      await fetchDraftPicks();  // Fetch saved draft picks
    };
  
    fetchData();
  }, [leagueId]);
  
  

  // Function that displays all picks in the draft order
  const renderDraftPicks = () => {
    return (
      <div>
        <h3>Draft Picks</h3>
        <ol>
          {draftPicks.map((pick) => (
            <li key={pick.pickNumber}>
              {pick.username} selected {pick.player.firstName} {pick.player.lastName}
            </li>
          ))}
        </ol>
      </div>
    );
  };
  

  // Just a convenience for readability
  const currentPicker = draftOrder[currentPickIndex]?.username || "N/A";

  return (
    <>
      <NBAHeader />
      <FantasyHeader />
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Draft for {league?.leagueName || "League"}</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p>Loading...</p>}

        {/* If league is loaded, display details */}
        {league && (
          <>
            <p>Draft Date: {league.draftDate}</p>
            <p>Draft Time: {league.time}</p>
            <p>Max Teams: {league.numTeams}</p>
          </>
        )}

        {/* Check if the draft has started */}
        {!league ? (
          <p>Loading league...</p>
        ) : !isDraftStarted() ? (
          <p>The draft has not started yet. Please come back at the scheduled time.</p>
        ) : (
          <>
            {/* The draft is active */}
            <h2>Current Turn: {currentPicker}</h2>

            {/* Show draft order */}
            <h3>Draft Order:</h3>
            <ol>
              {draftOrder.map((m, index) => (
                <li key={m.userId}>
                  {m.username} {index === currentPickIndex && "← (Current)"}
                </li>
              ))}
            </ol>

            {/* Player selection */}
            <div style={{ marginTop: "20px" }}>
            <h3>Available Players</h3>
              <select
                value={selectedPlayer?.id || ""}
                onChange={(e) => {
                  const playerId = e.target.value;

                  // Find the chosen player from the players list
                  const chosenPlayer = players.find((pl) => pl.id === playerId);

                  if (chosenPlayer) {
                    setSelectedPlayer(chosenPlayer);
                  } else {
                    setError("Selected player not found in the list.");
                  }
                }}
              >
                <option value="">Select a player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.firstName} {player.lastName} (Team {player.teamId})
                  </option>
                ))}
              </select>


              <button onClick={handlePickPlayer} disabled={!selectedPlayer}>
                Draft Player
              </button>
            </div>

            {/* Display drafted players */}
            {renderDraftPicks()}
          </>
        )}
      </div>
    </>
  );
};

export default DraftScreen;
