// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDKtMOESQ8AnmGUgrjKrzBwWaDnVcMb9pI",
    authDomain: "aulaflux.firebaseapp.com",
    projectId: "aulaflux",
    storageBucket: "aulaflux.firebasestorage.app",
    messagingSenderId: "565193324345",
    appId: "1:565193324345:web:f5285f075a727dca9fdae8",
    measurementId: "G-XWZY0DXXBC"
};

// URL do Web App do Google Apps Script para Upload de Arquivos no Google Drive
// Substitua pela URL da sua implantação do Google Apps Script (conforme gas/README.md)
const GOOGLE_GAS_UPLOAD_URL = localStorage.getItem('aulaflux_gas_url') || "";