// Configuration Firebase Auth + Firestore / Realtime
// Assure-toi que les scripts Firebase sont bien chargés dans ton <head> si tu l'utilises
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Récupération des données locales
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

    // 1. Connexion avec Firebase
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Firebase Auth Method
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Succès de connexion
                authError.classList.add('hidden');
                authOverlay.classList.add('hidden');
                adminDashboard.classList.remove('hidden');
                renderAdmin();
            })
            .catch((error) => {
                console.error("Erreur Firebase:", error.message);
                authError.textContent = "Email ou mot de passe Firebase incorrect.";
                authError.classList.remove('hidden');
            });
    });

    // Écouteur d'état Firebase (Maintient la session active)
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            authOverlay.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            renderAdmin();
        } else {
            authOverlay.classList.remove('hidden');
            adminDashboard.classList.add('hidden');
        }
    });

    // Déconnexion Firebase
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.reload();
        });
    });

    // 2. Gestion Formulaire (Ajout / Édition)
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

    document.getElementById('cancelBtn')?.addEventListener('click', resetForm);
});

function resetForm() {
    document.getElementById('contentForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Ajouter un contenu';
    document.getElementById('cancelBtn').classList.add('hidden');
}

// 3. Affichage Stats & Tableau
function renderAdmin() {
    const items = getSavedItems();

    const mods = items.filter(i => i.type === 'mod');
    const packs = items.filter(i => i.type === 'resourcepack');

    // Mise à jour des 3 cartes
    document.getElementById('statGlobal').textContent = items.length;
    document.getElementById('statTotalMods').textContent = mods.length;
    document.getElementById('statTotalPacks').textContent = packs.length;

    // Rendu du tableau
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">Aucun contenu enregistré.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>
                <span style="background:${item.type === 'mod' ? '#D32F2F' : '#0284c7'}; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:bold;">
                    ${item.type === 'mod' ? 'MOD' : 'RESOURCE PACK'}
                </span>
            </td>
            <td><img src="${item.imageUrl}" class="thumb-img" alt="" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
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
    if (confirm("Supprimer définitivement ce contenu ?")) {
        let items = getSavedItems();
        items = items.filter(i => i.id !== id);
        saveItems(items);
        renderAdmin();
    }
};
