import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Assuming you use React Router
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import FantasyHeader from "../../../components/nbaFantasyHeader";

const DraftScreen = () => {
  const { leagueId } = useParams(); // Get league ID from the route params
  const [league, setLeague] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch league info and members
  const fetchLeagueData = async () => {
    try {
      setLoading(true);
  
      // Fetch league details
      const { data: leagueData, error: leagueError } = await supabase
        .from("FantasyLeagues")
        .select("*")
        .eq("id", leagueId)
        .single();
  
      if (leagueError) throw leagueError;
      setLeague(leagueData);
  
      // Fetch league members with usernames
      const { data: membersData, error: membersError } = await supabase
      .from("FantasyLeague")
      .select("userId, role, created_at, profiles!FantasyLeague_userId_fkey(username)")
      .eq("league_id", leagueId)
      .order("created_at", { ascending: true });
    
  
      if (membersError) throw membersError;
      setMembers(membersData);
    } catch (err) {
      console.error("Error fetching draft data:", err.message);
      setError("Failed to load draft data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLeagueData();
  }, [leagueId]);

  return (
    <>
      <NBAHeader />
      <FantasyHeader />
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Draft for {league?.leagueName || "League"}</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading && <p>Loading draft data...</p>}

        {!loading && league && (
          <>
            <h2>Draft Date: {new Date(league.draftDate).toLocaleString()}</h2>
            <h3>Max Teams: {league.numTeams}</h3>

            <h3>League Members:</h3>
            {members.length > 0 ? (
            <ul>
                {members.map((member, index) => (
                <li key={index}>
                    {member.profiles?.username || "Unknown User"}
                </li>
                ))}
            </ul>
            ) : (
            <p>No members yet.</p>
            )}

          </>
        )}
      </div>
    </>
  );
};

export default DraftScreen;
