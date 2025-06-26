document.addEventListener('DOMContentLoaded', function() {
    const inputShow = document.getElementById('input-show');
    const submitData = document.getElementById('submit-data');
    let showContainer = document.querySelector('.show-container');

    // Create show container if it doesn't exist
    if (!showContainer) {
        const container = document.createElement('div');
        container.className = 'show-container';
        document.body.appendChild(container);
        showContainer = container;
    }

    // Add event listener to the form
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            searchShows();
            
    // Make searchShows globally accessible for testing
    window.searchShows = searchShows;
});
    }

    // Add event listener to the button
    if (submitData) {
        submitData.addEventListener('click', function(e) {
            e.preventDefault();
            searchShows();
        });
    }

    // Also add event listener for Enter key on input
    if (inputShow) {
        inputShow.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchShows();
            }
        });
    }

    async function searchShows() {
        const query = inputShow ? inputShow.value.trim() : '';
        
        if (!query) {
            return;
        }

        try {
            console.log('Searching for:', query); // Debug log
            const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API response:', data); // Debug log
            
            displayShows(data);
        } catch (error) {
            console.error('Error fetching shows:', error);
            // Display error message to user
            const container = document.querySelector('.show-container');
            if (container) {
                container.innerHTML = '<p>Error loading shows. Please try again.</p>';
            }
        }
    }

    function displayShows(shows) {
        const container = document.querySelector('.show-container');
        
        if (!container) {
            console.error('Show container not found');
            return;
        }
        
        // Clear previous results
        container.innerHTML = '';

        if (!shows || shows.length === 0) {
            container.innerHTML = '<p>No shows found. Try a different search term.</p>';
            return;
        }

        shows.forEach(item => {
            if (!item || !item.show) {
                return; // Skip invalid items
            }
            
            const show = item.show;
            
            // Create show-data element
            const showDataDiv = document.createElement('div');
            showDataDiv.className = 'show-data';

            // Create image element
            const img = document.createElement('img');
            img.src = show.image && show.image.medium ? show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image';
            img.alt = show.name || 'Show image';

            // Create show-info div
            const showInfoDiv = document.createElement('div');
            showInfoDiv.className = 'show-info';

            // Create title
            const title = document.createElement('h1');
            title.textContent = show.name || 'Unknown Show';

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