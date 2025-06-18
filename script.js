// script.js

// Make sure storiesData.js is loaded before this script, or define storiesData here.
// For this setup, we assume storiesData is available globally from storiesData.js.

// Function to get the last modified date of the document
function setLastModifiedDate() {
    const lastModifiedElement = document.getElementById('last-modified');
    if (lastModifiedElement) {
        const lastModified = new Date(document.lastModified);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        lastModifiedElement.textContent = lastModified.toLocaleDateString('en-US', options);
    }
}

// --- Sidebar Toggle Functionality ---
function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    // Main content will be the direct sibling of body for margin shifting
    const mainContent = document.querySelector('body > main');

    if (sidebar && sidebarToggle && mainContent) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('is-expanded');
            mainContent.classList.toggle('content-shifted');
        });
    }
}

// --- Back to Top Button Functionality ---
function setupBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// --- Dynamic Story Tile Generation (Homepage specific) ---
function generateStoryTiles() {
    const storyTilesContainer = document.getElementById('story-tiles-container');
    if (storyTilesContainer && typeof storiesData !== 'undefined') {
        storyTilesContainer.innerHTML = ''; // Clear existing placeholders

        storiesData.forEach(story => {
            const storyLink = `stories/story_template.html?id=${story.id}`;
            const tileHTML = `
                <a href="${storyLink}" class="story-tile block">
                    <img src="${story.image}" alt="Image for ${story.title}" class="w-full h-40 object-cover rounded-t-xl">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">${story.title}</h3>
                        <p class="text-sm text-gray-600">${story.teaser}</p>
                    </div>
                </a>
            `;
            storyTilesContainer.insertAdjacentHTML('beforeend', tileHTML);
        });
    }
}

// --- Dynamic Sidebar Link Generation (All pages) ---
function generateSidebarLinks() {
    const sidebarList = document.querySelector('#sidebar ul');
    if (sidebarList && typeof storiesData !== 'undefined') {
        sidebarList.innerHTML = ''; // Clear existing
        storiesData.forEach(story => {
            // Determine correct path relative to current page
            let storyLink = `stories/story_template.html?id=${story.id}`;
            // If current page is in 'stories' folder, need to go up one level
            if (window.location.pathname.includes('/stories/')) {
                storyLink = `../${storyLink}`;
            }

            const linkHTML = `<li><a href="${storyLink}" class="block py-2 px-3 rounded-md hover:bg-gray-700 transition duration-200 ease-in-out text-gray-300">${story.title}</a></li>`;
            sidebarList.insertAdjacentHTML('beforeend', linkHTML);
        });
    }
}

// --- Search Functionality (Homepage specific) ---
function setupSearch() {
    const searchInput = document.getElementById('story-search');
    const storyTilesContainer = document.getElementById('story-tiles-container');

    if (searchInput && storyTilesContainer) {
        searchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const storyTiles = storyTilesContainer.querySelectorAll('.story-tile'); // Re-select as they are dynamically generated

            storyTiles.forEach(tile => {
                const titleElement = tile.querySelector('h3');
                const teaserElement = tile.querySelector('p');
                const titleText = titleElement ? titleElement.textContent.toLowerCase() : '';
                const teaserText = teaserElement ? teaserElement.textContent.toLowerCase() : '';

                if (titleText.includes(searchTerm) || teaserText.includes(searchTerm)) {
                    tile.style.display = ''; // Show the tile
                } else {
                    tile.style.display = 'none'; // Hide the tile
                }
            });
        });
    }
}

// --- Story Content Loader (For story_template.html) ---
function loadStoryContent() {
    const storyContentDiv = document.getElementById('story-content');
    if (storyContentDiv && typeof fullStoriesContent !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const storyId = parseInt(urlParams.get('id'));

        if (storyId && fullStoriesContent[storyId]) {
            storyContentDiv.innerHTML = fullStoriesContent[storyId];
            // Update page title
            const story = storiesData.find(s => s.id === storyId);
            if (story) {
                document.title = `${story.title} - Nyantakyi Francis's Story Collection`;
            }
        } else {
            storyContentDiv.innerHTML = `<h2 class="text-3xl md:text-4xl font-bold text-red-600 mb-8 text-center">Story Not Found</h2><p class="text-center text-lg">Please return to the <a href="../index.html" class="text-blue-600 hover:underline">homepage</a> to select a valid story.</p>`;
            document.title = "Story Not Found";
        }
    }
}


// Call all setup functions when the page loads
window.onload = function() {
    setLastModifiedDate();
    setupSidebarToggle();
    setupBackToTop();
    generateSidebarLinks(); // Generate sidebar on all pages

    // Conditional function calls based on the current page
    if (document.getElementById('story-tiles-container')) { // It's the homepage
        generateStoryTiles();
        setupSearch();
    } else if (document.getElementById('story-content')) { // It's a story template page
        loadStoryContent();
    }
};