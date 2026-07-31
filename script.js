// Fonction pour lire les mods ajoutés par l'admin
function getSavedMods() {
    const saved = localStorage.getItem('kaze_mods');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Erreur de lecture :", e);
        }
    }
    return [];
}

// Affichage de tes mods
function renderMods() {
    const grid = document.getElementById('modsGrid');
    if (!grid) return;

    const mods = getSavedMods();
    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const loaderVal = document.getElementById('filterLoader')?.value || 'all';
    const versionVal = document.getElementById('filterVersion')?.value || 'all';
    const activeCategoryBtn = document.querySelector('.category-btn.active');
    const categoryVal = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'All';

    const filtered = mods.filter(mod => {
        const matchesSearch = (mod.name || '').toLowerCase().includes(searchVal) || 
                              (mod.description || '').toLowerCase().includes(searchVal);
        const matchesLoader = loaderVal === 'all' || (mod.loader && mod.loader.toLowerCase() === loaderVal.toLowerCase());
        const matchesVersion = versionVal === 'all' || (mod.versions && mod.versions.includes(versionVal));
        const matchesCategory = categoryVal === 'All' || categoryVal === 'Toutes' || mod.category === categoryVal;
        
        return matchesSearch && matchesLoader && matchesVersion && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #9ca3af; padding: 2rem; font-size: 1.3rem;">
                Aucun mod disponible pour le moment.
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map(mod => `
        <article class="mod-card">
            <div class="mod-banner">
                <img src="${mod.imageUrl || 'https://via.placeholder.com/400x200?text=Pas+d%27image'}" alt="${mod.name}">
                <span class="badge-cat">${mod.category || 'Général'}</span>
            </div>
            <div class="mod-content">
                <h3>${mod.name}</h3>
                <p>${mod.description || ''}</p>
                <div class="tags">
                    <span class="tag">${mod.loader || 'Fabric'}</span>
                    <span class="tag">MC ${Array.isArray(mod.versions) ? mod.versions.join(', ') : (mod.versions || '1.20')}</span>
                </div>
                <p class="author">Par ${mod.author || 'Inconnu'}</p>
                <div class="stats">
                    <span>📥 ${mod.downloads || 0}</span>
                    <span>🕒 ${mod.date || ''}</span>
                </div>
                <div class="actions">
                    ${mod.modrinthUrl ? `<a href="${mod.modrinthUrl}" target="_blank" class="btn-modrinth">📥 Modrinth</a>` : ''}
                    ${mod.curseforgeUrl ? `<a href="${mod.curseforgeUrl}" target="_blank" class="btn-curseforge">📥 CurseForge</a>` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

// Execution dès que le HTML est chargé (évite le chargement infini)
document.addEventListener('DOMContentLoaded', () => {
    // Retrait du loader
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 200);
    }

    renderMods();

    // Filtres
    document.getElementById('searchInput')?.addEventListener('input', renderMods);
    document.getElementById('filterLoader')?.addEventListener('change', renderMods);
    document.getElementById('filterVersion')?.addEventListener('change', renderMods);

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMods();
        });
    });
});
