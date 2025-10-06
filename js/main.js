document.addEventListener('DOMContentLoaded', () => {
    // Check for page-specific elements instead of body class
    const regionsPage = document.querySelector('.regions-page');
    const winesPage = document.querySelector('.wines-page');
    const wineDetailsPage = document.querySelector('.wine-details-page');

    if (regionsPage) {
        console.log('Loading regions page...');
        loadRegionsPage();
    } else if (winesPage) {
        console.log('Loading wines page...');
        loadWinesPage();
    } else if (wineDetailsPage) {
        console.log('Loading wine details page...');
        // Wine details page is handled by wine-details.js
    } else {
        console.log('Loading index page...');
        // Index page doesn't need special loading
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
}
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('wine-search-input');
    const filterRegionBtn = document.getElementById('filter-region-btn');
    const filterVarietalBtn = document.getElementById('filter-varietal-btn');

    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            // You can implement search logic here
            // Example: console.log('Searching for:', e.target.value);
        });
    }

    if (filterRegionBtn) {
        filterRegionBtn.addEventListener('click', function () {
            // Implement region filter logic here
            // Example: alert('Filter by Region clicked!');
        });
    }

    if (filterVarietalBtn) {
        filterVarietalBtn.addEventListener('click', function () {
            // Implement varietal filter logic here
            // Example: alert('Filter by Varietal clicked!');
        });
    }
});
