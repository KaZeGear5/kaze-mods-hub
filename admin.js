const authOverlay = document.getElementById('authOverlay');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('authError');
const logoutBtn = document.getElementById('logoutBtn');

const modForm = document.getElementById('modForm');
const adminModsTableBody = document.getElementById('adminModsTableBody');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formTitle = document.getElementById('formTitle');

// 1. Authentification locale
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('kaze_admin_logged', 'true');
        checkAuth();
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('kaze_admin_logged');
        checkAuth();
    });
}

function checkAuth() {
    const isLogged = localStorage.getItem('kaze_admin_logged') === 'true';
    if (isLogged) {
        if (authOverlay) authOverlay.classList.add('hidden');
        if (adminDashboard) adminDashboard.classList.remove('hidden');
        loadAdminMods();
    } else {
        if (authOverlay) authOverlay.classList.remove('hidden');
        if (adminDashboard) adminDashboard.classList.add('hidden');
    }
}

// 2. Fonctions LocalStorage
function getMods() {
    return JSON.parse(localStorage.getItem('kaze_mods')) || [];
}

function saveMods(mods) {
    localStorage.setItem('kaze_mods', JSON.stringify(mods));
}

// 3. Affichage dans le tableau Admin
function loadAdminMods() {
    const modsList = getMods();
    const statTotal = document.getElementById('statTotalMods');
    if (statTotal) statTotal.innerText = modsList.length;
    
    if (adminModsTableBody) {
        const nowTime = Date.now();

        adminModsTableBody.innerHTML = modsList.map((m, index) => {
            // Verification de la date avec getTime()
            const publishTime = m.publishAt ? new Date(m.publishAt).getTime() : 0;
            const isScheduled = publishTime > nowTime;

            const statusBadge = isScheduled 
                ? `<span style="color: #f59e0b; font-size:0.8rem; font-weight: bold;">⏳ Programmé (${new Date(m.publishAt).toLocaleString('fr-FR')})</span>` 
                : `<span style="color: #10b981; font-size:0.8rem; font-weight: bold;">✅ En ligne</span>`;

            return `
            <tr>
                <td><img src="${m.imageUrl || 'https://via.placeholder.com/40'}" class="thumb-img" alt="${m.name}"></td>
                <td><strong>${m.name}</strong></td>
                <td>${statusBadge}</td>
                <td>
                    <button onclick="editMod(${index})" class="btn btn-secondary" style="padding:0.4rem 0.6rem;"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteMod(${index})" class="btn btn-primary" style="padding:0.4rem 0.6rem;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        }).join('');
    }
}

// 4. Enregistrement / Modification
if (modForm) {
    modForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('modId').value;
        const name = document.getElementById('modName').value;
        const category = document.getElementById('modCategory').value;
        const mcVersion = document.getElementById('modMcVersion').value;
        const loader = document.getElementById('modLoader').value;
        const author = document.getElementById('modAuthor').value;
        const publishAt = document.getElementById('modPublishAt').value;
        const modrinthUrl = document.getElementById('modModrinthUrl')?.value || '';
        const curseforgeUrl = document.getElementById('modCurseforgeUrl')?.value || '';
        const description = document.getElementById('modDescription').value;
        const imageUrl = document.getElementById('modImageUrl').value.trim();

        const newMod = {
            name,
            category,
            versions: mcVersion,
            loader,
            author,
            publishAt: publishAt ? publishAt : null,
            downloadUrl: modrinthUrl || curseforgeUrl || '#',
            modrinthUrl,
            curseforgeUrl,
            description,
            imageUrl
        };

        let mods = getMods();

        if (id !== '') {
            mods[parseInt(id)] = newMod;
        } else {
            mods.push(newMod);
        }

        saveMods(mods);
        resetForm();
        loadAdminMods();
        alert("Mod enregistré avec succès !");
    });
}

// 5. Édition
window.editMod = (index) => {
    const mods = getMods();
    const m = mods[index];
    if (!m) return;

    document.getElementById('modId').value = index;
    document.getElementById('modName').value = m.name || '';
    document.getElementById('modCategory').value = m.category || 'Performance';
    document.getElementById('modMcVersion').value = m.versions || '';
    document.getElementById('modLoader').value = m.loader || '';
    document.getElementById('modAuthor').value = m.author || '';
    document.getElementById('modPublishAt').value = m.publishAt || '';
    
    if (document.getElementById('modModrinthUrl')) {
        document.getElementById('modModrinthUrl').value = m.modrinthUrl || m.downloadUrl || '';
    }
    if (document.getElementById('modCurseforgeUrl')) {
        document.getElementById('modCurseforgeUrl').value = m.curseforgeUrl || '';
    }
    
    document.getElementById('modImageUrl').value = m.imageUrl || '';
    document.getElementById('modDescription').value = m.description || '';

    if (formTitle) formTitle.innerText = "Modifier : " + m.name;
    if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 6. Suppression
window.deleteMod = (index) => {
    if (confirm("Supprimer ce mod ?")) {
        let mods = getMods();
        mods.splice(index, 1);
        saveMods(mods);
        loadAdminMods();
    }
};

if (cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    if (modForm) modForm.reset();
    document.getElementById('modId').value = '';
    if (formTitle) formTitle.innerText = "Ajouter un mod";
    if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
}

// Lancement au chargement
checkAuth();
