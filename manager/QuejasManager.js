// /manager/QuejasManager.js
const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore'); // Importar funciones de Firestore
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage'); // Importar funciones de Firebase Storage

const db = getFirestore(); // Inicializar Firestore
const storage = getStorage(); // Inicializar Storage

class QuejasManager {
    // Método para crear una nueva queja
    static async crearQueja(queja, archivo, unidadFuncionalId, esPropietario) {
        // Validaciones
        if (!queja.contenido || typeof queja.contenido !== 'string') {
            throw new Error('El contenido de la queja es obligatorio y debe ser una cadena de texto.');
        }
        if (!unidadFuncionalId) {
            throw new Error('El ID de la unidad funcional es obligatorio.');
        }
        if (!esPropietario) {
            throw new Error('Acceso no autorizado');
        }

        try {
            let archivoUrl = null; // Variable para almacenar la URL del archivo

            // Si se proporciona un archivo, subirlo a Firebase Storage
            if (archivo) {
                const archivoRef = ref(storage, `quejas/${archivo.originalname}`);
                await uploadBytes(archivoRef, archivo.buffer);
                archivoUrl = await getDownloadURL(archivoRef);
            }

            // Crear la queja en Firestore
            const nuevaQuejaRef = await addDoc(collection(db, 'quejas'), {
                contenido: queja.contenido,
                unidadFuncionalId: unidadFuncionalId,
                estado: 'abierta',
                fechaCreacion: new Date().toISOString(),
                archivoUrl: archivoUrl
            });

            return { id: nuevaQuejaRef.id, ...queja, estado: 'abierta', archivoUrl };
        } catch (error) {
            throw new Error('Error al crear la queja: ' + error.message);
        }
    }

    // Método para listar todas las quejas
    static async obtenerQuejas() {
        try {
            const snapshot = await getDocs(collection(db, 'quejas'));
            const quejas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return quejas;
        } catch (error) {
            throw new Error('Error al listar las quejas: ' + error.message);
        }
    }

    // Método para obtener una queja específica por ID
    static async obtenerQuejaPorId(id) {
        try {
            const quejaRef = doc(db, 'quejas', id);
            const quejaSnap = await getDoc(quejaRef);
            if (!quejaSnap.exists()) {
                throw new Error('Queja no encontrada');
            }
            return { id: quejaSnap.id, ...quejaSnap.data() };
        } catch (error) {
            throw new Error('Error al obtener la queja: ' + error.message);
        }
    }

    // Método para actualizar una queja
    static async actualizarQueja(id, datosActualizados, archivo) {
        if (!id) throw new Error('El ID de la queja es obligatorio.');

        try {
            const quejaRef = doc(db, 'quejas', id);
            const datos = { ...datosActualizados };

            // Si se proporciona un archivo, subirlo y agregar la URL
            if (archivo) {
                const archivoRef = ref(storage, `quejas/${archivo.originalname}`);
                await uploadBytes(archivoRef, archivo.buffer);
                datos.archivoUrl = await getDownloadURL(archivoRef);
            }

            await updateDoc(quejaRef, datos);
            return { message: 'Queja actualizada con éxito.' };
        } catch (error) {
            throw new Error('Error al actualizar la queja: ' + error.message);
        }
    }

    // Método para que el administrador responda a una queja
    static async responderQueja(id, respuesta, esAdmin) {
        if (!esAdmin) {
            throw new Error('Acceso no autorizado');
        }

        try {
            const quejaRef = doc(db, 'quejas', id);
            await updateDoc(quejaRef, { respuesta: respuesta });
            return { message: 'Respuesta añadida a la queja con éxito' };
        } catch (error) {
            throw new Error('Error al responder a la queja: ' + error.message);
        }
    }

    // Método para eliminar una queja (solo para administradores)
    static async eliminarQueja(id, esAdmin) {
        if (!esAdmin) {
            throw new Error('Acceso no autorizado');
        }

        try {
            const quejaRef = doc(db, 'quejas', id);
            await deleteDoc(quejaRef);
            return { message: 'Queja eliminada con éxito' };
        } catch (error) {
            throw new Error('Error al eliminar la queja: ' + error.message);
        }
    }
}

module.exports = QuejasManager; // Exportar la clase para usarla en otros módulos
