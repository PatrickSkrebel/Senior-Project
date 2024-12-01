import React , { useEffect, useState } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";

const Fantasy = () => {

    const [players, setPlayers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(31);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPlayer, setSearchPlayer] = useState([]);

    const [playerCount, setPlayerCount] = useState(100);
    const [cursor, setCursor] = useState(0);      
    const [selectedValue, setSelectedValue] = useState('');


    useEffect(() => {
        const fetchPlayers = async () => {
          try {
            const response = await axios.get(`https://api.balldontlie.io/v1/players?per_page=${playerCount}&cursor=${cursor}`, {
              headers: {
                'Authorization': `d599cf75-13b3-413a-a46e-a13fca488265`
              }
            });
            setPlayers(response.data.data);            
          } catch (error) {
            setError('Failed to fetch data');
            console.error('Error fetching players:', error);
          } finally{
            setLoading(false);
          }

        };

      
        fetchPlayers();

      }, [playerCount, currentPage]); // Dependency on currentPage to refetch when it changes


    const handleSearchChange = (event) => {
        setSearchPlayer(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const response = await axios.get(`https://api.balldontlie.io/v1/players?search=${searchPlayer}`, {
                headers: { 'Authorization': `d599cf75-13b3-413a-a46e-a13fca488265` }
            });
            setPlayers(response.data.data); // Display the searched players
        } catch (error) {
            setError('Failed to fetch player search');
        } finally {
            setLoading(false);
        }
    };

    return(
        <table style={{ marginLeft: 'auto', marginRight: 'auto', borderCollapse: 'collapse' }}>
        <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ border: '1px solid black', padding: '8px' }}>#</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Position</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>College</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Country</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Team</th>
            </tr>

        </thead>
        <tbody>

            {players.map((player) => (
                <tr key={player.id} style={{ border: '1px solid black', padding: '8px' }}>
                    <td>{player.jersey_number}</td>
                    <td><Link to={`/playerStat?playerId=${player.id}`}>{player.first_name} {player.last_name}</Link></td>
                    <td>{player.position}</td>
                    <td>{player.college}</td> {/* Assuming you'll update this later */}
                    <td>{player.country}</td> {/* Assuming you'll update this later */}
                    <td>{player.team.full_name}</td> {/* Assuming you'll update this later */}
                </tr>
            ))}
            
        </tbody>
    </table>
    )
}

export default Fantasy;