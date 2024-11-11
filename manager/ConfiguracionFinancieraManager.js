// manager/ConfiguracionFinancieraManager.js
const admin = require('firebase-admin');

// Inicializa Firebase si aún no está inicializado
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();  // Acceso a Firestore

// Función para obtener la configuración financiera de un consorcio desde Firestore
const obtenerConfiguracion = async (consorcioId) => {
    try {
        const configuracionRef = db.collection('configuracionFinanciera').doc(consorcioId);
        const doc = await configuracionRef.get();

        if (!doc.exists) {
            throw new Error(`La configuración financiera para el consorcio con ID ${consorcioId} no fue encontrada.`);
        }

        return doc.data();
    } catch (error) {
        throw new Error(`Error al obtener la configuración financiera: ${error.message}`);
    }
};

// Función para crear o actualizar la configuración financiera de un consorcio en Firestore
const crearOActualizarConfiguracion = async (consorcioId, configuracion) => {
    try {
        const configuracionRef = db.collection('configuracionFinanciera').doc(consorcioId);

        // Actualiza o crea el documento con la nueva configuración
        await configuracionRef.set(configuracion, { merge: true });

        return {
            message: 'Configuración financiera actualizada correctamente.',
            configuracion,
        };
    } catch (error) {
        throw new Error(`Error al crear o actualizar la configuración financiera: ${error.message}`);
    }
};

// Función para actualizar la configuración financiera de un consorcio
const actualizarConfiguracion = async (consorcioId, configuracion) => {
    try {
        const configuracionRef = db.collection('configuracionFinanciera').doc(consorcioId);

        // Verifica si la configuración existe antes de actualizar
        const doc = await configuracionRef.get();
        if (!doc.exists) {
            throw new Error(`La configuración financiera para el consorcio con ID ${consorcioId} no existe.`);
        }

        // Actualiza la configuración
        await configuracionRef.update(configuracion);

        return {
            message: 'Configuración financiera actualizada correctamente.',
            configuracion,
        };
    } catch (error) {
        throw new Error(`Error al actualizar la configuración financiera: ${error.message}`);
    }
};

// Función para eliminar la configuración financiera de un consorcio
const eliminarConfiguracion = async (consorcioId) => {
    try {
        const configuracionRef = db.collection('configuracionFinanciera').doc(consorcioId);

        // Verifica si la configuración existe antes de eliminarla
        const doc = await configuracionRef.get();
        if (!doc.exists) {
            throw new Error(`La configuración financiera para el consorcio con ID ${consorcioId} no existe.`);
        }

        // Elimina el documento
        await configuracionRef.delete();

        return { message: 'Configuración financiera eliminada correctamente.' };
    } catch (error) {
        throw new Error(`Error al eliminar la configuración financiera: ${error.message}`);
    }
};

module.exports = {
    obtenerConfiguracion,
    crearOActualizarConfiguracion,
    actualizarConfiguracion,
    eliminarConfiguracion,
};
