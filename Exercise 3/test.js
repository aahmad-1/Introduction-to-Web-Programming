if (document.readyState !== "loading") {
    console.log("Document is ready!");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is ready after waiting!");
        initializeCode();
    });
}

// Define the API URLs
const populationUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px";
const employmentUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px";

/**
 * Fetches data from a given URL using a POST request with a JSON body.
 * @param {string} url - The API endpoint URL.
 * @param {object} body - The JSON object to send as the request body.
 * @returns {Promise<object>} - A promise that resolves to the parsed JSON response.
 */
const fetchStatFinData = async(url, body) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return await response.json();
};

/**
 * Initializes the code by fetching data and setting up the table.
 */
async function initializeCode() {

    // Fetch JSON bodies from local files
    const populationBody = await (await fetch("population_query.json")).json();
    const employmentBody = await (await fetch("employment_query.json")).json();

    // Fetch data from both APIs concurrently
    const [populationData, employmentData] = await Promise.all([
        fetchStatFinData(populationUrl, populationBody),
        fetchStatFinData(employmentUrl, employmentBody)
    ]);

    setupTable(populationData, employmentData);
};

/**
 * Sets up the table with population and employment data.
 * @param {object} populationData - The parsed JSON data for population.
 * @param {object} employmentData - The parsed JSON data for employment.
 */
const setupTable = (populationData, employmentData) => {
    const tableBody = document.getElementById("fetched-data");
    if (!tableBody) {
        console.error("Table body element not found.");
        return;
    }

    // Extract municipality labels and their corresponding IDs from population data
    const municipalities = populationData.dimension.Alue.category.label;
    const populationValues = populationData.value;
    const employmentValues = employmentData.value;

    const populationIndices = populationData.dimension.Alue.category.index;
    const employmentIndices = employmentData.dimension.Alue.category.index;

    // Iterate through municipalities and populate the table
    let rowIndex = 0; 
    for (const municipalityId in municipalities) {
        const municipalityName = municipalities[municipalityId];

        const populationIndex = populationIndices[municipalityId];
        const employmentIndex = employmentIndices[municipalityId];

        const population = populationValues[populationIndex];
        let employmentAmount = 0;
        if (employmentIndex !== undefined) {
            employmentAmount = employmentValues[employmentIndex];
        }

        // Calculate employment percentage, handle division by zero
        let employmentPercentage = 0;
        if (population && population !== 0) {
            employmentPercentage = ((employmentAmount / population) * 100).toFixed(2);
        }

        const row = tableBody.insertRow();

        // Apply row colors
        if (rowIndex % 2 === 0) {
            row.style.backgroundColor = "#f2f2f2"; 
        } else {
            row.style.backgroundColor = "#ffffff";
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
        if (population !== null) {
            cell2.textContent = population;
        } else {
            cell2.textContent = 'N/A';
        }

        const cell3 = row.insertCell(2);
        if (employmentAmount !== null) {
            cell3.textContent = employmentAmount;
        } else {
            cell3.textContent = 'N/A';
        }

        const cell4 = row.insertCell(3);
        if (employmentPercentage !== null) {
            cell4.textContent = `${employmentPercentage}%`;
        } else {
            cell4.textContent = 'N/A';
        }

        rowIndex++;
    }
};
