import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import { useAuth } from "../../../providers/AuthProvider";
import { v4 as uuidv4 } from "uuid";
import FantasyHeader from "../../../components/nbaFantasyHeader";


const CreateJoinLeague = () => {
  const { session } = useAuth();
  const [leagueName, setLeagueName] = useState("");
  const [numTeams, setNumTeams] = useState(8);
  const [draftDate, setDraftDate] = useState("");
  const [leagues, setLeagues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all leagues with the username of the creator
  const fetchLeagues = async () => {
    try {
      setLoading(true);
  
      // Fetch leagues and include profiles.username for all users
      const { data, error } = await supabase
        .from("FantasyLeagues")
        .select("id, leagueName, leagueCode, numTeams, draftDate, profiles(username)")
        .order("created_at", { ascending: false });
  
      if (error) throw error;
  
      setLeagues(data); // Update state with the full list of leagues and creators
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
  
      const userId = session.user.id; // Get the current user's ID
      const leagueId = uuidv4();
      const leagueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
      const { data, error } = await supabase.from("FantasyLeagues").insert([
        {
          id: leagueId,
          leagueName,
          leagueCode,
          numTeams,
          draftDate,
          user_id: userId, // Associate the league with the current user
        },
      ]);
  
      if (error) throw error;
  
      setLeagueName("");
      setNumTeams(8);
      setDraftDate("");
      setError("");
      fetchLeagues();
      console.log("League created:", data);
    } catch (err) {
      console.error("Error creating league:", err.message);
      setError("Failed to create league. Please try again.");
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
                  <th>Created By</th> {/* New column for username */}
                  <th>Join</th>
                </tr>
              </thead>
              <tbody>
                {leagues.map((league) => (
                  <tr key={league.id}>
                    <td>{league.leagueName}</td>
                    <td>{league.numTeams}</td>
                    <td>{new Date(league.draftDate).toLocaleString()}</td>
                    <td>{league.profiles?.username || "Unknown"}</td> {/* Display the username */}
                    <td><button>Join</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && <p>No leagues available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateJoinLeague;
