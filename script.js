// Données de secours / Test si l'API ou le stockage local est vide
const initialMods = [
    {
        id: "sodium",
        name: "Sodium",
        description: "Un mod d'optimisation du moteur de rendu très performant pour Minecraft.",
        category: "Optimisation",
        loader: "fabric",
        versions: ["1.20", "1.19"],
        author: "jellysquid3",
        date: "2026-07-29",
        downloads: 1250,
        imageUrl: "https://cdn.modrinth.com/data/AANobbA1/images/873f271295982e5ee965a329d2f2d93e2a567d16.png",
        modrinthUrl: "https://modrinth.com/mod/sodium",
        curseforgeUrl: "https://curseforge.com/minecraft/mc-mods/sodium"
    }
];

// Chargement des mods depuis le localStorage ou les mods par défaut
function getMods() {
    const saved = localStorage.getItem('kaze_mods');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {
            console.error("Erreur lecture localStorage", e);
        }
    }
    return initialMods;
}

// Fonction d'affichage des cartes de mods
function renderMods() {
    const grid = document.getElementById('modsGrid');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }

    if (!grid) return;

    const mods = getMods();
    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const loaderVal = document.getElementById('filterLoader')?.value || 'all';
    const versionVal = document.getElementById('filterVersion')?.value || 'all';
    const activeCategoryBtn = document.querySelector('.category-btn.active');
    const categoryVal = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'All';

    // Filtrage
    const filtered = mods.filter(mod => {
        const matchesSearch = mod.name.toLowerCase().includes(searchVal) || mod.description.toLowerCase().includes(searchVal);
        const matchesLoader = loaderVal === 'all' || (mod.loader && mod.loader.toLowerCase() === loaderVal.toLowerCase());
        const matchesVersion = versionVal === 'all' || (mod.versions && mod.versions.includes(versionVal));
        const matchesCategory = categoryVal === 'All' || categoryVal === 'Toutes' || mod.category === categoryVal;
        
        return matchesSearch && matchesLoader && matchesVersion && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">Aucun mod trouvé.</div>`;
        return;
    }

    // Génération du HTML des cartes
    grid.innerHTML = filtered.map(mod => `
        <article class="mod-card">
            <div class="mod-image-wrapper">
                <img src="${mod.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${mod.name}">
                <span class="mod-category-badge">${mod.category}</span>
            </div>
            <div class="mod-body">
                <h3 class="mod-title">${mod.name}</h3>
                <p class="mod-description">${mod.description}</p>
                
                <div class="mod-meta">
                    <span class="meta-tag">⚡ ${mod.loader || 'Fabric'}</span>
                    <span class="meta-tag">🎮 MC ${Array.isArray(mod.versions) ? mod.versions.join(', ') : mod.versions}</span>
                    <span class="meta-tag">👤 ${mod.author}</span>
                </div>

                <div style="display: flex; gap: 0.5rem; margin-top: auto;">
                    ${mod.modrinthUrl ? `<a href="${mod.modrinthUrl}" target="_blank" class="btn btn-primary"> Modrinth</a>` : ''}
                    ${mod.curseforgeUrl ? `<a href="${mod.curseforgeUrl}" target="_blank" class="btn btn-secondary"> CurseForge</a>` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    renderMods();

    // Ecouteurs d'événements pour la recherche et les filtres
    document.getElementById('searchInput')?.addEventListener('input', renderMods);
    document.getElementById('filterLoader')?.addEventListener('change', renderMods);
    document.getElementById('filterVersion')?.addEventListener('change', renderMods);

    // Ecouteurs pour les boutons de catégorie
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMods();
        });
    });
});
