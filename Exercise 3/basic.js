// Ensure the DOM is fully loaded before running the script
if (document.readyState !== "loading") {
    console.log("Document is ready!");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is ready after waiting!");
        initializeCode();
    });
}

/**
 * Fetches data from a given URL using a POST request with a JSON body.
 * @param {string} url - The API endpoint URL.
 * @param {object} body - The JSON object to send as the request body.
 * @returns {Promise<object>} - A promise that resolves to the parsed JSON response.
 */
async function fetchStatFinData(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return null; // Return null or handle the error as appropriate
    }
}

/**
 * Sets up the table with population and employment data.
 * @param {object} populationData - The parsed JSON data for population.
 * @param {object} employmentData - The parsed JSON data for employment.
 */
function setupTable(populationData, employmentData) {
    const tableBody = document.getElementById("fetched-data");
    if (!tableBody) {
        console.error("Table body element not found.");
        return;
    }

    // Clear existing table rows
    tableBody.innerHTML = '';

    // Extract municipality labels and their corresponding IDs from population data
    const municipalities = populationData.dimension.Alue.category.label;
    const populationValues = populationData.value;
    const employmentValues = employmentData.value;

    // Create a map for employment data for easier lookup by municipality ID
    const employmentMap = {};
    const employmentDimensionLabels = employmentData.dimension.Alue.category.label;
    const employmentDimensionKeys = employmentData.dimension.Alue.category.index;

    // Populate employmentMap with municipality IDs as keys and employment values as values
    // This assumes the order of values in employmentValues matches the order of keys in employmentDimensionKeys
    for (const muniId in employmentDimensionKeys) {
        // Get the index of the municipality ID in the employment data's dimension
        const index = employmentDimensionKeys[muniId];
        if (employmentValues[index] !== undefined) {
             employmentMap[muniId] = employmentValues[index];
        }
    }


    // Iterate through municipalities and populate the table
    let rowIndex = 0; // To handle alternating row colors correctly
    for (const municipalityId in municipalities) {
        const municipalityName = municipalities[municipalityId];
        const population = populationValues[populationData.dimension.Alue.category.index[municipalityId]];
        const employmentAmount = employmentMap[municipalityId] || 0; // Default to 0 if no employment data

        // Calculate employment percentage, handle division by zero
        let employmentPercentage = 0;
        if (population && population !== 0) {
            employmentPercentage = ((employmentAmount / population) * 100).toFixed(2);
        }

        const row = tableBody.insertRow();

        // Apply row colors
        if (rowIndex % 2 === 0) {
            row.style.backgroundColor = "#f2f2f2"; // Even rows
        } else {
            row.style.backgroundColor = "#ffffff"; // Odd rows
        }

        // Apply colors based on employment percentage
        if (employmentPercentage > 45) {
            row.style.backgroundColor = "#abffbd";
        } else if (employmentPercentage < 25) {
            row.style.backgroundColor = "#ff9e9e";
        }

        // Insert cells & populate data
        const cell1 = row.insertCell(0);
        cell1.textContent = municipalityName;

        const cell2 = row.insertCell(1);
        cell2.textContent = population !== null ? population : 'N/A';

        const cell3 = row.insertCell(2);
        cell3.textContent = employmentAmount !== null ? employmentAmount : 'N/A';

        const cell4 = row.insertCell(3);
        cell4.textContent = employmentPercentage !== null ? `${employmentPercentage}%` : 'N/A';
        
        rowIndex++;
    }
}

/**
 * Initializes the code by fetching data and setting up the table.
 */
async function initializeCode() {
    // Define the API URLs
    const populationUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px";
    const employmentUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px";

    // Fetch JSON bodies from local files
    const populationBody = await (await fetch("population_query.json")).json();
    const employmentBody = await (await fetch("employment_query.json")).json();

    // Fetch data from both APIs concurrently
    const [populationData, employmentData] = await Promise.all([
        fetchStatFinData(populationUrl, populationBody),
        fetchStatFinData(employmentUrl, employmentBody)
    ]);

    // Check if data was fetched successfully before setting up the table
    if (populationData && employmentData) {
        setupTable(populationData, employmentData);
    } else {
        console.error("Failed to fetch all required data.");
        const tableBody = document.getElementById("fetched-data");
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="4">Failed to load data. Please try again later.</td></tr>';
        }
    }
}
