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

            // municipalities and values API data
            const url1 = await fetch("https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px");
            const api_data1 = await url1.json();
            const municipalities = Object.values(api_data1.dataset.dimension.Alue.category.label);
            const valuesData = api_data1.dataset.value;

            // employment and employment-% API data
            const url2 = await fetch("https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px");
            const api_data2 = await url2.json();
            const employmentData = api_data2.dataset.value;

            // display the fetched API data into the HTML table
            municipalities.forEach((municipality, index) => {
                const values = valuesData[index];
                const employment = employmentData[index];
                const employmentPercentage = ((employment / values) * 100).toFixed(2);

                let row = document.createElement("tr");
                row.innerHTML = 
                    `<td>${municipality}</td>
                    <td>${values}</td>
                    <td>${employment}</td>
                    <td>${employmentPercentage}</td>`;

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
    } fetch_data();
}