document.addEventListener('DOMContentLoaded', () => {
    loadWineDetails();
    setupBackButton();
});

async function loadWineDetails() {
    const wineId = getQueryParam('id');
    if (!wineId) {
        console.error('No wine ID provided');
        return;
    }

    try {
        const data = await fetchData('data/wines.json');
        if (!data) return;

        const wine = data.wines.find(w => w.wine_number === wineId);
        if (!wine) {
            console.error('Wine not found');
            return;
        }

        displayWineDetails(wine);
    } catch (error) {
        console.error('Error loading wine details:', error);
    }
}

function displayWineDetails(wine) {
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

    // Update page title
    document.title = `${wine.wine_name} - Gran Caffè L'Aquila`;

    // Update header
    document.getElementById('wine-name').textContent = wine.wine_name;
    document.getElementById('wine-producer').textContent = wine.wine_producer;

    // Update badges
    if (wine.organic) {
        document.getElementById('organic-badge').style.display = 'inline-block';
    }
    
    const wineTypeBadge = document.getElementById('wine-type-badge');
    wineTypeBadge.textContent = wineTypeNames[wine.wine_type] || wine.wine_type;

    // Update info cards
    document.getElementById('wine-vintage').textContent = wine.wine_vintage;
    document.getElementById('wine-region').textContent = wine.region;
    document.getElementById('wine-category').textContent = wine.category;
    
    const priceText = wine.wine_price_bottle ? `$${wine.wine_price_bottle}` : 'Price upon request';
    document.getElementById('wine-price').textContent = priceText;

    // Update description
    const description = wine.wine_description || 'A fine selection from our curated collection. This exceptional wine represents the perfect harmony of tradition and innovation, crafted with meticulous attention to detail.';
    document.getElementById('wine-description').textContent = description;

    // Update technical details
    document.getElementById('wine-number').textContent = wine.wine_number;
    document.getElementById('wine-producer-detail').textContent = wine.wine_producer;
    document.getElementById('wine-type-detail').textContent = wineTypeNames[wine.wine_type] || wine.wine_type;
    document.getElementById('wine-organic-detail').textContent = wine.organic ? 'Yes' : 'No';
}

function setupBackButton() {
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', () => {
        // Get the referrer URL or default to wines page
        const referrer = document.referrer;
        if (referrer && referrer.includes('wines.html')) {
            window.history.back();
        } else {
            // Fallback to regions page
            window.location.href = 'regions.html';
        }
    });
}

// Utility functions (reused from main.js)
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

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
