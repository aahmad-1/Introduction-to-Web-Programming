if (document.readyState !== "loading") {
    console.log("Document is ready");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is currently loading");
        initializeCode();
    });
}

async function initializeCode() {
    // Initialize the map
    const map = L.map("map", {
        minZoom: -3
    });

    // Add OpenStreetMap base layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    try {
        // Fetch GeoJSON data
        const geoResponse = await fetch("https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326");
        const geoJson = await geoResponse.json();

        // Fetch migration data using the query file
        const migrationResponse = await fetch("https://pxdata.stat.fi:443/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: await (await fetch("migration_data_query.json")).text()
        });
        const migrationData = await migrationResponse.json();

        // Process migration data to create a lookup object by municipality name
        const migrationValues = migrationData.value;
        const migrationLookup = {};
        const municipalities = migrationData.dimension.Alue.category.label;
        const municipalityCodes = Object.keys(municipalities);

        for (let i = 0; i < municipalityCodes.length; i++) {
            const code = municipalityCodes[i];
            const name = municipalities[code];
            migrationLookup[name.toUpperCase()] = {
                pos: migrationValues[i * 2],     // Positive migration (every other value)
                neg: migrationValues[i * 2 + 1]   // Negative migration (every other value)
            };
        }

        // Create GeoJSON layer with styling and interactivity
        const geoJsonLayer = L.geoJSON(geoJson, {
            weight: 2,
            onEachFeature: (feature, layer) => {
                const municipalityName = feature.properties.name;
                const stats = migrationLookup[municipalityName.toUpperCase()] || { pos: 0, neg: 0 };
                
                // Add tooltip with municipality name
                layer.bindTooltip(municipalityName);
                
                // Add popup with migration data
                layer.on("click", () => {
                    layer.bindPopup(`
                        <b>${municipalityName}</b><br>
                        Positive migration: ${stats.pos}<br>
                        Negative migration: ${stats.neg}<br>
                        Net migration: ${stats.pos - stats.neg}
                    `).openPopup();
                });
            },
            style: (feature) => {
                const municipalityName = feature.properties.name;
                const stats = migrationLookup[municipalityName.toUpperCase()];
                
                // Calculate color based on migration data
                let hue = 0;
                if (stats && stats.neg > 0) {
                    hue = Math.min(Math.pow(stats.pos / stats.neg, 3) * 60, 120);
                }
                
                return {
                    fillColor: stats ? `hsl(${hue}, 75%, 50%)` : "gray",
                    weight: 2,
                    opacity: 1,
                    color: "white",
                    dashArray: "3",
                    fillOpacity: 0.7
                };
            }
        }).addTo(map);

        // Fit map to GeoJSON bounds
        map.fitBounds(geoJsonLayer.getBounds());

    } catch (error) {
        console.error("Error loading data:", error);
    }
}