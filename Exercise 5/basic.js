if(document.readyState !== "loading") {
    console.log("Document is ready");
    initializeCode();

} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is currently loading");
        initializeCode();
    });
}

async function initializeCode() {
    const map = L.map("map", {
        minZoom: -3
    });

    // Add OpenStreetMap background with attribution
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    // Fetch municipality GeoJSON data
    const geoDataUrl = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
    const geoResponse = await fetch(geoDataUrl);
    const geoJson = await geoResponse.json();

    // Fetch migration data
    const migrationResponse = await fetch("https://pxdata.stat.fi:443/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: await (await fetch("migration_data_query.json")).text()
    });

    const migrationData = await migrationResponse.json();
    const areas = migrationData.dimension.Alue.category.label;
    const values = migrationData.value;

    // Process migration data
    const migrationStats = {};
    const areaCodes = Object.keys(areas);
    for (let i = 0; i < areaCodes.length; i++) {
        const code = areaCodes[i];
        const name = areas[code];
        const pos = values[i * 2];
        const neg = values[i * 2 + 1];
        migrationStats[name.toUpperCase()] = { pos, neg };
    }

    // Create GeoJSON layer
    const geoLayer = L.geoJSON(geoJson, {
        style: feature => {
            const name = feature.properties.name.toUpperCase();
            const stats = migrationStats[name];
            let color = "gray";
            if (stats && stats.neg > 0) {
                const hue = Math.min(Math.pow(stats.pos / stats.neg, 3) * 60, 120);
                color = `hsl(${hue}, 75%, 50%)`;
            }
            return {
                color: color,
                weight: 2
            };
        },
        onEachFeature: (feature, layer) => {
            const name = feature.properties.name;
            layer.bindTooltip(name);
            layer.on("click", () => {
                const stats = migrationStats[name.toUpperCase()];
                if (stats) {
                    layer.bindPopup(`${name}<br>Positive migration: ${stats.pos}<br>Negative migration: ${stats.neg}`).openPopup();
                } else {
                    layer.bindPopup(`${name}<br>No migration data available`).openPopup();
                }
            });
        }
    }).addTo(map);

    map.fitBounds(geoLayer.getBounds());
}