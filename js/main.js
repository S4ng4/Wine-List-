document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    // Check for page-specific elements instead of body class
    const regionsPage = document.querySelector('.regions-page');
    const winesPage = document.querySelector('.wines-page');
    const wineDetailsPage = document.querySelector('.wine-details-page');
    const indexPage = document.querySelector('.index-page');

    console.log('Page detection:', {
        regionsPage: !!regionsPage,
        winesPage: !!winesPage,
        wineDetailsPage: !!wineDetailsPage,
        indexPage: !!indexPage
    });

    if (regionsPage) {
        console.log('Loading regions page...');
        loadRegionsPage();
    } else if (winesPage) {
        console.log('Loading wines page...');
        loadWinesPage();
    } else if (wineDetailsPage) {
        console.log('Loading wine details page...');
        // Wine details page is handled by wine-details.js
    } else if (indexPage) {
        console.log('Loading index page...');
        initializeIndexPage();
    } else {
        console.log('Loading default page...');
        // Fallback for any other pages
    }
});

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Could not fetch data:", e);
        return null;
    }
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function loadRegionsPage() {
    console.log('loadRegionsPage called');
    
    const wineType = getQueryParam('type');
    console.log('Wine type from URL:', wineType);
    
    if (!wineType) {
        console.error('No wine type found in URL parameters');
        return;
    }

    // Map wine types to display names
    const wineTypeNames = {
        'ROSSO': 'RED',
        'BIANCO': 'WHITE', 
        'ROSATO': 'ROSÉ',
        'BOLLICINE': 'SPARKLING',
        'CHIANTI': 'CHIANTI',
        'MONTALCINO': 'MONTALCINO',
        'SUPERTUSCAN/BOLGHERI': 'SUPERTUSCAN',
        'AMARONE': 'AMARONE',
        'BAROLO DOCG': 'BAROLO'
    };

    const displayName = wineTypeNames[wineType] || wineType;
    console.log('Display name:', displayName);
    
    const titleElement = document.getElementById('wine-type-title');
    if (titleElement) {
        titleElement.textContent = `${displayName} WINES`;
        console.log('Updated title to:', titleElement.textContent);
    } else {
        console.error('Could not find wine-type-title element');
    }

    console.log('Fetching wine data...');
    const data = await fetchData('data/wines.json');
    if (!data) {
        console.error('Failed to fetch wine data');
        return;
    }
    
    console.log('Wine data loaded:', data.wines.length, 'wines');

    const regionsContainer = document.getElementById('region-buttons');
    if (!regionsContainer) {
        console.error('Could not find region-buttons container');
        return;
    }

    // Use "wine_type" to match your JSON
    const wineRegions = [...new Set(data.wines.filter(wine => wine.wine_type === wineType).map(wine => wine.region))];
    console.log('Found regions for', wineType, ':', wineRegions);

    // Clear existing buttons
    regionsContainer.innerHTML = '';

    wineRegions.forEach(region => {
        const button = document.createElement('a');
        button.href = `wines.html?type=${wineType}&region=${region}`;
        button.className = 'region-button glass-card';
        button.textContent = region.toUpperCase();
        regionsContainer.appendChild(button);
        console.log('Created button for region:', region);
    });
    
    console.log('Created', wineRegions.length, 'region buttons');
}

let allWines = [];
let currentFilters = {
    type: '',
    region: '',
    producer: '',
    vintage: '',
    priceMin: '',
    priceMax: '',
    organic: false
};

async function loadWinesPage() {
    const wineType = getQueryParam('type');
    const region = getQueryParam('region');
    if (!wineType || !region) return;

    // Map wine types to display names
    const wineTypeNames = {
        'ROSSO': 'RED',
        'BIANCO': 'WHITE', 
        'ROSATO': 'ROSÉ',
        'BOLLICINE': 'SPARKLING',
        'CHIANTI': 'CHIANTI',
        'MONTALCINO': 'MONTALCINO',
        'SUPERTUSCAN/BOLGHERI': 'SUPERTUSCAN',
        'AMARONE': 'AMARONE',
        'BAROLO DOCG': 'BAROLO'
    };

    const displayName = wineTypeNames[wineType] || wineType;
    document.getElementById('wine-header').textContent = `${displayName} WINES - ${region.toUpperCase()}`;

    const data = await fetchData('data/wines.json');
    if (!data) return;

    allWines = data.wines.filter(wine => wine.wine_type === wineType && wine.region === region);
    currentFilters.type = wineType;
    currentFilters.region = region;

    setupFilters(allWines);
    renderWines(allWines);
}

