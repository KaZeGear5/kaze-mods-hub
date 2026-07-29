import { db, auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Éléments DOM
const authOverlay = document.getElementById('authOverlay');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('authError');
const logoutBtn = document.getElementById('logoutBtn');

const modForm = document.getElementById('modForm');
const adminModsTableBody = document.getElementById('adminModsTableBody');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formTitle = document.getElementById('formTitle');

let modsList = [];

// Écouteur d'état d'authentification
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (authOverlay) authOverlay.classList.add('hidden');
        if (adminDashboard) adminDashboard.classList.remove('hidden');
        loadAdminMods();
    } else {
        if (authOverlay) authOverlay.classList.remove('hidden');
        if (adminDashboard) adminDashboard.classList.add('hidden');
    }
});

// Traitement de la connexion
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (authError) authError.classList.add('hidden');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error("Erreur de connexion :", err);
            if (authError) {
                authError.innerText = "Erreur de connexion : " + err.message;
                authError.classList.remove('hidden');
            }
        }
    });
}

// Déconnexion
if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));

// Charger la liste des mods
async function loadAdminMods() {
    try {
        const snap = await getDocs(collection(db, "mods"));
        modsList = [];
        snap.forEach(d => modsList.push({ id: d.id, ...d.data() }));
        
        const statTotal = document.getElementById('statTotalMods');
        if (statTotal) statTotal.innerText = modsList.length;
        
        if (adminModsTableBody) {
            adminModsTableBody.innerHTML = modsList.map(m => `
                <tr>
                    <td><img src="${m.imageUrl || 'https://via.placeholder.com/45'}" class="thumb-img" alt="${m.name}"></td>
                    <td><strong>${m.name}</strong></td>
                    <td>${m.category}</td>
                    <td>${m.mcVersion}</td>
                    <td>${m.downloads || 0}</td>
                    <td>
                        <button onclick="editMod('${m.id}')" class="btn btn-secondary" style="padding: 0.3rem 0.6rem;"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteMod('${m.id}')" class="btn btn-primary" style="padding: 0.3rem 0.6rem;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error("Erreur chargement mods :", err);
    }
}

// Soumission du formulaire (Ajout / Modification)
if (modForm) {
    modForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('modId').value;
        const name = document.getElementById('modName').value;
        const category = document.getElementById('modCategory').value;
        const mcVersion = document.getElementById('modMcVersion').value;
        const loader = document.getElementById('modLoader').value;
        const author = document.getElementById('modAuthor').value;
        const tags = document.getElementById('modTags').value.split(',').map(t => t.trim());
        const downloadUrl = document.getElementById('modDownloadUrl').value;
        const officialSite = document.getElementById('modOfficialSite').value;
        const description = document.getElementById('modDescription').value;
        const imageUrl = document.getElementById('modImageUrl').value.trim();

        const modData = {
            name, category, mcVersion, loader, author, tags,
            downloadUrl, officialSite, description, imageUrl,
            updatedAt: new Date().toISOString()
        };

        try {
            if (id) {
                await updateDoc(doc(db, "mods", id), modData);
            } else {
                modData.downloads = 0;
                await addDoc(collection(db, "mods"), modData);
            }
            resetForm();
            loadAdminMods();
            alert("Mod enregistré avec succès !");
        } catch (err) {
            alert("Erreur lors de l'enregistrement : " + err.message);
        }
    });
}

window.editMod = (id) => {
    const m = modsList.find(x => x.id === id);
    if (!m) return;

    document.getElementById('modId').value = m.id;
    document.getElementById('modName').value = m.name;
    document.getElementById('modCategory').value = m.category;
    document.getElementById('modMcVersion').value = m.mcVersion;
    document.getElementById('modLoader').value = m.loader;
    document.getElementById('modAuthor').value = m.author;
    document.getElementById('modTags').value = m.tags ? m.tags.join(', ') : '';
    document.getElementById('modDownloadUrl').value = m.downloadUrl || '';
    document.getElementById('modOfficialSite').value = m.officialSite || '';
    document.getElementById('modImageUrl').value = m.imageUrl || '';
    document.getElementById('modDescription').value = m.description;

    if (formTitle) formTitle.innerText = "Modifier le mod : " + m.name;
    if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteMod = async (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce mod ?")) {
        try {
            await deleteDoc(doc(db, "mods", id));
            loadAdminMods();
        } catch (err) {
            alert("Erreur lors de la suppression : " + err.message);
        }
    }
};

if (cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    if (modForm) modForm.reset();
    document.getElementById('modId').value = '';
    if (formTitle) formTitle.innerText = "Ajouter un nouveau mod";
    if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
                                  }
