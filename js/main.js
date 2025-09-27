document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.className;

    if (page.includes('regions-page')) {
        loadRegionsPage();
    } else if (page.includes('wines-page')) {
        loadWinesPage();
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
    const wineType = getQueryParam('type');
    if (!wineType) return;

    document.getElementById('wine-type-title').textContent = `${wineType.toUpperCase()} WINES`;

    const data = await fetchData('data/wines.json');
    if (!data) return;

    const regionsContainer = document.querySelector('.region-buttons');
    // Use "wine_type" instead of "type" to match your JSON
    const wineRegions = [...new Set(data.wines.filter(wine => wine.wine_type === wineType).map(wine => wine.region))];

    wineRegions.forEach(region => {
        const button = document.createElement('a');
        button.href = `wines.html?type=${wineType}&region=${region}`;
        button.className = 'region-button glass-card';
        button.textContent = region.toUpperCase();
        regionsContainer.appendChild(button);
    });
}

async function loadWinesPage() {
    const wineType = getQueryParam('type');
    const region = getQueryParam('region');
    if (!wineType || !region) return;

    document.getElementById('wine-header').textContent = `${wineType.toUpperCase()} WINES - ${region.toUpperCase()}`;

    const data = await fetchData('data/wines.json');
    if (!data) return;

    // Use "wine_type" and "region" to match your JSON
    const filteredWines = data.wines.filter(wine => wine.wine_type === wineType && wine.region === region);
    const winesGrid = document.querySelector('.wine-cards-grid');

    winesGrid.innerHTML = '';
    if (filteredWines.length === 0) {
        winesGrid.innerHTML = '<p>No wines found for this selection.</p>';
    } else {
        filteredWines.forEach(wine => {
            const card = document.createElement('div');
            card.className = 'wine-card glass-card';
            card.innerHTML = `
                <h4>${wine.wine_name}</h4>
                <p><strong>Producer:</strong> ${wine.wine_producer}</p>
                <p><strong>Vintage:</strong> ${wine.wine_vintage}</p>
                <p><strong>Description:</strong> ${wine.wine_description || ''}</p>
                <p><strong>Price (bottle):</strong> ${wine.wine_price_bottle ? '$' + wine.wine_price_bottle : ''}</p>
                ${wine.organic ? '<p><em>Organic</em></p>' : ''}
            `;
            winesGrid.appendChild(card);
        });
    }
}
