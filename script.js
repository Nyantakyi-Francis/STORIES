// --- Last Modified Date ---
function setLastModifiedDate() {
    const lastModifiedElement = document.getElementById('last-modified');
    if (lastModifiedElement) {
        const lastModified = new Date(document.lastModified);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        lastModifiedElement.textContent = lastModified.toLocaleDateString('en-US', options);
    }
}

// --- Sidebar Toggle ---
function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.querySelector('body > main');

    if (sidebar && sidebarToggle && mainContent) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('is-expanded');
            mainContent.classList.toggle('content-shifted');
        });
    }
}

// --- Back to Top Button ---
function setupBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            backToTopButton.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// --- Generate Story Tiles ---
function generateStoryTiles() {
    const storyTilesContainer = document.getElementById('story-tiles-container');
    if (storyTilesContainer && typeof storiesData !== 'undefined') {
        storyTilesContainer.innerHTML = '';
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

// --- Generate Sidebar Links ---
function generateSidebarLinks() {
    const sidebarList = document.querySelector('#sidebar ul');
    if (sidebarList && typeof storiesData !== 'undefined') {
        sidebarList.innerHTML = '';
        storiesData.forEach(story => {
            let storyLink = `stories/story_template.html?id=${story.id}`;
            if (window.location.pathname.includes('/stories/')) {
                storyLink = `../${storyLink}`;
            }
            const linkHTML = `<li><a href="${storyLink}" class="block py-2 px-3 rounded-md hover:bg-gray-700 transition duration-200 ease-in-out text-gray-300">${story.title}</a></li>`;
            sidebarList.insertAdjacentHTML('beforeend', linkHTML);
        });
    }
}

// --- Search ---
function setupSearch() {
    const searchInput = document.getElementById('story-search');
    const storyTilesContainer = document.getElementById('story-tiles-container');

    if (searchInput && storyTilesContainer) {
        searchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const storyTiles = storyTilesContainer.querySelectorAll('.story-tile');

            storyTiles.forEach(tile => {
                const titleElement = tile.querySelector('h3');
                const teaserElement = tile.querySelector('p');
                const titleText = titleElement ? titleElement.textContent.toLowerCase() : '';
                const teaserText = teaserElement ? teaserElement.textContent.toLowerCase() : '';

                tile.style.display = (titleText.includes(searchTerm) || teaserText.includes(searchTerm)) ? '' : 'none';
            });
        });
    }
}

// --- Load Story Content ---
function loadStoryContent() {
    const storyContentDiv = document.getElementById('story-content');
    if (storyContentDiv && typeof fullStoriesContent !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const storyId = parseInt(urlParams.get('id'));

        if (storyId && fullStoriesContent[storyId]) {
            storyContentDiv.innerHTML = fullStoriesContent[storyId];
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

// --- Read Aloud with Pause/Resume and Highlight ---
function setupReadAloud() {
    const readAloudButton = document.getElementById('read-aloud-toggle');
    const storyContentDiv = document.getElementById('story-content');

    let isReading = false;
    let isPaused = false;
    let utterance;
    let originalHTML = '';

    if (readAloudButton && storyContentDiv) {
        readAloudButton.addEventListener('click', () => {
            if (!isReading) {
                // Start reading
                originalHTML = storyContentDiv.innerHTML;
                const text = storyContentDiv.textContent;

                utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1;
                utterance.pitch = 1;
                utterance.lang = 'en-US';

                // Highlight character as it reads
                utterance.onboundary = (event) => {
                    if (event.name === 'word') {
                        const charIndex = event.charIndex;
                        const currentText = text.substring(0, charIndex) + '<mark>' +
                            text.substring(charIndex, charIndex + 1) + '</mark>' +
                            text.substring(charIndex + 1);
                        storyContentDiv.innerHTML = currentText;
                    }
                };

                utterance.onend = () => {
                    readAloudButton.textContent = 'Read Aloud';
                    isReading = false;
                    isPaused = false;
                    storyContentDiv.innerHTML = originalHTML;
                };

                speechSynthesis.speak(utterance);
                readAloudButton.textContent = 'Pause';
                isReading = true;
                isPaused = false;

            } else if (isReading && !isPaused) {
                speechSynthesis.pause();
                readAloudButton.textContent = 'Resume';
                isPaused = true;

            } else if (isReading && isPaused) {
                speechSynthesis.resume();
                readAloudButton.textContent = 'Pause';
                isPaused = false;
            }
        });

        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            speechSynthesis.cancel();
        });
    }
}

// --- On Page Load ---
window.onload = function () {
    setLastModifiedDate();
    setupSidebarToggle();
    setupBackToTop();
    generateSidebarLinks();

    if (document.getElementById('story-tiles-container')) {
        generateStoryTiles();
        setupSearch();
    } else if (document.getElementById('story-content')) {
        loadStoryContent();
        setupReadAloud();
    }
};
