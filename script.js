import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allMods = [];
let selectedCategory = 'All';

const modsGrid = document.getElementById('modsGrid');
const searchInput = document.getElementById('searchInput');
const filterLoader = document.getElementById('filterLoader');
const filterVersion = document.getElementById('filterVersion');
const sortMods = document.getElementById('sortMods');
const categoryButtons = document.querySelectorAll('.category-btn');

document.addEventListener('DOMContentLoaded', fetchMods);

async function fetchMods() {
    try {
        const snap = await getDocs(collection(db, "mods"));
        allMods = [];
        const now = new Date();

        snap.forEach(d => {
            const data = d.data();
            // N'affiche que si pas de date OU si la date programmée est passée
            if (!data.publishAt || new Date(data.publishAt) <= now) {
                allMods.push({ id: d.id, ...data });
            }
        });

        renderMods();
    } catch (err) {
        console.error("Erreur de chargement :", err);
        if (modsGrid) modsGrid.innerHTML = `<p class="error-msg">Impossible de charger les mods.</p>`;
    }
}

function getFilteredMods() {
    const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const loader = filterLoader ? filterLoader.value : 'all';
    const version = filterVersion ? filterVersion.value : 'all';
    const sort = sortMods ? sortMods.value : 'downloads';

    return allMods.filter(mod => {
        const matchesCategory = selectedCategory === 'All' || mod.category === selectedCategory;
        const matchesSearch = !search || 
            mod.name.toLowerCase().includes(search) || 
            mod.description.toLowerCase().includes(search) ||
            (mod.tags && mod.tags.some(t => t.toLowerCase().includes(search)));
        
        const matchesLoader = loader === 'all' || (mod.loader && mod.loader.toLowerCase().includes(loader.toLowerCase()));
        const matchesVersion = version === 'all' || (mod.mcVersion && mod.mcVersion.includes(version));

        return matchesCategory && matchesSearch && matchesLoader && matchesVersion;
    }).sort((a, b) => {
        if (sort === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
        if (sort === 'recent') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        if (sort === 'name') return a.name.localeCompare(b.name);
        return 0;
    });
}

function createModCardHTML(mod) {
    const formattedDate = mod.updatedAt ? new Date(mod.updatedAt).toLocaleDateString('fr-FR') : 'Inconnue';
    const fallbackImg = 'https://via.placeholder.com/400x200/1A1A1A/D32F2F?text=No+Image';

    const hasModrinth = Boolean(mod.modrinthUrl);
    const hasCurseforge = Boolean(mod.curseforgeUrl);

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

                <div class="mod-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${hasModrinth ? `
                    <a href="${mod.modrinthUrl}" target="_blank" class="btn btn-primary btn-download" data-id="${mod.id}">
                        <i class="fa-solid fa-download"></i> Modrinth
                    </a>` : ''}
                    
                    ${hasCurseforge ? `
                    <a href="${mod.curseforgeUrl}" target="_blank" class="btn btn-secondary btn-download" data-id="${mod.id}">
                        <i class="fa-solid fa-download"></i> CurseForge
                    </a>` : ''}
                </div>
            </div>
        </article>
    `;
}

function renderMods() {
    if (!modsGrid) return;
    const filtered = getFilteredMods();
    
    if (filtered.length === 0) {
        modsGrid.innerHTML = `<p class="no-results">Aucun mod disponible pour le moment.</p>`;
        return;
    }

    modsGrid.innerHTML = filtered.map(createModCardHTML).join('');
    attachDownloadListeners();
}

function attachDownloadListeners() {
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (!id) return;

            try {
                const modRef = doc(db, "mods", id);
                await updateDoc(modRef, { downloads: increment(1) });
                
                const targetMod = allMods.find(m => m.id === id);
                if (targetMod) targetMod.downloads = (targetMod.downloads || 0) + 1;
            } catch (err) {
                console.error("Erreur d'incrémentation :", err);
            }
        });
    });
}

categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        selectedCategory = e.target.dataset.category;
        renderMods();
    });
});

if (searchInput) searchInput.addEventListener('input', renderMods);
if (filterLoader) filterLoader.addEventListener('change', renderMods);
if (filterVersion) filterVersion.addEventListener('change', renderMods);
if (sortMods) sortMods.addEventListener('change', renderMods);
