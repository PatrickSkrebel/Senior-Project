import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import FantasyHeader from "../../../components/nbaFantasyHeader";
import { useAuth } from "../../../providers/AuthProvider";
import "../../../css/draft.css";

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

  // Fetch league data, draft picks, and subscribe to changes
  useEffect(() => {
    fetchLeagueData();
    fetchDraftPicks();
    const unsubscribe = subscribeToChanges();
    return () => unsubscribe();
  }, [leagueId]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && draftOrder[currentPickIndex]?.userId === session?.user?.id) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      autoPickPlayer();
    }
  }, [timeLeft, currentPickIndex]);

  // Fetch league data, including currentPickIndex and currentRound
  const fetchLeagueData = async () => {
    try {
      setLoading(true);
      const { data: leagueData } = await supabase
        .from("FantasyLeagues")
        .select("*")
        .eq("id", leagueId)
        .single();

      if (leagueData) {
        setLeague(leagueData);
        setCurrentPickIndex(leagueData.currentPickIndex || 0);
        setCurrentRound(leagueData.currentRound || 1);
      }

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

      const { data: playersData } = await supabase
        .from("Players")
        .select("*")
        .or(`draftedInLeagueId.is.null,draftedInLeagueId.eq.${leagueId}`);

      setPlayers(playersData);
    } catch (err) {
      console.error(err);
      setError("Failed to load league data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch draft picks
  const fetchDraftPicks = async () => {
    try {
      const { data: picksData } = await supabase
        .from("DraftPicks")
        .select(`
          pick_number, round, user_id, player_id,
          user:profiles(username),
          player:Players(id, firstName, lastName, position)
        `)
        .eq("league_id", leagueId)
        .order("pick_number", { ascending: true });
  
      // Ensure each pick has a player before setting state
      const validPicks = picksData.map(pick => ({
        ...pick,
        player: pick.player || { firstName: "Unknown", lastName: "", position: "N/A" } // Default fallback
      }));
  
      setDraftPicks(validPicks);
    } catch (err) {
      console.error("Error fetching draft picks:", err);
      setError("Failed to load draft picks.");
    }
  };
  

  useEffect(() => {
    fetchLeagueData();
    fetchDraftPicks();
  
    const unsubscribe = subscribeToChanges();
    return () => unsubscribe();
  }, [leagueId]);
  
  const subscribeToChanges = () => {
    const draftPicksChannel = supabase
      .channel('draft-picks-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'DraftPicks', filter: `league_id=eq.${leagueId}` },
        (payload) => {
          setDraftPicks(prev => [...prev, payload.new]); // Update draft picks list
          setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== payload.new.player_id)); // Remove drafted player
        }
      )
      .subscribe();
  
    const leagueChannel = supabase
      .channel('league-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'FantasyLeagues', filter: `id=eq.${leagueId}` },
        (payload) => {
          setCurrentPickIndex(payload.new.currentPickIndex);
          setCurrentRound(payload.new.currentRound);
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(draftPicksChannel);
      supabase.removeChannel(leagueChannel);
    };
  };
  
  

  // Handle player pick
  const handlePickPlayer = async () => {
    if (!selectedPlayer) return setError("Please select a player first.");
    if (draftOrder[currentPickIndex]?.userId !== session?.user?.id) return setError("It's not your turn.");
    
    try {
      setLoading(true);
      setError("");
  
      const pickNumber = draftPicks.length + 1;
  
      // Insert the draft pick
      const { data: newDraftPick, error: insertError } = await supabase
        .from("DraftPicks")
        .insert([{
          league_id: leagueId,
          user_id: session.user.id,
          player_id: selectedPlayer.id,
          pick_number: pickNumber,
          round: currentRound,
          drafted_at: new Date().toISOString(),
        }])
        .single();
  
      if (insertError) throw insertError;
  
      // Mark the player as drafted in the league
      const { error: updateError } = await supabase
        .from("Players")
        .update({ draftedInLeagueId: leagueId })
        .eq("id", selectedPlayer.id);
  
      if (updateError) throw updateError;
  
      // Remove drafted player from the available players list
      setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== selectedPlayer.id));
  
      // Update the draft order
      let nextPickIndex = currentPickIndex + 1;
      let nextRound = currentRound;
  
      if (nextPickIndex >= draftOrder.length) {
        nextPickIndex = 0;
        nextRound += 1; // Start new round
      }
  
      // Update the league state in the database
      const { error: leagueUpdateError } = await supabase
        .from("FantasyLeagues")
        .update({ currentPickIndex: nextPickIndex, currentRound: nextRound })
        .eq("id", leagueId);
  
      if (leagueUpdateError) throw leagueUpdateError;
  
      // Reset selection and timer
      setCurrentPickIndex(nextPickIndex);
      setCurrentRound(nextRound);
      setTimeLeft(120);
      setSelectedPlayer(null);
    } catch (err) {
      console.error("Error drafting player:", err);
      setError("Failed to draft player.");
    } finally {
      setLoading(false);
    }
  };
  

  // Auto-pick a player if time runs out
  const autoPickPlayer = async () => {
    if (draftOrder[currentPickIndex]?.userId !== session?.user?.id) return;

    const availablePlayers = players.filter(player => !player.isDrafted);
    if (availablePlayers.length === 0) return;

    const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    setSelectedPlayer(randomPlayer);
    await handlePickPlayer();
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

          <div className="draft-info">
            <h2>Current Turn: {draftOrder[currentPickIndex]?.username || "N/A"}</h2>
            <h3>Time Left: {timeLeft}s</h3>

            <h3>Drafted Players</h3>
            <div className="drafted-players">
              {draftOrder.map((member) => {
                const userDrafts = draftPicks.filter(pick => pick.user_id === member.userId);
                return (
                  <div key={member.userId} className="user-draft">
                    <h4>{member.username}</h4>
                    {userDrafts.length > 0 ? (
                      <ul>
                        {userDrafts.map((pick) => (
                          <li key={pick.pick_number}>
                            {pick.player
                              ? `${pick.player.firstName} ${pick.player.lastName} (${pick.player.position})`
                              : "Unknown Player"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No players drafted yet</p>
                    )}
                  </div>
                );
              })}
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