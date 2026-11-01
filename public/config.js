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

// Configuração da Integração Google Apps Script (Google Drive: Aula Flux/Aulas)
const GAS_CONFIG = {
    scriptId: "1e5YFYxP8hzvWt5ZkJ-Ia9st8DVjowKFJp0aJIuIsY2kAOgJo7EiIKyPb",
    editUrl: "https://script.google.com/home/projects/1e5YFYxP8hzvWt5ZkJ-Ia9st8DVjowKFJp0aJIuIsY2kAOgJo7EiIKyPb/edit",
    webAppUrl: localStorage.getItem("aulaflux_gas_webapp_url") || "https://script.google.com/macros/s/AKfycbykG2eVt5F5zMetvI23pYelA9pJiIAuJDnWztPqAnmsx4Z579dnSdKLahpldDXm71Oq/exec",
    driveRootPath: "Aula Flux/Aulas"
};
