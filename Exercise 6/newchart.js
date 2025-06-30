if(document.readyState !== "loading") {
    console.log("Document is ready!");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is ready after waiting!");
        initializeCode();
    });
}

let chart;
let currentMunicipality = "whole country";

function initializeCode() {
    // Get the municipality from the previous page (default to whole country)
    // In a real application, you might pass this via URL parameters or localStorage
    fetchBirthDeathData("SSS");
}

async function fetchBirthDeathData(areaCode) {
    const requestBody = {
        "query": [
            {
                "code": "Vuosi",
                "selection": {
                    "filter": "item",
                    "values": [
                        "2000", "2001", "2002", "2003", "2004", "2005",
                        "2006", "2007", "2008", "2009", "2010", "2011",
                        "2012", "2013", "2014", "2015", "2016", "2017",
                        "2018", "2019", "2020", "2021"
                    ]
                }
            },
            {
                "code": "Alue",
                "selection": {
                    "filter": "item",
                    "values": [areaCode]
                }
            },
            {
                "code": "Tiedot",
                "selection": {
                    "filter": "item",
                    "values": ["vm01", "vm11"]
                }
            }
        ],
        "response": {
            "format": "json-stat2"
        }
    };

    try {
        const response = await fetch('https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        // Log the response to understand the structure
        console.log('API Response:', data);
        
        // Get the dimension information
        const dimensions = data.dimension;
        const values = data.value;
        
        console.log('Dimensions:', dimensions);
        console.log('Raw values:', values);
        
        // Get the size of each dimension
        const vuosiSize = dimensions.Vuosi.category.index ? Object.keys(dimensions.Vuosi.category.index).length : 22;
        const alueSize = dimensions.Alue.category.index ? Object.keys(dimensions.Alue.category.index).length : 1;
        const tiedotSize = dimensions.Tiedot.category.index ? Object.keys(dimensions.Tiedot.category.index).length : 2;
        
        console.log('Dimension sizes:', { vuosiSize, alueSize, tiedotSize });
        
        const birthData = [];
        const deathData = [];
        
        // In json-stat2 format, data is organized by the rightmost dimension first
        // Structure: Vuosi x Alue x Tiedot
        // So for each year, we have [birth_value, death_value]
        for (let yearIndex = 0; yearIndex < vuosiSize; yearIndex++) {
            const baseIndex = yearIndex * tiedotSize;
            birthData.push(values[baseIndex]);     // vm01 (births)
            deathData.push(values[baseIndex + 1]); // vm11 (deaths)
        }
        
        console.log('Processed birth data:', birthData);
        console.log('Processed death data:', deathData);
        
        createChart(birthData, deathData);
    } catch (error) {
        console.error('Error fetching birth/death data:', error);
    }
}

function createChart(birthData, deathData) {
    const years = [];
    for (let year = 2000; year <= 2021; year++) {
        years.push(year.toString());
    }

    // Clear the chart container
    const chartContainer = document.getElementById('chart');
    chartContainer.innerHTML = '';

    // Check if frappe is available
    if (typeof frappe === 'undefined') {
        console.error('Frappe Charts library is not loaded');
        chartContainer.innerHTML = '<p>Error: Chart library not loaded</p>';
        return;
    }

    try {
        chart = new frappe.Chart("#chart", {
            title: `Births and deaths in ${currentMunicipality}`,
            data: {
                labels: years,
                datasets: [
                    {
                        name: "Births",
                        values: birthData
                    },
                    {
                        name: "Deaths", 
                        values: deathData
                    }
                ]
            },
            type: 'bar',
            height: 450,
            colors: ['#63d0ff', '#363636']
        });
    } catch (error) {
        console.error('Error creating chart:', error);
        chartContainer.innerHTML = '<p>Error creating chart</p>';
    }
}