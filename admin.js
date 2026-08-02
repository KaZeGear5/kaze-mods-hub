const authOverlay = document.getElementById('authOverlay');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('authError');
const logoutBtn = document.getElementById('logoutBtn');

const modForm = document.getElementById('modForm');
const adminModsTableBody = document.getElementById('adminModsTableBody');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formTitle = document.getElementById('formTitle');

// 1. Simuler une connexion rapide (Local)
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

// 2. Charger les mods depuis localStorage
function getMods() {
    return JSON.parse(localStorage.getItem('kaze_mods')) || [];
}

function saveMods(mods) {
    localStorage.setItem('kaze_mods', JSON.stringify(mods));
}

function loadAdminMods() {
    const modsList = getMods();
    const statTotal = document.getElementById('statTotalMods');
    if (statTotal) statTotal.innerText = modsList.length;
    
    if (adminModsTableBody) {
        adminModsTableBody.innerHTML = modsList.map((m, index) => `
            <tr>
                <td><img src="${m.imageUrl || 'https://via.placeholder.com/40'}" class="thumb-img" alt="${m.name}"></td>
                <td><strong>${m.name}</strong></td>
                <td><span style="color: #10b981; font-size:0.8rem;">✅ En ligne</span></td>
                <td>
                    <button onclick="editMod(${index})" class="btn btn-secondary" style="padding:0.4rem 0.6rem;"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteMod(${index})" class="btn btn-primary" style="padding:0.4rem 0.6rem;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

// 3. Soumettre et Enregistrer le Formulaire
if (modForm) {
    modForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('modId').value;
        const name = document.getElementById('modName').value;
        const category = document.getElementById('modCategory').value;
        const mcVersion = document.getElementById('modMcVersion').value;
        const loader = document.getElementById('modLoader').value;
        const author = document.getElementById('modAuthor').value;
        const modrinthUrl = document.getElementById('modModrinthUrl').value;
        const curseforgeUrl = document.getElementById('modCurseforgeUrl').value;
        const description = document.getElementById('modDescription').value;
        const imageUrl = document.getElementById('modImageUrl').value.trim();

        const newMod = {
            name, category, versions: mcVersion, loader, author,
            downloadUrl: modrinthUrl || curseforgeUrl || '#',
            description, imageUrl
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

window.editMod = (index) => {
    const mods = getMods();
    const m = mods[index];
    if (!m) return;

    document.getElementById('modId').value = index;
    document.getElementById('modName').value = m.name;
    document.getElementById('modCategory').value = m.category;
    document.getElementById('modMcVersion').value = m.versions || '';
    document.getElementById('modLoader').value = m.loader || '';
    document.getElementById('modAuthor').value = m.author || '';
    document.getElementById('modModrinthUrl').value = m.downloadUrl || '';
    document.getElementById('modImageUrl').value = m.imageUrl || '';
    document.getElementById('modDescription').value = m.description || '';

    if (formTitle) formTitle.innerText = "Modifier : " + m.name;
    if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

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

// Initialisation au chargement
checkAuth();
