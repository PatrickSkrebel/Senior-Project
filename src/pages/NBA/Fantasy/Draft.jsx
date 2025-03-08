import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import FantasyHeader from "../../../components/nbaFantasyHeader";
import { useAuth } from "../../../providers/AuthProvider";
import "../../../css/draft.css";
import { useNavigate } from "react-router-dom";

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
  const [selectedPosition, setSelectedPosition] = useState("All"); // Default: Show all positions
  const navigate = useNavigate(); // Add useNavigate

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
  
        // Debugging: Log the draftStatus
        console.log("Draft Status:", leagueData.draftStatus);
  
        // Only redirect if the draft is complete
        if (leagueData.draftStatus === "complete") {
          navigate(`/nba/fantasy/leagueHome/${leagueId}`);
        }
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
  
  const fetchDraftPicks = async () => {
    try {
      const { data: picksData } = await supabase
        .from("DraftPicks")
        .select(`
          pick_number, 
          round, 
          user_id, 
          player_id,
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

  
  const subscribeToChanges = () => {
    const draftPicksChannel = supabase
      .channel('draft-picks-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'DraftPicks', filter: `league_id=eq.${leagueId}` },
        async (payload) => {
          try {
            const { data: playerData, error: playerError } = await supabase
              .from("Players")
              .select("*")
              .eq("id", payload.new.player_id)
              .single();
  
            if (playerError) throw playerError;
  
            setDraftPicks((prev) => [
              ...prev,
              {
                ...payload.new,
                player: playerData || { firstName: "Unknown", lastName: "", position: "N/A" },
              },
            ]);
  
            setPlayers((prevPlayers) =>
              prevPlayers.filter((p) => p.id !== payload.new.player_id)
            );
          } catch (err) {
            console.error("Error handling draft pick change:", err);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("Error subscribing to draft picks changes:", err);
        } else {
          console.log("Subscribed to draft picks changes:", status);
        }
      });
  
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
      .subscribe((status, err) => {
        if (err) {
          console.error("Error subscribing to league changes:", err);
        } else {
          console.log("Subscribed to league changes:", status);
        }
      });
  
    return () => {
      supabase.removeChannel(draftPicksChannel);
      supabase.removeChannel(leagueChannel);
    };
  };

  // const handleDraftCompletion = async () => {
  //   try {
  //     // Update the draft status to "complete" in the database
  //     const { error: updateError } = await supabase
  //       .from("FantasyLeagues")
  //       .update({ draftStatus: "complete" })
  //       .eq("id", leagueId);
  
  //     if (updateError) throw updateError;
  
  //     // Debugging: Log the draft completion
  //     console.log("Draft completed. Redirecting to LeagueHome...");
  
  //     // Redirect to the LeagueHome screen
  //     navigate(`/nba/fantasy/leagueHome/${leagueId}`);
  //   } catch (err) {
  //     console.error("Error completing draft:", err);
  //     setError("Failed to complete draft.");
  //   }
  // };
  
  // Check if the draft is complete
  // useEffect(() => {
  //   const totalExpectedPicks = draftOrder.length * totalRounds;
  //   console.log("Total Expected Picks:", totalExpectedPicks);
  //   console.log("Current Draft Picks:", draftPicks.length);
  //   console.log("Draft Status:", league?.draftStatus);
  
  //   if (draftPicks.length >= totalExpectedPicks && league?.draftStatus !== "complete") {
  //     console.log("Draft is complete. Updating status...");
  //     handleDraftCompletion();
  //   }
  // }, [draftPicks, draftOrder, league, leagueId, navigate]);

  // Check if the draft is complete
  const isDraftComplete = draftPicks.length >= draftOrder.length * totalRounds;

  // Redirect to League Home Page if the draft is complete
  // useEffect(() => {
  //   if (isDraftComplete) {
  //     navigate(`/nba/fantasy/leagueHome/${leagueId}`); // Redirect to League Home Page
  //   }
  // }, [isDraftComplete, leagueId, navigate]);

  // Fetch league data, draft picks, and subscribe to changes
  useEffect(() => {
    fetchLeagueData();
    fetchDraftPicks();
    const unsubscribe = subscribeToChanges();
    return () => unsubscribe();
  }, [leagueId]);


  // Handle how many players are drafted in the league
  const getPositionCounts = (userId) => {
    const userDrafts = draftPicks.filter(pick => pick.user_id === userId);
    const positionCounts = {
      G: 0, // Guards
      F: 0, // Forwards
      C: 0, // Centers
      SF: 0, // Small Forwards
    };
  
    userDrafts.forEach(pick => {
      const position = pick.player?.position;
      if (position in positionCounts) {
        positionCounts[position]++;
      }
    });
  
    return positionCounts;
  };
  
  // Handle player pick
  const handlePickPlayer = async () => {
    if (!selectedPlayer) return setError("Please select a player first.");
    if (!session || draftOrder[currentPickIndex]?.userId !== session.user?.id) {
      return setError("It's not your turn.");
    }
  
    try {
      setLoading(true);
      setError("");
  
      const pickNumber = draftPicks.length + 1;
  
      // Insert the draft pick
      const { data: newDraftPick, error: insertError } = await supabase
        .from("DraftPicks")
        .insert([
          {
            league_id: leagueId,
            user_id: session.user.id,
            player_id: selectedPlayer.id,
            pick_number: pickNumber,
            round: currentRound,
            drafted_at: new Date().toISOString(),
          },
        ])
        .single();
  
      if (insertError) throw insertError;
  
      // Mark the player as drafted in the league
      const { error: updateError } = await supabase
        .from("Players")
        .update({ draftedInLeagueId: leagueId })
        .eq("id", selectedPlayer.id);
  
      if (updateError) throw updateError;
  
      // Update the draftPicks state with the new pick and player data
      setDraftPicks((prev) => [
        ...prev,
        {
          ...newDraftPick,
          player: selectedPlayer,
        },
      ]);
  
      // Remove drafted player from the available players list
      setPlayers((prevPlayers) =>
        prevPlayers.filter((p) => p.id !== selectedPlayer.id)
      );
  
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

  const filteredPlayers = players.filter(player => {
    // Filter by position
    const matchesPosition = selectedPosition === "All" || player.position === selectedPosition;
  
    // Filter by search query (case-insensitive)
    const matchesSearch = player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          player.lastName.toLowerCase().includes(searchQuery.toLowerCase());
  
    return matchesPosition && matchesSearch;
  });

    // Ensure session is not null before accessing session.user
    if (!session) {
      return <p>Loading session...</p>; // Or redirect to login
    }
  
    // Check if session is loading
    // const [isSessionLoading, setIsSessionLoading] = useState(true);
    const [isSessionLoading, setIsSessionLoading] = useState(true);
  
    // Set isSessionLoading to false when session is available
    useEffect(() => {
      if (session) {
        setIsSessionLoading(false);
      }
    }, [session]);
  
    if (isSessionLoading) {
      return <p>Loading session...</p>;
    }

  return (
    <>
      <NBAHeader />      
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

                    <button
            onClick={() => navigate(`/nba/fantasy/leagueHome/${leagueId}`)}
            className="league-home-button"
          >
            Go to League Home
          </button>

          <div className="position-counts">
            <h3>Your Position Counts:</h3>
            <ul>
              {Object.entries(getPositionCounts(session.user.id)).map(([position, count]) => (
                <li key={position}>
                  {position}: {count} / {position === "G" || position === "F" ? 4 : 3}
                </li>
              ))}
            </ul>
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
            <div className="filters">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />

            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="position-filter"
            >
              <option value="All">All Positions</option>
              <option value="G">Guards (G)</option>
              <option value="F">Small Forward (F)</option>
              <option value="F-C">Power Forward (F-C)</option>
              <option value="C">Center (C)</option>
            </select>
          </div>

          <div className="player-list">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className={`player-item ${selectedPlayer?.id === player.id ? "selected" : ""}`}
              >
                {player.firstName} {player.lastName} ({player.position})
              </div>
            ))
          ) : (
            <p>No players found.</p>
          )}
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