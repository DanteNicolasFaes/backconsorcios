import { db } from '../firebaseConfig.js'; // Usa la configuración centralizada de Firebase
import { collection, addDoc, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { uploadAndStoreUrls } from '../middleware/uploads.js'; // Importar la función que maneja las URLs de los archivos

class DocumentosManager {
    // Método para subir un nuevo documento (ahora soporta múltiples archivos)
    static async subirDocumento(documento, archivos) {
        this.validarDocumento(documento, archivos); // Validaciones

        try {
            // Obtener las rutas de los archivos subidos y sus URLs
            const archivosUrls = await uploadAndStoreUrls(archivos);
            const docRef = await addDoc(collection(db, 'documentos'), {
                ...documento,
                archivos: archivosUrls,
                fechaCreacion: new Date(),
            });
            return { id: docRef.id, ...documento, archivos: archivosUrls };
        } catch (error) {
            throw new Error(`Error al subir el documento: ${error.message}`);
        }
    }

    // Método para listar todos los documentos (accesible para todos)
    static async listarDocumentos() {
        try {
            const querySnapshot = await getDocs(collection(db, 'documentos'));
            const documentos = [];
            querySnapshot.forEach((doc) => {
                documentos.push({ id: doc.id, ...doc.data() });
            });
            return documentos;
        } catch (error) {
            throw new Error(`Error al listar los documentos: ${error.message}`);
        }
    }

    // Método para obtener un documento específico por ID (accesible para todos)
    static async obtenerDocumentoPorId(id) {
        try {
            const docRef = doc(db, 'documentos', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error(`El documento con ID ${id} no fue encontrado.`);
            }

            return { id: docSnap.id, ...docSnap.data() };
        } catch (error) {
            throw new Error(`Error al obtener el documento: ${error.message}`);
        }
    }

    // Método para actualizar un documento (ahora también soporta múltiples archivos)
    static async actualizarDocumento(id, datosActualizados, archivos) {
        try {
            const docRef = doc(db, 'documentos', id);

            // Si hay archivos nuevos, súbelos y obtén sus URLs
            if (archivos && archivos.length > 0) {
                const archivosUrls = await uploadAndStoreUrls(archivos);
                datosActualizados.archivos = archivosUrls;
            }

            await updateDoc(docRef, datosActualizados);
            return { id, ...datosActualizados };
        } catch (error) {
            throw new Error(`Error al actualizar el documento: ${error.message}`);
        }
    }

    // Método para eliminar un documento (solo para administradores)
    static async eliminarDocumento(id) {
        try {
            const docRef = doc(db, 'documentos', id);
            await deleteDoc(docRef);
            return { message: 'Documento eliminado correctamente.' };
        } catch (error) {
            throw new Error(`Error al eliminar el documento: ${error.message}`);
        }
    }

    // Método para validar un documento (ahora también soporta múltiples archivos)
    static validarDocumento(documento, archivos) {
        // Verificar categoría
        if (!documento.categoria || typeof documento.categoria !== 'string') {
            throw new Error('La categoría del documento es inválida.');
        }
        // Verificar fecha
        if (!documento.fecha || isNaN(new Date(documento.fecha).getTime())) {
            throw new Error('La fecha del documento es inválida.');
        }
        // Verificar archivos
        if (!archivos || archivos.length === 0) {
            throw new Error('Se requiere al menos un archivo.');
        }
    }
}

export default DocumentosManager;