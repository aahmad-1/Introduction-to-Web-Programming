if (document.readyState !== "loading") {
    console.log("Document is ready!");
    fetchJSON();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is ready after waiting!");
        fetchJSON();
    });
}

async function fetchJSON() {
    const url = await fetch("https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326");
    const data = await url.json();
    initializeMap(data);
}

async function fetchMigration() {

    const migrationDataQueryResponse = await fetch("migration_data_query.json");
    const migrationDataQuery = await migrationDataQueryResponse.json();

    const migrationDataResponse = await fetch("https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(migrationDataQuery)
    });
    
    const data = await migrationDataResponse.json();
    
    const areaIndexes = data.dimension.Alue.category.index;
    const dataValues = data.value;
    
    const migrationData = {};
    
    Object.keys(areaIndexes).forEach(areaCode => {
        const index = areaIndexes[areaCode];
        // Each area has 2 values: positive migration (index*2), and negative migration (index*2+1)
        const positiveMigration = dataValues[index * 2] || 0;
        const negativeMigration = dataValues[index * 2 + 1] || 0;
        
        migrationData[areaCode] = {
            positive: positiveMigration,
            negative: negativeMigration
        };
    });
    
    return migrationData;
}

function calculateColor(positiveMigration, negativeMigration) {
    if (negativeMigration === 0) return 'hsl(120, 75%, 50%)';
    let hue = Math.min(Math.pow((positiveMigration/negativeMigration), 3) * 60, 120);
    return `hsl(${hue}, 75%, 50%)`;
}

async function initializeMap(data) {
    let map = L.map('map', {
        minZoom: -3,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const migrationData = await fetchMigration();
    
    let geoJSON = L.geoJSON(data, {
        weight: 2,
        onEachFeature: function(feature, layer) {
            let kuntaCode = feature.properties.kunta;
            let migrationInfo = migrationData["KU" + kuntaCode] || { positive: 0, negative: 0 };
            let positiveMigration = migrationInfo.positive;
            let negativeMigration = migrationInfo.negative;

            layer.bindTooltip(feature.properties.nimi);
            
            layer.on('click', function() {
                layer.bindPopup(`<b>${feature.properties.nimi}</b><br>Positive Migration: ${positiveMigration}<br>Negative Migration: ${negativeMigration}`).openPopup();
            });
            
            let color = calculateColor(positiveMigration, negativeMigration);
            layer.setStyle({
                fillColor: color,
                color: color
            });
        }
    }).addTo(map);
    
    map.fitBounds(geoJSON.getBounds());
}