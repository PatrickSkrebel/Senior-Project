import React, { useState } from "react";
import * as XLSX from "xlsx";

function TEST() {
    const [data, setData] = useState([]);

    const handleFileUpload = (event) => {
        const reader = new FileReader();
        reader.readAsBinaryString(event.target.files[0]);
        reader.onload = (event) => {
            const data = e.target.results;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);
            setData(parsedData);
        };
    }

  return (
    <div>
        <input 
            type="file"
            accept=".xlsx, .xls"
            onchange={handleFileUpload}
        />

        {data.length > 0 && (
            <table>
                <thead>
                    <tr>
                        {Object.keys(data[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {Object.values(row).map((value) => (
                                <td>{value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        )}

      <h1>TEST</h1>
    </div>
  );
}

export default TEST;