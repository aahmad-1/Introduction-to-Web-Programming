document.addEventListener('DOMContentLoaded', function() {
    const inputShow = document.getElementById('input-show');
    const submitData = document.getElementById('submit-data');
    const showContainer = document.querySelector('.show-container');

    // Create show container if it doesn't exist
    if (!showContainer) {
        const container = document.createElement('div');
        container.className = 'show-container';
        document.body.appendChild(container);
    }

    // Add event listener to the form
    const form = document.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        searchShows();
    });

    // Add event listener to the button
    submitData.addEventListener('click', function(e) {
        e.preventDefault();
        searchShows();
    });

    async function searchShows() {
        const query = inputShow.value.trim();
        
        if (!query) {
            return;
        }

        try {
            const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            displayShows(data);
        } catch (error) {
            console.error('Error fetching shows:', error);
        }
    }

    function displayShows(shows) {
        const container = document.querySelector('.show-container');
        
        // Clear previous results
        container.innerHTML = '';

        shows.forEach(item => {
            const show = item.show;
            
            // Create show-data element
            const showDataDiv = document.createElement('div');
            showDataDiv.className = 'show-data';

            // Create image element
            const img = document.createElement('img');
            img.src = show.image ? show.image.medium : 'no image availabe.jpg';
            img.alt = show.name;

            // Create show-info div
            const showInfoDiv = document.createElement('div');
            showInfoDiv.className = 'show-info';

            // Create title
            const title = document.createElement('h1');
            title.textContent = show.name;

            // Create summary (API already provides it wrapped in <p> tags)
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
});