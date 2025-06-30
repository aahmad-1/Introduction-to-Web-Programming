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
let currentData = [];
let municipalityCodes = {};
let currentMunicipality = "whole country";

function initializeCode() {
    // Fetch initial data for whole country
    fetchPopulationData("SSS");
    
    // Get municipality codes
    fetchMunicipalityCodes();
    
    // Set up form submission
    const form = document.querySelector('form');
    const submitButton = document.getElementById('submit-data');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleMunicipalitySearch();
    });
    
    // Set up prediction button
    const addDataButton = document.getElementById('add-data');
    addDataButton.addEventListener('click', addPrediction);
}

async function fetchMunicipalityCodes() {
    try {
        const response = await fetch('https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px');
        const data = await response.json();
        
        const areas = data.variables[1]; // Alue is the second object
        const codes = areas.values;
        const names = areas.valueTexts;
        
        for (let i = 0; i < codes.length; i++) {
            municipalityCodes[names[i].toLowerCase()] = codes[i];
        }
    } catch (error) {
        console.error('Error fetching municipality codes:', error);
    }
}

async function fetchPopulationData(areaCode) {
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
                    "values": ["vaesto"]
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
        const values = data.value;
        
        // Store the exact values from the API without any modification
        currentData = [...values];
        createChart(currentData);
    } catch (error) {
        console.error('Error fetching population data:', error);
    }
}

function createChart(data) {
    const years = [];
    for (let year = 2000; year <= 2021; year++) {
        years.push(year.toString());
    }

    if (chart) {
        chart.destroy();
    }

    // Clear the chart container
    const chartContainer = document.getElementById('chart');
    chartContainer.innerHTML = '';

    chart = new frappe.Chart("#chart", {
        title: `Population growth in ${currentMunicipality}`,
        data: {
            labels: years,
            datasets: [{
                name: "Population",
                values: data
            }]
        },
        type: 'line',
        height: 450,
        colors: ['#eb5146']
    });
}

function handleMunicipalitySearch() {
    const input = document.getElementById('input-area');
    const searchTerm = input.value.trim().toLowerCase();
    
    if (!searchTerm) {
        // Default to whole country
        currentMunicipality = "whole country";
        fetchPopulationData("SSS");
        return;
    }
    
    // Search for municipality code
    const municipalityCode = municipalityCodes[searchTerm];
    
    if (municipalityCode) {
        currentMunicipality = searchTerm;
        fetchPopulationData(municipalityCode);
    } else {
        alert('Municipality not found. Please check the spelling.');
    }
}

function addPrediction() {
    if (currentData.length < 2) return;
    
    // Calculate deltas
    const deltas = [];
    for (let i = 1; i < currentData.length; i++) {
        deltas.push(currentData[i] - currentData[i - 1]);
    }
    
    // Calculate mean of deltas
    const meanDelta = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
    
    // Add prediction to current data
    const lastValue = currentData[currentData.length - 1];
    const prediction = Math.round(lastValue + meanDelta);
    
    const newData = [...currentData, prediction];
    const years = [];
    for (let year = 2000; year <= 2022; year++) {
        years.push(year.toString());
    }
    
    if (chart) {
        chart.destroy();
    }
    
    // Clear the chart container
    const chartContainer = document.getElementById('chart');
    chartContainer.innerHTML = '';
    
    chart = new frappe.Chart("#chart", {
        title: `Population growth in ${currentMunicipality}`,
        data: {
            labels: years,
            datasets: [{
                name: "Population",
                values: newData
            }]
        },
        type: 'line',
        height: 450,
        colors: ['#eb5146']
    });
}