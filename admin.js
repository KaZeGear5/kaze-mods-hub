const ADMIN_PASSWORD = "kaze";

function getSavedItems() {
    return JSON.parse(localStorage.getItem('kaze_hub_content') || '[]');
}

function saveItems(items) {
    localStorage.setItem('kaze_hub_content', JSON.stringify(items));
}

document.addEventListener('DOMContentLoaded', () => {
    const authOverlay = document.getElementById('authOverlay');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const authError = document.getElementById('authError');

    if (sessionStorage.getItem('admin_logged') === 'true') {
        authOverlay.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        renderAdmin();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = document.getElementById('loginPassword').value;
        if (pwd === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_logged', 'true');
            authOverlay.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            renderAdmin();
        } else {
            authError.classList.remove('hidden');
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        sessionStorage.removeItem('admin_logged');
        window.location.reload();
    });

    const contentForm = document.getElementById('contentForm');
    contentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const items = getSavedItems();
        const editId = document.getElementById('itemId').value;
        
        const newItem = {
            id: editId ? parseInt(editId) : Date.now(),
            type: document.getElementById('itemType').value,
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            versions: document.getElementById('itemVersion').value,
            subtype: document.getElementById('itemSubtype').value || 'Général',
            downloadUrl: document.getElementById('itemDownloadUrl').value,
            imageUrl: document.getElementById('itemImageUrl').value,
            description: document.getElementById('itemDescription').value
        };

        if (editId) {
            const index = items.findIndex(i => i.id === parseInt(editId));
            if (index !== -1) items[index] = newItem;
        } else {
            items.push(newItem);
        }

        saveItems(items);
        resetForm();
        renderAdmin();
    });

    document.getElementById('cancelBtn').addEventListener('click', resetForm);
});

function resetForm() {
    document.getElementById('contentForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Ajouter un Contenu';
    document.getElementById('cancelBtn').classList.add('hidden');
}

function renderAdmin() {
    const items = getSavedItems();

    const mods = items.filter(i => i.type === 'mod');
    const packs = items.filter(i => i.type === 'resourcepack');

    // 1. Stats Globale (Total) + Total Mods + Total Resource Packs
    document.getElementById('statGlobal').textContent = items.length;
    document.getElementById('statTotalMods').textContent = mods.length;
    document.getElementById('statTotalPacks').textContent = packs.length;

    // 2. Tableau
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">Aucun contenu ajouté.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>
                <span style="background:${item.type === 'mod' ? '#D32F2F' : '#0284c7'}; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:bold;">
                    ${item.type === 'mod' ? 'MOD' : 'RESOURCE PACK'}
                </span>
            </td>
            <td><img src="${item.imageUrl}" class="thumb-img" alt=""></td>
            <td><strong>${item.name}</strong></td>
            <td>${item.category}</td>
            <td>MC ${item.versions}</td>
            <td>
                <button onclick="editItem(${item.id})" class="btn btn-secondary" style="padding:4px 8px; font-size:0.8rem;"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteItem(${item.id})" class="btn btn-primary" style="padding:4px 8px; font-size:0.8rem; background:#b91c1c;"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.editItem = function(id) {
    const items = getSavedItems();
    const item = items.find(i => i.id === id);
    if (!item) return;

    document.getElementById('itemId').value = item.id;
    document.getElementById('itemType').value = item.type;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemVersion').value = item.versions;
    document.getElementById('itemSubtype').value = item.subtype || '';
    document.getElementById('itemDownloadUrl').value = item.downloadUrl;
    document.getElementById('itemImageUrl').value = item.imageUrl;
    document.getElementById('itemDescription').value = item.description;

    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Modifier : ' + item.name;
    document.getElementById('cancelBtn').classList.remove('hidden');
    window.scrollTo({ top: document.getElementById('formSection').offsetTop - 20, behavior: 'smooth' });
};

window.deleteItem = function(id) {
    if (confirm("Voulez-vous vraiment supprimer ce contenu ?")) {
        let items = getSavedItems();
        items = items.filter(i => i.id !== id);
        saveItems(items);
        renderAdmin();
    }
};
