if(document.readyState !== "loading") {
    console.log("Document is ready!");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document was loaded after initial readyState check!");
        initializeCode();
    });
}

function initializeCode() {
    async function fetch_data() {
        try {
            const tbody = document.getElementById("fetched-data");
            
            // Clear any existing data
            tbody.innerHTML = "";
            
            // Population data API (using the new URL from your assignment)
            const populationResponse = await fetch("https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "query": [
                        {
                            "code": "Alue",
                            "selection": {
                                "filter": "agg:_- Kunnat aakkosjärjestyksessä 2025.agg",
                                "values": ["SSS", "KU020", "KU005", /* ... all other municipality codes ... */]
                            }
                        },
                        {
                            "code": "Tiedot",
                            "selection": {
                                "filter": "item",
                                "values": ["vaesto"]
                            }
                        },
                        {
                            "code": "Vuosi",
                            "selection": {
                                "filter": "item",
                                "values": ["2023"]
                            }
                        }
                    ],
                    "response": {
                        "format": "json-stat2"
                    }
                })
            });
            
            if (!populationResponse.ok) {
                throw new Error(`Population data fetch failed with status ${populationResponse.status}`);
            }
            const populationData = await populationResponse.json();
            
            // Employment data API (using the new URL from your assignment)
            const employmentResponse = await fetch("https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "query": [
                        {
                            "code": "Alue",
                            "selection": {
                                "filter": "agg:_Kunnat aakkosjärjestyksessä 2024.agg",
                                "values": ["SSS", "KU020", "KU005", /* ... all other municipality codes ... */]
                            }
                        },
                        {
                            "code": "Pääasiallinen toiminta",
                            "selection": {
                                "filter": "item",
                                "values": ["11"]
                            }
                        },
                        {
                            "code": "Sukupuoli",
                            "selection": {
                                "filter": "item",
                                "values": ["SSS"]
                            }
                        },
                        {
                            "code": "Ikä",
                            "selection": {
                                "filter": "item",
                                "values": ["SSS"]
                            }
                        },
                        {
                            "code": "Vuosi",
                            "selection": {
                                "filter": "item",
                                "values": ["2023"]
                            }
                        }
                    ],
                    "response": {
                        "format": "json-stat2"
                    }
                })
            });
            
            if (!employmentResponse.ok) {
                throw new Error(`Employment data fetch failed with status ${employmentResponse.status}`);
            }
            const employmentData = await employmentResponse.json();
            
            // Extract data
            const municipalities = Object.values(populationData.dimension.Alue.category.label);
            const populationValues = populationData.value;
            const employmentValues = employmentData.value;
            
            // Display the data in the table
            municipalities.forEach((municipality, index) => {
                const population = populationValues[index];
                const employment = employmentValues[index];
                
                // Calculate employment percentage (handle division by zero)
                let employmentPercentage = "N/A";
                if (population > 0) {
                    employmentPercentage = ((employment / population) * 100).toFixed(2) + "%";
                }
                
                // Create table row
                const row = document.createElement("tr");
                
                // Set row content
                row.innerHTML = `
                    <td>${municipality}</td>
                    <td>${population}</td>
                    <td>${employment}</td>
                    <td>${employmentPercentage}</td>
                `;
                
                // Apply conditional styling if we have a valid percentage
                if (population > 0) {
                    const percentageValue = parseFloat(employmentPercentage);
                    if (percentageValue > 45) {
                        row.style.backgroundColor = "#abffbd";
                    } else if (percentageValue < 25) {
                        row.style.backgroundColor = "#ff9e9e";
                    }
                }
                
                // Add row to table
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error("Error fetching or processing data:", error);
            // Display error message to user
            const errorRow = document.createElement("tr");
            errorRow.innerHTML = `<td colspan="4" style="color: red; text-align: center;">Error loading data: ${error.message}</td>`;
            document.getElementById("fetched-data").appendChild(errorRow);
        }
    } 
    
    fetch_data();
}