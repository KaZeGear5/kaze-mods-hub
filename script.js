import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let modsData = [];
let activeCategory = 'all';

// Éléments DOM
const modsGrid = document.getElementById('modsGrid');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const categoryPills = document.getElementById('categoryPills');
const sortSelect = document.getElementById('sortSelect');
const resultsCount = document.getElementById('resultsCount');
const noResults = document.getElementById('noResults');
const appLoader = document.getElementById('app-loader');
const scrollTopBtn = document.getElementById('scrollTopBtn');

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await fetchMods();
    setupEventListeners();
    hideLoader();
});

// Masquer le Loader
function hideLoader() {
    if (appLoader) {
        appLoader.classList.add('fade-out');
        setTimeout(() => appLoader.remove(), 500);
    }
}

// Fetch Mods depuis Firestore
async function fetchMods() {
    try {
        const querySnapshot = await getDocs(collection(db, "mods"));
        modsData = [];
        querySnapshot.forEach((docSnap) => {
            modsData.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderMods();
    } catch (error) {
        console.error("Erreur de chargement des mods :", error);
        resultsCount.innerText = "Erreur de connexion avec Firestore.";
    }
}

// Rendu Filtre & Recherche Instantanée
function renderMods() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedSort = sortSelect.value;

    let filtered = modsData.filter(mod => {
        const matchesCategory = (activeCategory === 'all') || (mod.category === activeCategory);
        
        const matchesSearch = mod.name.toLowerCase().includes(searchTerm) ||
                              mod.description.toLowerCase().includes(searchTerm) ||
                              (mod.tags && mod.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                              (mod.loader && mod.loader.toLowerCase().includes(searchTerm));

        return matchesCategory && matchesSearch;
    });

    // Tri
    filtered.sort((a, b) => {
        if (selectedSort === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
        if (selectedSort === 'name') return a.name.localeCompare(b.name);
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0); // Recent
    });

    // Mise à jour de l'affichage UI
    resultsCount.innerText = `${filtered.length} mod(s) trouvé(s)`;
    
    if (filtered.length === 0) {
        modsGrid.innerHTML = '';
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        modsGrid.innerHTML = filtered.map(mod => createModCardHTML(mod)).join('');
    }

    // Binder l'incrémentation des téléchargements
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modId = e.currentTarget.dataset.id;
            trackDownload(modId);
        });
    });
}

// Génération carte HTML d'un mod
function createModCardHTML(mod) {
    const formattedDate = mod.updatedAt ? new Date(mod.updatedAt).toLocaleDateString('fr-FR') : 'Inconnue';
    const fallbackImg = 'https://via.placeholder.com/400x200/1A1A1A/D32F2F?text=No+Image';

    return `
        <article class="mod-card">
            <div class="mod-image-wrapper">
                <img src="${mod.imageUrl || fallbackImg}" alt="${mod.name}" loading="lazy">
                <span class="mod-category-badge">${mod.category}</span>
            </div>
            <div class="mod-body">
                <h3 class="mod-title">${mod.name}</h3>
                <p class="mod-description">${mod.description}</p>
                
                <div class="mod-meta">
                    <span class="meta-tag loader">${mod.loader || 'Fabric/Forge'}</span>
                    <span class="meta-tag">MC ${mod.mcVersion || '1.20.x'}</span>
                    <span class="meta-tag">Par ${mod.author || 'Anonyme'}</span>
                </div>

                <div class="mod-stats">
                    <span><i class="fa-solid fa-download"></i> ${(mod.downloads || 0).toLocaleString()}</span>
                    <span><i class="fa-solid fa-clock"></i> ${formattedDate}</span>
                </div>

                <div class="mod-actions">
                    <a href="${mod.downloadUrl}" target="_blank" class="btn btn-primary btn-download" data-id="${mod.id}">
                        <i class="fa-solid fa-download"></i> Télécharger
                    </a>
                    <a href="${mod.officialSite || '#'}" target="_blank" class="btn btn-secondary">
                        <i class="fa-solid fa-globe"></i> Site
                    </a>
                </div>
            </div>
        </article>
    `;
}

// Incrément de téléchargement
async function trackDownload(modId) {
    try {
        const modRef = doc(db, "mods", modId);
        await updateDoc(modRef, { downloads: increment(1) });
    } catch (err) {
        console.error("Erreur mise à jour téléchargements:", err);
    }
}

// Event Listeners
function setupEventListeners() {
    // Recherche instantanée
    searchInput.addEventListener('input', () => {
        clearSearchBtn.classList.toggle('hidden', searchInput.value === '');
        renderMods();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        renderMods();
    });

    // Filtres Catégories
    categoryPills.addEventListener('click', (e) => {
        if (e.target.classList.contains('pill')) {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            activeCategory = e.target.dataset.category;
            renderMods();
        }
    });

    // Tri
    sortSelect.addEventListener('change', renderMods);

    // Menu Mobile
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    menuToggle.addEventListener('click', () => navMenu.classList.toggle('show'));

    // Scroll Top
    window.addEventListener('scroll', () => {
        scrollTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
                   }
