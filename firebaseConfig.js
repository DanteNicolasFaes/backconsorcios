// /firebaseConfig.js
const admin = require('firebase-admin');

// Inicializar la app de Firebase
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://<tu-proyecto>.firebaseio.com',
});

const db = admin.firestore(); // Obtener la referencia de Firestore

module.exports = { db }; // Exportar la referencia de la base de datos
