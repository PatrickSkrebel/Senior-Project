import { useState } from "react";
import Papa from "papaparse";

function excel() {
  const [data, setData] = useState([]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        setData(result.data);
      },
    });
  }

  return(
    <div>
      <input type="file" accept=".csv" onChange={handleFile}/>

      {data.length ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>win%</th>
              <th>conference</th>
              <th>div</th>
              <th>gb</th>
              <th>streak</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.name}</td>
                <td>{row.wins}</td>
                <td>{row.losses}</td>
                <td>{row.winPercentage}</td>
                <td>{row.conference}</td>
                <td>{row.division}</td>
                <td>{row.gamesBehind}</td>
                <th>{row.streak}</th>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data</p>
      )}
    </div>
  )
}

export default excel;