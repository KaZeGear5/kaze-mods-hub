// Récupère les mods enregistrés par l'admin via LocalStorage
function getSavedMods() {
    const saved = localStorage.getItem('kaze_mods');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Erreur de lecture des mods:", e);
        }
    }
    return [];
}

// Rend la liste dynamique
function renderMods() {
    const grid = document.getElementById('modsGrid');
    const resultsCount = document.getElementById('resultsCount');
    if (!grid) return;

    const mods = getSavedMods();
    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const activePill = document.querySelector('.pill.active');
    const selectedCategory = activePill ? activePill.dataset.category : 'all';

    // Filtrage
    const filtered = mods.filter(mod => {
        const matchesSearch = (mod.name || '').toLowerCase().includes(searchVal) || 
                              (mod.description || '').toLowerCase().includes(searchVal);
        const matchesCat = selectedCategory === 'all' || mod.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    if (resultsCount) {
        resultsCount.textContent = `${filtered.length} mod(s) trouvé(s)`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
                <i class="fa-solid fa-ghost" style="font-size: 2.5rem; margin-bottom: 0.8rem; display: block;"></i>
                <p style="font-size: 1.1rem;">Aucun mod disponible pour le moment.</p>
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map(mod => `
        <article class="mod-card">
            <div class="mod-image-wrapper">
                <img src="${mod.imageUrl || 'https://via.placeholder.com/400x200?text=Pas+d%27image'}" alt="${mod.name}">
                <span class="mod-category-badge">${mod.category || 'Général'}</span>
            </div>
            <div class="mod-body">
                <h3 class="mod-title">${mod.name}</h3>
                <p class="mod-description">${mod.description || ''}</p>
                <div class="mod-meta">
                    <span class="meta-tag">${mod.loader || 'Fabric'}</span>
                    <span class="meta-tag">MC ${mod.versions || '1.20'}</span>
                </div>
                <div class="mod-actions">
                    ${mod.downloadUrl ? `<a href="${mod.downloadUrl}" target="_blank" class="btn btn-primary"><i class="fa-solid fa-download"></i> Télécharger</a>` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

// Initialisation dès que le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    // 1. Déblocage du Loader V1
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 300);
    }

    // 2. Affichage
    renderMods();

    // 3. Recherche
    document.getElementById('searchInput')?.addEventListener('input', renderMods);

    // 4. Catégories (Boutons PWA V1)
    document.querySelectorAll('.pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMods();
        });
    });

    // 5. Toggle Menu Mobile
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }
});
