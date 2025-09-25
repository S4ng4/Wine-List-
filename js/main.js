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
    const wineRegions = [...new Set(data.wines.filter(wine => wine.type === wineType).map(wine => wine.region))];

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

    const filteredWines = data.wines.filter(wine => wine.type === wineType && wine.region === region);
    const winesGrid = document.querySelector('.wine-cards-grid');
    
    // Add logic for filters here if needed
    
    winesGrid.innerHTML = '';
    if (filteredWines.length === 0) {
        winesGrid.innerHTML = '<p>No wines found for this selection.</p>';
    } else {
        filteredWines.forEach(wine => {
            const card = document.createElement('a');
            // NOTE: This link should point to a detailed page which you will create.
            // For now, it's a placeholder.
            card.href = `wine-details.html?id=${wine.id}`; 
            card.className = 'wine-card glass-card';
            card.innerHTML = `
                <img src="images/${wine.image}" alt="${wine.name}">
                <h4>${wine.name}</h4>
                <p>${wine.producer}</p>
                <p>${wine.year}</p>
            `;
            winesGrid.appendChild(card);
        });
    }
}
