import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import FantasyHeader from "../../../components/nbaFantasyHeader";
import { useAuth } from "../../../providers/AuthProvider";
import "../../../css/leagueHome.css";

const LeagueHome = () => {
  const { leagueId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [league, setLeague] = useState(null);
  const [members, setMembers] = useState([]);
  const [draftPicks, setDraftPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch league data and draft picks
  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setLoading(true);

        // Fetch league details
        const { data: leagueData } = await supabase
          .from("FantasyLeagues")
          .select("*")
          .eq("id", leagueId)
          .single();

        if (!leagueData) throw new Error("League not found.");
        setLeague(leagueData);

        // Fetch league members
        const { data: membersData } = await supabase
          .from("FantasyLeague")
          .select("userId, profiles!FantasyLeague_userId_fkey(username)")
          .eq("league_id", leagueId);

        setMembers(membersData);

        // Fetch draft picks
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

        setDraftPicks(picksData);
      } catch (err) {
        console.error(err);
        setError("Failed to load league data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, [leagueId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  // Get the user's team
  const userTeam = draftPicks.filter(pick => pick.user_id === session?.user?.id);

  return (
    <>
      <NBAHeader />
      <div className="league-home-container">
        <h1 className="league-home-header">{league?.leagueName || "League Home"}</h1>

        {/* League Overview */}
        <div className="league-overview">
          <h2>League Overview</h2>
          <p>Commissioner: {league?.commissionerUsername || "N/A"}</p>
          <p>Members: {members.length}</p>
          <p>Status: Draft Complete</p>
        </div>

        {/* Team Summary */}
        <div className="team-summary">
          <h2>Your Team</h2>
          {userTeam.length > 0 ? (
            <ul>
              {userTeam.map((pick) => (
                <li key={pick.player_id}>
                  {pick.player.firstName} {pick.player.lastName} ({pick.player.position})
                </li>
              ))}
            </ul>
          ) : (
            <p>No players drafted yet.</p>
          )}
        </div>

        {/* League Standings */}
        <div className="league-standings">
          <h2>League Standings</h2>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={member.userId}>
                  <td>{index + 1}</td>
                  <td>{member.profiles?.username || "Unknown"}</td>
                  <td>0</td> {/* Replace with actual points */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming Matchups */}
        <div className="upcoming-matchups">
          <h2>Upcoming Matchups</h2>
          <p>No matchups scheduled yet.</p> {/* Replace with actual matchups */}
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <p>No recent activity.</p> {/* Replace with actual activity feed */}
        </div>

        {/* Navigation */}
        <div className="navigation">
          <button onClick={() => navigate(`/league/${leagueId}/manage`)}>Manage Team</button>
          <button onClick={() => navigate(`/league/${leagueId}/chat`)}>League Chat</button>
          <button onClick={() => navigate(`/league/${leagueId}/settings`)}>League Settings</button>
        </div>
      </div>
    </>
  );
};

export default LeagueHome;