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

function renderMods() {
    const grid = document.getElementById('modsGrid');
    const resultsCount = document.getElementById('resultsCount');
    if (!grid) return;

    const mods = getSavedMods();
    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const activePill = document.querySelector('.pill.active');
    const selectedCategory = activePill ? activePill.dataset.category : 'all';
    const sortVal = document.getElementById('sortSelect')?.value || 'recent';

    const nowTime = Date.now();

    // 1. Filtrage (Publication + Recherche + Catégorie)
    let filtered = mods.filter(mod => {
        // Si une date future est définie, on masque le mod sur le site principal
        if (mod.publishAt) {
            const publishTime = new Date(mod.publishAt).getTime();
            if (publishTime > nowTime) {
                return false;
            }
        }

        const matchesSearch = (mod.name || '').toLowerCase().includes(searchVal) || 
                              (mod.description || '').toLowerCase().includes(searchVal);
        
        let matchesCat = selectedCategory === 'all';
        if (!matchesCat) {
            if (selectedCategory === 'Shaders') {
                matchesCat = mod.category === 'Shaders' || mod.category === 'Graphismes';
            } else {
                matchesCat = mod.category === selectedCategory;
            }
        }

        return matchesSearch && matchesCat;
    });

    // 2. Tri
    if (sortVal === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        filtered.reverse();
    }

    if (resultsCount) {
        resultsCount.textContent = `${filtered.length} mod(s) disponible(s)`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted, #71717a); padding: 3rem 1rem;">
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
                    <span class="meta-tag" style="opacity: 0.8;"><i class="fa-solid fa-user"></i> ${mod.author || 'Inconnu'}</span>
                </div>
                <div class="mod-actions">
                    ${mod.downloadUrl ? `<a href="${mod.downloadUrl}" target="_blank" class="btn btn-primary"><i class="fa-solid fa-download"></i> Télécharger</a>` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 300);
    }

    renderMods();

    document.getElementById('searchInput')?.addEventListener('input', renderMods);
    document.getElementById('sortSelect')?.addEventListener('change', renderMods);

    document.querySelectorAll('.pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMods();
        });
    });

    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }
});
