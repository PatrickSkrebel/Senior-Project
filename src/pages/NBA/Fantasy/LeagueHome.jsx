import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import { useAuth } from "../../../providers/AuthProvider";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../../../css/leagueHome.css";

const LeagueHome = () => {
  const { leagueId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [league, setLeague] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lineup state
  const [startingLineup, setStartingLineup] = useState({
    PG: null,
    SG: null,
    SF: null,
    PF: null,
    C: null,
  });
  const [flex, setFlex] = useState([]);
  const [reserves, setReserves] = useState([]);

  // Fetch data when session or leagueId changes
  useEffect(() => {
    if (!session || !session.user) return; // Skip if session is not available

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: draftPicks, error: fetchError } = await supabase
          .from("DraftPicks")
          .select(
            `pick_number, round, player_id, 
             player:Players(id, firstName, lastName, position)`
          )
          .eq("league_id", leagueId)
          .eq("user_id", session.user.id)
          .order("pick_number", { ascending: true });

        if (fetchError) throw fetchError;
        if (!draftPicks || draftPicks.length === 0) throw new Error("No players found.");

        setPlayers(draftPicks);
        assignPlayersToLineup(draftPicks);
      } catch (err) {
        console.error(err);
        setError("Failed to load league data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId, session]);

  // Assign players to lineup, flex, and reserves
  const assignPlayersToLineup = (draftPicks) => {
    const lineup = { PG: null, SG: null, SF: null, PF: null, C: null };
    const flexSpots = [];
    const bench = [];

    draftPicks.forEach((pick) => {
      const { position } = pick.player;

      if (position === "G") {
        if (!lineup.PG) lineup.PG = pick;
        else if (!lineup.SG) lineup.SG = pick;
        else flexSpots.push(pick);
      } else if (position === "F") {
        if (!lineup.SF) lineup.SF = pick;
        else if (!lineup.PF) lineup.PF = pick;
        else flexSpots.push(pick);
      } else if (position === "F-C") {
        if (!lineup.PF) lineup.PF = pick;
        else if (!lineup.C) lineup.C = pick;
        else flexSpots.push(pick);
      } else if (position === "C") {
        if (!lineup.C) lineup.C = pick;
        else flexSpots.push(pick);
      } else {
        flexSpots.push(pick);
      }
    });

    setStartingLineup(lineup);
    setFlex(flexSpots.slice(0, 3));
    setReserves(flexSpots.slice(3));
  };

  // Handle drag-and-drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Get source and destination lists
    const sourceList =
      source.droppableId === "flex"
        ? flex
        : source.droppableId === "reserves"
        ? reserves
        : [startingLineup[source.droppableId]];
    const destinationList =
      destination.droppableId === "flex"
        ? flex
        : destination.droppableId === "reserves"
        ? reserves
        : [startingLineup[destination.droppableId]];

    const player = sourceList[source.index];

    // Validate position swap
    if (destination.droppableId !== "reserves") {
      const validSwap = validatePosition(destination.droppableId, player);
      if (!validSwap) return;
    }

    // Remove player from source
    if (source.droppableId === "flex") {
      const updatedFlex = [...flex];
      updatedFlex.splice(source.index, 1);
      setFlex(updatedFlex);
    } else if (source.droppableId === "reserves") {
      const updatedReserves = [...reserves];
      updatedReserves.splice(source.index, 1);
      setReserves(updatedReserves);
    } else {
      setStartingLineup((prev) => ({ ...prev, [source.droppableId]: null }));
    }

    // Add player to destination
    if (destination.droppableId === "flex") {
      setFlex([...flex, player]);
    } else if (destination.droppableId === "reserves") {
      setReserves([...reserves, player]);
    } else {
      setStartingLineup((prev) => ({ ...prev, [destination.droppableId]: player }));
    }
  };

  // Validate player position
  const validatePosition = (position, player) => {
    const { position: playerPos } = player.player;
    if (position === "PG" || position === "SG") return playerPos === "G";
    if (position === "SF" || position === "PF") return playerPos === "F";
    if (position === "C") return playerPos === "C" || playerPos === "F-C";
    return true;
  };

  // Render loading or error state
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!session || !session.user) return <p>Please log in to access the league.</p>;

  return (
    <>
      <NBAHeader />
      <div className="league-home-container">
        <h1>{league?.leagueName || "League Home"}</h1>

        <DragDropContext onDragEnd={onDragEnd}>
          <h2>Starting Lineup</h2>
          <div className="lineup-container">
            {Object.entries(startingLineup).map(([pos, player]) => (
              <Droppable key={pos} droppableId={pos}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <h3>{pos}</h3>
                    {player && (
                      <Draggable draggableId={player.player.id} index={0}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {player.player.firstName} {player.player.lastName} ({player.player.position})
                          </div>
                        )}
                      </Draggable>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>

          <h2>Flex</h2>
          <Droppable droppableId="flex">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {flex.map((player, index) => (
                  <Draggable key={player.player.id} draggableId={player.player.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {player.player.firstName} {player.player.lastName} ({player.player.position})
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>


          <h2>Reserves</h2>
          
        </DragDropContext>
      </div>
    </>
  );
};

export default LeagueHome;