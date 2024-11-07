// manager/ConfiguracionFinancieraManager.js
const admin = require('firebase-admin');

// Inicializa Firebase si aún no está inicializado
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();  // Acceso a Firestore

// Función para obtener la configuración financiera de un consorcio desde Firestore
const obtenerConfiguracion = async (consorcioId) => {
    const configuracionRef = db.collection('configuracionFinanciera').doc(consorcioId);
    const doc = await configuracionRef.get();

    if (!doc.exists) {
        throw new Error('Configuración no encontrada');
    }

    return doc.data();
};

// Función para crear o actualizar la configuración financiera de un consorcio en Firestore
const crearOActualizarConfiguracion = async (consorcioId, configuracion) => {
    const configuracionRef = db.collection('configuracionFinanciera').doc(consorcioId);

    // Actualiza o crea el documento con la nueva configuración
    await configuracionRef.set(configuracion, { merge: true });

    return {
        message: 'Configuración financiera actualizada correctamente',
        configuracion,
    };
};

// Función para actualizar la configuración financiera de un consorcio
const actualizarConfiguracion = async (consorcioId, configuracion) => {
    const configuracionRef = db.collection('configuracionFinanciera').doc(consorcioId);

    // Verifica si la configuración existe antes de actualizar
    const doc = await configuracionRef.get();
    if (!doc.exists) {
        throw new Error('Configuración no encontrada');
    }

    // Actualiza la configuración
    await configuracionRef.update(configuracion);

    return {
        message: 'Configuración financiera actualizada correctamente',
        configuracion,
    };
};

// Función para eliminar la configuración financiera de un consorcio
const eliminarConfiguracion = async (consorcioId) => {
    const configuracionRef = db.collection('configuracionFinanciera').doc(consorcioId);

    // Verifica si la configuración existe antes de eliminarla
    const doc = await configuracionRef.get();
    if (!doc.exists) {
        throw new Error('Configuración no encontrada');
    }

    // Elimina el documento
    await configuracionRef.delete();

    return { message: 'Configuración financiera eliminada correctamente' };
};

module.exports = {
    obtenerConfiguracion,
    crearOActualizarConfiguracion,
    actualizarConfiguracion,
    eliminarConfiguracion,
};
