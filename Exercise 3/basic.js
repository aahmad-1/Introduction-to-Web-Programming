if(document.readyState !== "loading") {
    console.log("Document is ready!");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is currently loading!");
        initializeCode();
    });
}

function initializeCode() {
    async function fetch_data() {
        try {
            const tbody = document.getElementById("fetched-data");
            
            // Population query
            const populationQuery = {
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
            };
            
            // Employment query
            const employmentQuery = {
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
            };
            
            // Fetch population data
            const url1 = await fetch("https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(populationQuery)
            });
            const api_data1 = await url1.json();
            
            // Fetch employment data
            const url2 = await fetch("https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employmentQuery)
            });
            const api_data2 = await url2.json();
            
            // Extract data in similar style to your past code
            const municipalities = Object.values(api_data1.dimension.Alue.category.label);
            const valuesData = api_data1.value;
            const employmentData = api_data2.value;
            
            // Display the data in the table
            municipalities.forEach((municipality, index) => {
                const values = valuesData[index];
                const employment = employmentData[index];
                const employmentPercentage = ((employment / values) * 100).toFixed(2);
                
                let row = document.createElement("tr");
                row.innerHTML = 
                    `<td>${municipality}</td>
                    <td>${values}</td>
                    <td>${employment}</td>
                    <td>${employmentPercentage}%</td>`;
                
                if (employmentPercentage > 45) {
                    row.style.backgroundColor = "#abffbd";
                } else if (employmentPercentage < 25) {
                    row.style.backgroundColor = "#ff9e9e";
                }
                
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error("ERROR: ", error);
        }
    } 
    fetch_data();
}