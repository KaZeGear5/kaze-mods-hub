function getSavedItems() {
    return JSON.parse(localStorage.getItem('kaze_hub_content') || '[]');
}

let activeTypeFilter = 'all'; // 'all', 'mod', 'resourcepack'

function renderHub() {
    const grid = document.getElementById('modsGrid');
    const resultsCount = document.getElementById('resultsCount');
    if (!grid) return;

    const items = getSavedItems();
    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const activePill = document.querySelector('.pill.active');
    const selectedCat = activePill ? activePill.dataset.category : 'all';

    const filtered = items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchVal) || 
                              (item.description || '').toLowerCase().includes(searchVal);
        const matchesType = activeTypeFilter === 'all' || item.type === activeTypeFilter;
        const matchesCat = selectedCat === 'all' || item.category === selectedCat;

        return matchesSearch && matchesType && matchesCat;
    });

    if (resultsCount) {
        resultsCount.textContent = `${filtered.length} contenu(s) trouvé(s)`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
                <i class="fa-solid fa-ghost" style="font-size: 2.5rem; margin-bottom: 0.8rem; display: block;"></i>
                <p style="font-size: 1.1rem;">Aucun contenu disponible dans cette catégorie.</p>
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map(item => `
        <article class="mod-card">
            <div class="mod-image-wrapper">
                <img src="${item.imageUrl || 'https://via.placeholder.com/400x200?text=Pas+d%27image'}" alt="${item.name}">
                <span class="mod-category-badge">${item.type === 'resourcepack' ? '🎨 Pack' : '🧩 Mod'}</span>
            </div>
            <div class="mod-body">
                <h3 class="mod-title">${item.name}</h3>
                <p class="mod-description">${item.description || ''}</p>
                <div class="mod-meta">
                    <span class="meta-tag">${item.subtype || 'Général'}</span>
                    <span class="meta-tag">MC ${item.versions}</span>
                </div>
                <div class="mod-actions">
                    <a href="${item.downloadUrl}" target="_blank" class="btn btn-primary"><i class="fa-solid fa-download"></i> Télécharger</a>
                </div>
            </div>
        </article>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    // Retrait du loader
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 300);
    }

    renderHub();

    document.getElementById('searchInput')?.addEventListener('input', renderHub);

    // Filtres Catégories
    document.querySelectorAll('.pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderHub();
        });
    });

    // Navigation Toggle Mobile
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('navMenu')?.classList.toggle('show');
    });
});
