if(document.readyState !== "loading") {
    console.log("Document is ready!");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is ready after waiting!");
        initializeCode();
    });
}

function initializeCode() {
    async function fetch_data() {
        try {
            const tbody = document.getElementById("data-added");
            
            // Clear any existing data
            tbody.innerHTML = "";
            
            // Fetch population and employment query JSON files
            const populationQueryResponse = await fetch("population_query.json");
            if (!populationQueryResponse.ok) {
                throw new Error(`Failed to fetch population query: ${populationQueryResponse.status}`);
            }
            const populationQuery = await populationQueryResponse.json();
            
            const employmentQueryResponse = await fetch("employment_query.json");
            if (!employmentQueryResponse.ok) {
                throw new Error(`Failed to fetch employment query: ${employmentQueryResponse.status}`);
            }
            const employmentQuery = await employmentQueryResponse.json();
            
            // Fetch population & employment data from the APIs
            const populationResponse = await fetch("https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(populationQuery)
            });
            
            if (!populationResponse.ok) {
                throw new Error(`Population data fetch failed with status ${populationResponse.status}`);
            }
            const populationData = await populationResponse.json();
            
            const employmentResponse = await fetch("https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employmentQuery)
            });
            
            if (!employmentResponse.ok) {
                throw new Error(`Employment data fetch failed with status ${employmentResponse.status}`);
            }
            const employmentData = await employmentResponse.json();
            
            // Extract data
            const municipalities = Object.values(populationData.dimension.Alue.category.label);
            const populationValues = populationData.value;
            const employmentValues = employmentData.value;
            
            // Display data in the table
            municipalities.forEach((municipality, index) => {
                const population = populationValues[index];
                const employment = employmentValues[index];
                
                if (population > 0) {
                    employmentPercentage = ((employment / population) * 100).toFixed(2) + "%";
                } else {
                    employmentPercentage = "N/A";
                }
                
                const row = document.createElement("tr");
                
                row.innerHTML = `
                    <td>${municipality}</td>
                    <td>${population}</td>
                    <td>${employment}</td>
                    <td>${employmentPercentage}</td>
                `;
                
                // Row colors based on the employment percentage
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
            const errorRow = document.createElement("tr");
            errorRow.innerHTML = `<td colspan="4" style="color: red; text-align: center;">Error loading data: ${error.message}</td>`;
            document.getElementById("data-added").appendChild(errorRow);
        }
    } 
    
    fetch_data();
}