import { db, storage } from '../firebaseConfig.js'; // Usa la configuración centralizada de Firebase
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class QuejasManager {
    // Método privado para subir archivo y obtener la URL
    static async _subirArchivoYObtenerUrl(archivo) {
        if (!archivo) return null;
        const archivoRef = ref(storage, `quejas/${Date.now()}-${archivo.originalname}`);
        await uploadBytes(archivoRef, archivo.buffer);
        return await getDownloadURL(archivoRef);
    }

    // Método para crear una nueva queja
    static async crearQueja(queja, archivos, unidadFuncionalId, esPropietario) {
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
            const archivoUrls = await Promise.all(archivos.map(archivo => this._subirArchivoYObtenerUrl(archivo)));
            const nuevaQuejaRef = await addDoc(collection(db, 'quejas'), {
                contenido: queja.contenido,
                unidadFuncionalId,
                estado: 'abierta',
                fechaCreacion: Date.now(),
                archivoUrls
            });

            return { id: nuevaQuejaRef.id, ...queja, estado: 'abierta', archivoUrls };
        } catch (error) {
            throw new Error('Error al crear la queja: ' + error.message);
        }
    }

    // Método para listar todas las quejas
    static async obtenerQuejas() {
        try {
            const snapshot = await getDocs(collection(db, 'quejas'));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

            if (archivo) {
                datos.archivoUrl = await this._subirArchivoYObtenerUrl(archivo);
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
            await updateDoc(quejaRef, { respuesta });
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

export default QuejasManager;