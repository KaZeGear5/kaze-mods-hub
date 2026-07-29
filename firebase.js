// Importations Firebase SDK via CDN (pour compatibilité native GitHub Pages)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// TODO: Remplacez par votre configuration Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCWKoe4o8NlJq78uL98r2A8pHQ0aBj0NCQ",
  authDomain: "kaze-mods-hub.firebaseapp.com",
  projectId: "kaze-mods-hub",
  storageBucket: "kaze-mods-hub.firebasestorage.app",
  messagingSenderId: "716627763619",
  appId: "1:716627763619:web:225f8c064a93e2bbad7a16",
  measurementId: "G-21B7NGJN3Q"
};

// Initialisation
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