function setupFilters(wines) {
    const filtersSidebar = document.querySelector('.filters-sidebar');
    if (!filtersSidebar) return;

    // Get unique values for filters
    const producers = [...new Set(wines.map(w => w.wine_producer))].sort();
    const vintages = [...new Set(wines.map(w => w.wine_vintage))].sort();
    const prices = wines.map(w => parseInt(w.wine_price_bottle)).filter(p => !isNaN(p));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    filtersSidebar.innerHTML = `
        <h3>Filters</h3>
        
        <div class="filter-group">
            <label for="producer-filter">Producer</label>
            <select id="producer-filter">
                <option value="">All Producers</option>
                ${producers.map(producer => `<option value="${producer}">${producer}</option>`).join('')}
            </select>
        </div>

        <div class="filter-group">
            <label for="vintage-filter">Vintage</label>
            <select id="vintage-filter">
                <option value="">All Vintages</option>
                ${vintages.map(vintage => `<option value="${vintage}">${vintage}</option>`).join('')}
            </select>
        </div>

        <div class="filter-group">
            <label for="price-min">Min Price ($)</label>
            <input type="number" id="price-min" min="${minPrice}" max="${maxPrice}" placeholder="${minPrice}">
        </div>

        <div class="filter-group">
            <label for="price-max">Max Price ($)</label>
            <input type="number" id="price-max" min="${minPrice}" max="${maxPrice}" placeholder="${maxPrice}">
        </div>

        <div class="filter-group">
            <label>
                <input type="checkbox" id="organic-filter">
                Organic Only
            </label>
        </div>

        <div class="filter-group">
            <button id="clear-filters" class="glass-card" style="width: 100%; padding: 12px; background: var(--glass-primary); border: 1px solid var(--glass-border); color: var(--text-color-light); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-normal);">
                Clear Filters
            </button>
        </div>
    `;

    // Add event listeners
    document.getElementById('producer-filter').addEventListener('change', applyFilters);
    document.getElementById('vintage-filter').addEventListener('change', applyFilters);
    document.getElementById('price-min').addEventListener('input', applyFilters);
    document.getElementById('price-max').addEventListener('input', applyFilters);
    document.getElementById('organic-filter').addEventListener('change', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
}

function applyFilters() {
    const producer = document.getElementById('producer-filter').value;
    const vintage = document.getElementById('vintage-filter').value;
    const priceMin = parseInt(document.getElementById('price-min').value) || 0;
    const priceMax = parseInt(document.getElementById('price-max').value) || Infinity;
    const organic = document.getElementById('organic-filter').checked;

    const filteredWines = allWines.filter(wine => {
        const matchesProducer = !producer || wine.wine_producer === producer;
        const matchesVintage = !vintage || wine.wine_vintage === vintage;
        const winePrice = parseInt(wine.wine_price_bottle) || 0;
        const matchesPrice = winePrice >= priceMin && winePrice <= priceMax;
        const matchesOrganic = !organic || wine.organic;

        return matchesProducer && matchesVintage && matchesPrice && matchesOrganic;
    });

    renderWines(filteredWines);
}

function clearFilters() {
    document.getElementById('producer-filter').value = '';
    document.getElementById('vintage-filter').value = '';
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    document.getElementById('organic-filter').checked = false;
    
    renderWines(allWines);
}

function renderWines(wines) {
    const winesGrid = document.querySelector('.wine-cards-grid');
    const tableBody = document.querySelector('#wine-table tbody');
    
    // Render card view
    winesGrid.innerHTML = '';
    if (wines.length === 0) {
        winesGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-color-muted); font-style: italic;">No wines found matching your criteria.</p>';
    } else {
        wines.forEach(wine => {
            const card = document.createElement('a');
            card.className = 'wine-card glass-card';
            card.href = `wine-details.html?id=${wine.wine_number}`;
            card.innerHTML = `
                <h4>${wine.wine_name}</h4>
                <div class="producer">${wine.wine_producer}</div>
                <div class="vintage">${wine.wine_vintage}</div>
                <div class="description">${wine.wine_description || 'A fine selection from our curated collection.'}</div>
                <div class="price">${wine.wine_price_bottle ? '$' + wine.wine_price_bottle : 'Price upon request'}</div>
                ${wine.organic ? '<span class="organic-badge">ORGANIC</span>' : ''}
            `;
            winesGrid.appendChild(card);
        });
    }
    
    // Render table view
    if (tableBody) {
        tableBody.innerHTML = '';
        if (wines.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" style="text-align: center; color: var(--text-color-muted); font-style: italic;">No wines found matching your criteria.</td>';
            tableBody.appendChild(row);
        } else {
            wines.forEach(wine => {
                const row = document.createElement('tr');
                row.className = 'wine-table-row';
                row.onclick = () => window.location.href = `wine-details.html?id=${wine.wine_number}`;
                row.style.cursor = 'pointer';
                row.innerHTML = `
                    <td>${wine.wine_name}</td>
                    <td>${wine.wine_producer}</td>
                    <td>${wine.wine_vintage}</td>
                    <td>${wine.wine_description || 'A fine selection from our curated collection.'}</td>
                    <td>${wine.wine_price_bottle ? '$' + wine.wine_price_bottle : 'Price upon request'}</td>
                    <td>${wine.organic ? 'Yes' : 'No'}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
}
function initializeIndexPage() {
    console.log('initializeIndexPage called');
    const searchInput = document.getElementById('wine-search-input');
    const filterRegionBtn = document.getElementById('filter-region-btn');
    const filterVarietalBtn = document.getElementById('filter-varietal-btn');

    console.log('Elements found:', {
        searchInput: !!searchInput,
        filterRegionBtn: !!filterRegionBtn,
        filterVarietalBtn: !!filterVarietalBtn
    });

    // Initialize search functionality
    initializeSearchFunctionality();

    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            performGlobalSearch(e.target.value);
        });
    }

    if (filterRegionBtn) {
        filterRegionBtn.addEventListener('click', function () {
            showRegionFilterModal();
        });
    }

    if (filterVarietalBtn) {
        console.log('Adding event listener to varietal button');
        filterVarietalBtn.addEventListener('click', function () {
            console.log('Varietal button clicked');
            showVarietalFilterModal();
        });
    } else {
        console.log('Varietal button not found');
    }
}

// Global search functionality
let allWineData = null;

async function initializeSearchFunctionality() {
    console.log('initializeSearchFunctionality called');
    try {
        const response = await fetch('data/wines.json');
        if (response.ok) {
            allWineData = await response.json();
            console.log('Wine data loaded for global search:', allWineData.wines.length, 'wines');
        } else {
            console.error('Failed to fetch wine data, status:', response.status);
        }
    } catch (error) {
        console.error('Failed to load wine data for search:', error);
    }
}

function performGlobalSearch(searchTerm) {
    if (!allWineData || !searchTerm.trim()) {
        clearSearchResults();
        return;
    }

    const term = searchTerm.toLowerCase().trim();
    const results = allWineData.wines.filter(wine => {
        return (wine.wine_name && wine.wine_name.toLowerCase().includes(term)) ||
       (wine.wine_producer && wine.wine_producer.toLowerCase().includes(term)) ||
       (wine.region && wine.region.toLowerCase().includes(term)) ||
       (wine.wine_type && wine.wine_type.toLowerCase().includes(term)) ||
       (wine.wine_description && wine.wine_description.toLowerCase().includes(term)) ||
       (wine.varietals && wine.varietals.toLowerCase().includes(term));
    });

    displaySearchResults(results, searchTerm);
}

function displaySearchResults(results, searchTerm) {
    // Remove existing search results
    clearSearchResults();

    if (results.length === 0) {
        showNoResultsMessage(searchTerm);
        return;
    }

    // Create search results container
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.className = 'search-results-container glass-card';
    
    const title = document.createElement('h3');
    title.textContent = `Search Results for "${searchTerm}" (${results.length} found)`;
    title.className = 'search-results-title';
    
    resultsContainer.appendChild(title);

    // Group results by wine type
    const groupedResults = groupResultsByType(results);
    
    Object.keys(groupedResults).forEach(wineType => {
        const typeSection = document.createElement('div');
        typeSection.className = 'search-results-type';
        
        const typeHeader = document.createElement('h4');
        typeHeader.textContent = wineType.toUpperCase() + ' WINES';
        typeHeader.className = 'search-results-type-header';
        typeSection.appendChild(typeHeader);

        const winesGrid = document.createElement('div');
        winesGrid.className = 'search-results-grid';

        groupedResults[wineType].forEach(wine => {
            const wineCard = createWineCard(wine);
            winesGrid.appendChild(wineCard);
        });

        typeSection.appendChild(winesGrid);
        resultsContainer.appendChild(typeSection);
    });

    // Insert after the search bar
    const searchBar = document.querySelector('.wine-search-filter-bar');
    if (searchBar && searchBar.parentNode) {
        searchBar.parentNode.insertBefore(resultsContainer, searchBar.nextSibling);
    }
}

function groupResultsByType(results) {
    return results.reduce((groups, wine) => {
        const type = wine.wine_type;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(wine);
        return groups;
    }, {});
}

function createWineCard(wine) {
    const card = document.createElement('a');
    card.className = 'wine-card glass-card';
    card.href = `wine-details.html?id=${wine.wine_number}`;
    card.innerHTML = `
        <h4>${wine.wine_name}</h4>
        <div class="producer">${wine.wine_producer}</div>
        <div class="vintage">${wine.wine_vintage}</div>
        <div class="region">${wine.region}</div>
        <div class="description">${wine.wine_description || 'A fine selection from our curated collection.'}</div>
        <div class="price">${wine.wine_price_bottle ? '$' + wine.wine_price_bottle : 'Price upon request'}</div>
        ${wine.organic ? '<span class="organic-badge">ORGANIC</span>' : ''}
    `;
    return card;
}

function clearSearchResults() {
    const existingResults = document.getElementById('search-results');
    if (existingResults) {
        existingResults.remove();
    }
}

function showNoResultsMessage(searchTerm) {
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.className = 'search-results-container glass-card no-results';
    
    resultsContainer.innerHTML = `
        <h3>No Results Found</h3>
        <p>No wines found matching "${searchTerm}". Try searching for:</p>
        <ul>
            <li>Wine name (e.g., "Chianti", "Barolo")</li>
            <li>Producer name</li>
            <li>Region (e.g., "Tuscany", "Piedmont")</li>
            <li>Wine type (e.g., "Red", "White", "Sparkling")</li>
        </ul>
    `;

    const searchBar = document.querySelector('.wine-search-filter-bar');
    if (searchBar && searchBar.parentNode) {
        searchBar.parentNode.insertBefore(resultsContainer, searchBar.nextSibling);
    }
}

function showRegionFilterModal() {
    if (!allWineData) {
        alert('Wine data is still loading. Please try again in a moment.');
        return;
    }

    // Get all unique regions
    const regions = [...new Set(allWineData.wines.map(wine => wine.region))].sort();
    
    // Create modal HTML
    const modalHTML = `
        <div id="region-modal" class="filter-modal-overlay">
            <div class="filter-modal glass-card">
                <div class="modal-header">
                    <h3>Filter by Region</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    <p>Select a wine type and region to browse:</p>
                    <div class="wine-type-selection-modal">
                        <a href="regions.html?type=ROSSO" class="wine-type-card-modal">
                            <img src="1.png" alt="Red Wine Icon">
                            <h4>RED WINES</h4>
                        </a>
                        <a href="regions.html?type=BIANCO" class="wine-type-card-modal">
                            <img src="2.png" alt="White Wine Icon">
                            <h4>WHITE WINES</h4>
                        </a>
                        <a href="regions.html?type=ROSATO" class="wine-type-card-modal">
                            <img src="3.png" alt="Rosé Wine Icon">
                            <h4>ROSÉ WINES</h4>
                        </a>
                        <a href="regions.html?type=BOLLICINE" class="wine-type-card-modal">
                            <img src="4.png" alt="Sparkling Wine Icon">
                            <h4>SPARKLING</h4>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    const modal = document.getElementById('region-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', closeRegionModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeRegionModal();
        }
    });
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeRegionModal() {
    const modal = document.getElementById('region-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function showVarietalFilterModal() {
    console.log('showVarietalFilterModal called');
    
    if (!allWineData) {
        console.log('Wine data not loaded yet');
        alert('Wine data is still loading. Please try again in a moment.');
        return;
    }

    console.log('Wine data loaded, total wines:', allWineData.wines.length);

    // Get all unique varietals
    const varietals = [...new Set(allWineData.wines.map(wine => wine.varietals).filter(v => v))].sort();
    
    console.log('Found varietals:', varietals);
    
    if (varietals.length === 0) {
        console.log('No varietals found in data');
        alert('No varietal information available. Please browse by wine type and region instead.');
        return;
    }

    // Create modal HTML
    const modalHTML = `
        <div id="varietal-modal" class="filter-modal-overlay">
            <div class="filter-modal glass-card">
                <div class="modal-header">
                    <h3>Filter by Varietal</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    <p>Select a varietal to search for wines:</p>
                    <div class="varietal-list">
                        ${varietals.map((varietal, index) => 
                            `<button class="varietal-btn glass-card">${varietal}</button>`
                        ).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    const modal = document.getElementById('varietal-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', closeVarietalModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeVarietalModal();
        }
    });
    
    // Add event listeners to varietal buttons
    const varietalButtons = modal.querySelectorAll('.varietal-btn');
    varietalButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const varietalText = button.textContent;
            searchByVarietal(varietalText);
        });
    });
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeVarietalModal() {
    const modal = document.getElementById('varietal-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function searchByVarietal(varietal) {
    console.log('searchByVarietal called with:', varietal);
    closeVarietalModal();
    const searchInput = document.getElementById('wine-search-input');
    if (searchInput) {
        searchInput.value = varietal;
        console.log('Setting search input to:', varietal);
        performGlobalSearch(varietal);
    } else {
        console.log('Search input not found');
    }
}

// Make searchByVarietal globally accessible
window.searchByVarietal = searchByVarietal;
