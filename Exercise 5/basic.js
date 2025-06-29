// Global variable to store migration data
let migrationData = {};

const fetchData = async () => {
    // 1. Fetch GeoJSON data for Finnish municipalities
    const geoJsonUrl = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
    const geoJsonRes = await fetch(geoJsonUrl);
    const geoJsonData = await geoJsonRes.json();

    // 4. Fetch migration data
    const migrationApiUrl = "https://pxdata.stat.fi:443/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px";
    const queryFile = await fetch("./migration_data_query.json");
    const queryBody = await queryFile.json();

    const migrationRes = await fetch(migrationApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(queryBody),
    });
    const migrationJson = await migrationRes.json();

    // Process migration data
    // The data array contains values for each municipality, alternating positive and negative migration
    // The dimension 'Alue' contains the municipality codes, matching those in GeoJSON properties
    const municipalityCodes = migrationJson.variables[0].values;
    const migrationValues = migrationJson.data;

    for (let i = 0; i < municipalityCodes.length; i++) {
        const code = municipalityCodes[i];
        // The values are positive and negative migration for each municipality, alternating.
        const positiveMigration = migrationValues[i * 2];
        const negativeMigration = migrationValues[i * 2 + 1];
        
        migrationData[code] = {
            positive: positiveMigration,
            negative: negativeMigration,
            net: positiveMigration - negativeMigration // Calculate net migration
        };
    }

    initMap(geoJsonData);
};

const initMap = (geoJsonData) => {
    // 1. Creating the map
    let map = L.map('map', {
        minZoom: -3 // Set minZoom attribute
    });

    // 3. Add OpenStreetMap background
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap" // Add attribution
    }).addTo(map);

    // Display GeoJSON data
    let geoJsonLayer = L.geoJSON(geoJsonData, {
        style: getStyle, // 5. Conditional map styling
        onEachFeature: onEachFeature, // 2. Basic functionality & 4. Advanced functionality
        weight: 2 // Set weight attribute
    }).addTo(map);

    // Fit the map to the GeoJSON data
    map.fitBounds(geoJsonLayer.getBounds());
};

// Function for basic and advanced functionality (tooltips and popups)
const onEachFeature = (feature, layer) => {
    // Get municipality name
    const municipalityName = feature.properties.name; 
    const municipalityCode = feature.properties.KuntaKoodi; // Assuming 'KuntaKoodi' is the property for municipality code

    // 2. Show municipality name as a tooltip on hover
    if (municipalityName) {
        layer.bindTooltip(municipalityName);
    }

    // 4. Show migration data on click as a popup
    if (municipalityName && migrationData[municipalityCode]) {
        const data = migrationData[municipalityCode];
        const popupContent = `
            <b>${municipalityName}</b><br>
            Positive Migration: ${data.positive}<br>
            Negative Migration: ${data.negative}<br>
            Net Migration: ${data.net}
        `;
        layer.bindPopup(popupContent);
    }
};

// Function for conditional map styling
const getStyle = (feature) => {
    const municipalityCode = feature.properties.KuntaKoodi; // Assuming 'KuntaKoodi' is the property for municipality code
    let hue = 0; // Default hue

    if (migrationData[municipalityCode] && migrationData[municipalityCode].negative !== 0) {
        const positive = migrationData[municipalityCode].positive;
        const negative = migrationData[municipalityCode].negative;
        
        // 5. Calculate hue
        let calculatedHue = (Math.pow((positive / negative), 3)) * 60;
        hue = Math.min(calculatedHue, 120); // Cap hue at 120
    } else if (migrationData[municipalityCode] && migrationData[municipalityCode].negative === 0 && migrationData[municipalityCode].positive > 0) {
        // If negative is 0 and positive is > 0, it's very positive, set a high hue
        hue = 120; // Green
    } else if (migrationData[municipalityCode] && migrationData[municipalityCode].negative > 0 && migrationData[municipalityCode].positive === 0) {
        // If positive is 0 and negative is > 0, it's very negative, set a low hue
        hue = 0; // Red
    } else {
        // Default for no data or zero migration
        hue = 60; // Yellow (neutral)
    }

    return {
        fillColor: `hsl(${hue}, 75%, 50%)`, // HSL color value
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
};

// Initiate the data fetching and map creation
fetchData();