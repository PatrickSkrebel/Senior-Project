import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import { useAuth } from "../../../providers/AuthProvider";
import { v4 as uuidv4 } from "uuid";
import FantasyHeader from "../../../components/nbaFantasyHeader";
import { useNavigate } from "react-router-dom";

const CreateJoinLeague = () => {
  const { session } = useAuth();
  const [leagueName, setLeagueName] = useState("");
  const [numTeams, setNumTeams] = useState(8);
  const [draftDate, setDraftDate] = useState("");
  const [leagues, setLeagues] = useState([]);
  const [isOpen, setIsOpen] = useState(true); // New state for open/private league
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupCode, setPopupCode] = useState(""); // State for popup input
  const [showPopup, setShowPopup] = useState(false); // State to show/hide popup
  const [selectedLeague, setSelectedLeague] = useState(null); // Selected league for joining
  const navigate = useNavigate();

  const fetchLeagues = async () => {
    try {
      setLoading(true);
  
      // Fetch all leagues
      const { data: allLeagues, error: allLeaguesError } = await supabase
        .from("FantasyLeagues")
        .select("id, leagueName, numTeams, draftDate, open, leagueCode, profiles(username)")
        .order("created_at", { ascending: false });
  
      if (allLeaguesError) throw allLeaguesError;
  
      // Fetch leagues the user has joined
      const { data: joinedLeagues, error: joinedLeaguesError } = await supabase
        .from("FantasyLeague")
        .select("league_id")
        .eq("userId", session.user.id);
  
      if (joinedLeaguesError) throw joinedLeaguesError;
  
      // Map joined league IDs for easier comparison
      const joinedLeagueIds = joinedLeagues.map((entry) => entry.league_id);
  
      // Add `isJoined` property to each league
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
  
  useEffect(() => {
    fetchLeagues();
  }, []);
  

  const handleCreateLeague = async () => {
    try {
      if (!leagueName || !draftDate) {
        setError("Please fill in all required fields.");
        return;
      }

      if (!session?.user?.id) {
        setError("User not authenticated. Please log in.");
        return;
      }

      const userId = session.user.id;
      const leagueId = uuidv4();
      const leagueCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase.from("FantasyLeagues").insert([
        {
          id: leagueId,
          leagueName,
          leagueCode,
          numTeams,
          draftDate,
          user_id: userId,
          open: isOpen, // Include the open/closed status
        },
      ]);

      if (error) throw error;

      setLeagueName("");
      setNumTeams(8);
      setDraftDate("");
      setIsOpen(true);
      setError("");
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

    if (!league.open) {
      // Show popup for code if the league is private
      setSelectedLeague(league);
      setShowPopup(true);
    } else {
      // Handle open league join directly
      joinLeague(league);
    }
  };

  const joinLeague = async (league, code = null) => {
    if (!session?.user?.id) return;
  
    try {
      const userId = session.user.id;
  
      // Check if user is already in the league
      const { data: existing, error: existingError } = await supabase
        .from("FantasyLeague")
        .select("*")
        .eq("league_id", league.id)
        .eq("userId", userId); // Match userId in the table
  
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
      const { data: members, error: membersError } = await supabase
        .from("FantasyLeague")
        .select("*")
        .eq("league_id", league.id);
  
      if (members?.length >= league.numTeams) {
        setError("League is full.");
        return;
      }
  
      // Add user to the league
      const { error } = await supabase.from("FantasyLeague").insert([
        { league_id: league.id, userId }, // Use userId to match the column name
      ]);
  
      if (error) throw error;
  
      setShowPopup(false);
      fetchLeagues(); // Refresh leagues
  
      // Navigate to draft screen after successful join
      navigate(`/nba/fantasy/draft/${league.id}`);
    } catch (err) {
      console.error("Error joining league:", err.message);
      setError("Failed to join league. Please try again.");
    }
  };
  
  
  

  return (
    <>
      <NBAHeader />
      <FantasyHeader />
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Create or Join a League</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ marginBottom: "20px" }}>
          <h2>Create a League</h2>
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
            type="datetime-local"
            placeholder="Draft Date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            style={{ display: "block", margin: "10px 0" }}
          />
          <label>
            <input
              type="checkbox"
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
            />
            Open League
          </label>
          <button onClick={handleCreateLeague}>Create League</button>
        </div>

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
                  <th>Created By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leagues.map((league) => (
                  <tr key={league.id}>
                    <td>{league.leagueName}</td>
                    <td>{league.numTeams}</td>
                    <td>{new Date(league.draftDate).toLocaleString()}</td>
                    <td>{league.profiles?.username || "Unknown"}</td>
                    <td>
                      {league.isJoined ? (
                        <button
                          onClick={() => navigate(`/nba/fantasy/draft/${league.id}`)}
                        >
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
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }}>
            <h3>Enter League Code</h3>
            <input
              type="text"
              value={popupCode}
              onChange={(e) => setPopupCode(e.target.value)}
              placeholder="League Code"
              style={{ display: "block", margin: "10px 0" }}
            />
            <button onClick={() => joinLeague(selectedLeague, popupCode)}>Submit</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateJoinLeague;
