import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import NBAHeader from "../../../components/nbaHeader";
import { useAuth } from "../../../providers/AuthProvider";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../../../css/leagueHome.css";

const LeagueHome = () => {
  const { leagueId } = useParams();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Roster states
  const [startingLineup, setStartingLineup] = useState({
    PG: null,
    SG: null,
    SF: null,
    PF: null,
    C: null,
  });
  const [flex, setFlex] = useState([]);
  const [reserves, setReserves] = useState([]);

  // 1) Fetch the user's drafted players
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: draftPicks, error: fetchError } = await supabase
          .from("DraftPicks")
          .select(`pick_number, player:Players(id, firstName, lastName, position)`)
          .eq("league_id", leagueId)
          .eq("user_id", session.user.id);

        if (fetchError) throw fetchError;
        if (!draftPicks || draftPicks.length === 0) {
          throw new Error("No players found.");
        }

        // Assign them to lineup, flex, or reserves
        assignPlayersToLineup(draftPicks);
      } catch (err) {
        setError("Failed to load league data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId, session]);

  // 2) Assign players to initial sections
  const assignPlayersToLineup = (draftPicks) => {
    const lineup = { PG: null, SG: null, SF: null, PF: null, C: null };
    const flexSpots = [];

    draftPicks.forEach((pick) => {
      const { position } = pick.player;

      // Basic logic: fill lineup if empty, else push to flex
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
    // For simplicity, take first 3 as flex, the rest as reserves
    setFlex(flexSpots.slice(0, 3));
    setReserves(flexSpots.slice(3));
  };

  // 3) Handle the drop event
  const onDragEnd = (result) => {
    // If dropped outside a droppable, do nothing
    if (!result.destination) return;

    const { source, destination } = result;
    // If same place & index, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // We'll copy the existing state to new variables
    const newLineup = { ...startingLineup };
    const newFlex = [...flex];
    const newReserves = [...reserves];

    // 3a) Find the dragged item
    let draggedPlayer = null;

    // Remove from source
    if (["PG", "SG", "SF", "PF", "C"].includes(source.droppableId)) {
      draggedPlayer = newLineup[source.droppableId];
      newLineup[source.droppableId] = null; // Make it empty
    } else if (source.droppableId === "flex") {
      draggedPlayer = newFlex[source.index];
      newFlex.splice(source.index, 1);
    } else if (source.droppableId === "reserves") {
      draggedPlayer = newReserves[source.index];
      newReserves.splice(source.index, 1);
    }

    if (!draggedPlayer) return; // No player found, stop

    // 3b) Add to the destination
    if (["PG", "SG", "SF", "PF", "C"].includes(destination.droppableId)) {
      // If there's already someone in that spot, you could do a swap or just overwrite
      newLineup[destination.droppableId] = draggedPlayer;
    } else if (destination.droppableId === "flex") {
      // Insert at the right index or push
      newFlex.splice(destination.index, 0, draggedPlayer);
    } else if (destination.droppableId === "reserves") {
      newReserves.splice(destination.index, 0, draggedPlayer);
    }

    // 3c) Update state
    setStartingLineup(newLineup);
    setFlex(newFlex);
    setReserves(newReserves);
  };

  // 4) Render
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <NBAHeader />
      <div className="league-home-container">
        <h1>League Home</h1>

        {/* DragDropContext to handle onDragEnd */}
        <DragDropContext onDragEnd={onDragEnd}>
          {/* ========== STARTING LINEUP ========== */}
          <h2>Starting Lineup</h2>
          <div className="lineup-container">
            {Object.entries(startingLineup).map(([pos, player]) => (
              <Droppable key={pos} droppableId={pos}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="position-column"
                  >
                    <h3>{pos}</h3>
                    {player ? (
                      <Draggable
                        draggableId={String(player.player.id)}
                        index={0}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="player-item"
                          >
                            {player.player.firstName} {player.player.lastName} (
                            {player.player.position})
                          </div>
                        )}
                      </Draggable>
                    ) : (
                      <p>Empty</p>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>

          {/* ========== FLEX ========== */}
          <h2>Flex</h2>
          <div className="flex-container">
            <Droppable droppableId="flex">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="player-list"
                >
                  {flex.map((flexPlayer, index) => (
                    <Draggable
                      key={String(flexPlayer.player.id)}
                      draggableId={String(flexPlayer.player.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="player-item"
                        >
                          {flexPlayer.player.firstName}{" "}
                          {flexPlayer.player.lastName} (
                          {flexPlayer.player.position})
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* ========== RESERVES ========== */}
          <h2>Reserves</h2>
          <div className="reserves-container">
            <Droppable droppableId="reserves">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="player-list"
                >
                  {reserves.map((reservePlayer, index) => (
                    <Draggable
                      key={String(reservePlayer.player.id)}
                      draggableId={String(reservePlayer.player.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="player-item"
                        >
                          {reservePlayer.player.firstName}{" "}
                          {reservePlayer.player.lastName} (
                          {reservePlayer.player.position})
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </>
  );
};

export default LeagueHome;
