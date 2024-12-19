import admin from 'firebase-admin';

// Inicializar la app de Firebase
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://<tu-proyecto>.firebaseio.com',
    storageBucket: '<tu-proyecto>.appspot.com' // Añade la referencia al bucket de Firebase Storage
});

const db = admin.firestore(); // Obtener la referencia de Firestore
const storage = admin.storage().bucket(); // Obtener la referencia del bucket de Firebase Storage

export { db, storage }; // Exportar la referencia de la base de datos y el bucket