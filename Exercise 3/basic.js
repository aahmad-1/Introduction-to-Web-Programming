if (document.readyState !== "loading") {
    console.log("Document is ready!");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is ready after waiting!");
        initializeCode();
    });
}

const populationUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px";
const employmentUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px";

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

async function initializeCode() {

    const populationBody = await (await fetch("population_query.json")).json();
    const employmentBody = await (await fetch("employment_query.json")).json();

    const [populationData, employmentData] = await Promise.all([
        fetchStatFinData(populationUrl, populationBody),
        fetchStatFinData(employmentUrl, employmentBody)
    ]);

    setupTable(populationData, employmentData);
};


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

    // Iterate through municipalities and fill in the table
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

        // Calculate employment percentage
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

        // Insert the cells and fill in data
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
