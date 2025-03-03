import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import { useAuth } from "../../../providers/AuthProvider";
import { v4 as uuidv4 } from "uuid";
import FantasyHeader from "../../../components/nbaFantasyHeader";
import { useNavigate } from "react-router-dom";

const CreateJoinLeague = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [leagueName, setLeagueName] = useState("");
  const [numTeams, setNumTeams] = useState(8);
  const [draftDate, setDraftDate] = useState("");
  const [draftTime, setDraftTime] = useState(""); // NEW: State for the time column
  const [leagues, setLeagues] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Popup states
  const [popupCode, setPopupCode] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      setLoading(true);

      // Fetch all leagues (now including 'time')
      const { data: allLeagues, error: allLeaguesError } = await supabase
        .from("FantasyLeagues")
        .select("id, leagueName, numTeams, draftDate, time, open, leagueCode, profiles(username)")
        .order("created_at", { ascending: false });

      if (allLeaguesError) throw allLeaguesError;

      // Fetch leagues the user has joined
      const { data: joinedLeagues, error: joinedLeaguesError } = await supabase
        .from("FantasyLeague")
        .select("league_id")
        .eq("userId", session.user.id);

      if (joinedLeaguesError) throw joinedLeaguesError;

      // Map joined league IDs
      const joinedLeagueIds = joinedLeagues.map((entry) => entry.league_id);

      // Add isJoined property
      const leaguesWithJoinStatus = allLeagues.map((league) => ({
        ...league,
        isJoined: joinedLeagueIds.includes(league.id),
      }));

      setLeagues(leaguesWithJoinStatus);
    } catch (err) {
      console.error("Error fetching leagues:", err.message);
      setError("Failed to fetch leagues. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeague = async () => {
    try {
      if (!leagueName || !draftDate) {
        setError("Please fill in all required fields (name, draft date, and time).");
        return;
      }
  
      if (!session?.user?.id) {
        setError("User not authenticated. Please log in.");
        return;
      }
  
      const userId = session.user.id;
      const leagueId = uuidv4();
  
      // Generate a random 6-character code
      const leagueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
      const { data, error } = await supabase.from("FantasyLeagues").insert([
        {
          id: leagueId,
          leagueName,
          leagueCode,
          numTeams,
          draftDate,
          time: draftTime,
          user_id: userId,
          open: isOpen,
          draftStatus: "pending", // Explicitly set draftStatus to "pending"
        },
      ]);
  
      if (error) throw error;
  
      // Clear form
      setLeagueName("");
      setNumTeams(8);
      setDraftDate("");
      setDraftTime("");
      setIsOpen(true);
      setError("");
  
      // Refresh leagues
      fetchLeagues();
      console.log("League created:", data);
    } catch (err) {
      console.error("Error creating league:", err.message);
      setError("Failed to create league. Please try again.");
    }
  };

  const handleJoinLeague = async (league) => {
    if (!session?.user?.id) {
      setError("User not authenticated. Please log in.");
      return;
    }

    // If league is private, show code popup
    if (!league.open) {
      setSelectedLeague(league);
      setShowPopup(true);
    } else {
      // If league is open, join directly
      joinLeague(league);
    }
  };

  const joinLeague = async (league, code = null) => {
    if (!session?.user?.id) return;
  
    try {
      const userId = session.user.id;
  
      // Check if user is already in the league
      const { data: existing } = await supabase
        .from("FantasyLeague")
        .select("*")
        .eq("league_id", league.id)
        .eq("userId", userId);
  
      if (existing?.length > 0) {
        setError("You have already joined this league.");
        return;
      }
  
      // Validate code if required
      if (!league.open && code !== league.leagueCode) {
        setError("Invalid league code.");
        return;
      }
  
      // Check if the league is full
      const { data: members } = await supabase
        .from("FantasyLeague")
        .select("*")
        .eq("league_id", league.id);
  
      if (members?.length >= league.numTeams) {
        setError("League is full.");
        return;
      }
  
      // Join the league
      const { error: joinError } = await supabase
        .from("FantasyLeague")
        .insert([{ league_id: league.id, userId }]);
  
      if (joinError) throw joinError;
  
      // Add the user to the DraftOrder table
      await addToDraftOrder(league.id, userId);
  
      setShowPopup(false);
      fetchLeagues();
  
      // Navigate to Draft screen
      navigate(`/nba/fantasy/draft/${league.id}`);
    } catch (err) {
      console.error("Error joining league:", err.message);
      setError("Failed to join league. Please try again.");
    }
  };

  const addToDraftOrder = async (leagueId, userId) => {
    try {
      // Get the current draft order for the league
      const { data: currentOrder, error: orderError } = await supabase
        .from("DraftOrder")
        .select("order")
        .eq("league_id", leagueId)
        .order("order", { ascending: true });
  
      if (orderError) throw orderError;
  
      // Determine the next order position
      const nextOrder = currentOrder?.length ? currentOrder.length + 1 : 1;
  
      // Insert the new user into the DraftOrder table
      const { error: insertError } = await supabase
        .from("DraftOrder")
        .insert([{ league_id: leagueId, user_id: userId, order: nextOrder }]);
  
      if (insertError) throw insertError;
  
      console.log(`User ${userId} added to draft order at position ${nextOrder}`);
    } catch (err) {
      console.error("Error adding user to draft order:", err.message);
      setError("Failed to update draft order. Please try again.");
    }
  };
  
  
  return (
    <>
      <NBAHeader />
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Create or Join a League</h1>
        <p>Must be signed in</p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Create League Form */}
        <div style={{ marginBottom: "20px" }}>
          <label>League Name</label>
          <input
            type="text"
            placeholder="League Name"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            style={{ display: "block", margin: "10px 0" }}
          />

          <label>Number of Teams</label>
          <input
            type="number"
            placeholder="Number of Teams"
            value={numTeams}
            onChange={(e) => setNumTeams(parseInt(e.target.value, 10))}
            style={{ display: "block", margin: "10px 0" }}
          />

          <label>Draft Date</label>
          <input
            type="date"
            placeholder="Draft Date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            style={{ display: "block", margin: "10px 0" }}
          />

          {/* NEW: Draft Time */}
          <label>Draft Time</label>
          <input
            type="time"
            placeholder="Draft Time"
            value={draftTime}
            onChange={(e) => setDraftTime(e.target.value)}
            style={{ display: "block", margin: "10px 0" }}
          />

          <label>
            <input
              type="checkbox"
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
              style={{ marginRight: "5px" }}
            />
            Open League
          </label>

          <button onClick={handleCreateLeague} style={{ display: "block", marginTop: "10px" }}>
            Create League
          </button>
        </div>

        {/* List of All Leagues */}
        <div style={{ marginTop: "30px" }}>
          <h2>All Leagues</h2>
          {loading && <p>Loading leagues...</p>}

          {leagues.length > 0 ? (
            <table
              border="1"
              cellPadding="10"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>League Name</th>
                  <th>Number of Teams</th>
                  <th>Draft Date</th>
                  <th>Draft Time</th>
                  <th>Created By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leagues.map((league) => (
                  <tr key={league.id}>
                    <td>{league.leagueName}</td>
                    <td>{league.numTeams}</td>

                    {/* Show the Date in a readable format */}
                    <td>
                      {league.draftDate
                        ? new Date(league.draftDate).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* NEW: Display the 'time' column */}
                    <td>{league.time || "N/A"}</td>

                    <td>{league.profiles?.username || "Unknown"}</td>
                    <td>
                      {league.isJoined ? (
                        <button onClick={() => navigate(`/nba/fantasy/draft/${league.id}`)}>
                          View
                        </button>
                      ) : (
                        <button onClick={() => handleJoinLeague(league)}>Join</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && <p>No leagues available.</p>
          )}
        </div>

        {/* Popup for private league code */}
        {showPopup && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
              zIndex: 999,
            }}
          >
            <h3>Enter League Code</h3>
            <input
              type="text"
              value={popupCode}
              onChange={(e) => setPopupCode(e.target.value)}
              placeholder="League Code"
              style={{ display: "block", margin: "10px 0" }}
            />
            <button onClick={() => joinLeague(selectedLeague, popupCode)}>
              Submit
            </button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateJoinLeague;
