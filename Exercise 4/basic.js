if(document.readyState !== "loading") {
    console.log("Document is ready!");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Document is currently loading!");
        initializeCode();
    });
}

function initializeCode() {
    const inputShow = document.getElementById("input-show");
    const submitData = document.getElementById("submit-data");
    const showContainer = document.querySelector(".show-container");

    // Handle button click
    submitData.addEventListener("click", async function(event) {
        event.preventDefault();
        await searchShows();
    });
    
    async function searchShows() {
        const query = inputShow.value.trim();
        if (query) {
            const url = `https://api.tvmaze.com/search/shows?q=${(query)}`;
            try {
                const response = await fetch(url);
                const fetched_data = await response.json();
                displayShows(fetched_data);
            } catch (error) {
                console.error("ERROR: ", error);
                showContainer.innerHTML = "<p>Error loading shows. Please try again.</p>";
            }
        }
    }
    
    function displayShows(shows) {
        const container = document.querySelector('.show-container');
        
        // Clear previous results
        container.innerHTML = '';

        if (shows.length === 0) {
            container.innerHTML = '<p>No shows found. Try a different search term.</p>';
            return;
        }

        shows.forEach(item => {
            const show = item.show;
            
            // Create show-data element
            const showDataDiv = document.createElement('div');
            showDataDiv.className = 'show-data';

            // Create image element
            const img = document.createElement('img');
            img.src = show.image ? show.image.medium : 'https://dummyimage.com/210x295/000/fff.png&text=No+poster+available'; //placeholder image
            img.alt = show.name;

            // Create show-info div
            const showInfoDiv = document.createElement('div');
            showInfoDiv.className = 'show-info';

            // Create title
            const title = document.createElement('h1');
            title.textContent = show.name;

            // Create summary
            const summaryDiv = document.createElement('div');
            summaryDiv.innerHTML = show.summary || '<p>No summary available.</p>';

            // Append elements
            showInfoDiv.appendChild(title);
            showInfoDiv.appendChild(summaryDiv);
            
            showDataDiv.appendChild(img);
            showDataDiv.appendChild(showInfoDiv);
            
            container.appendChild(showDataDiv);
        });
    }
}