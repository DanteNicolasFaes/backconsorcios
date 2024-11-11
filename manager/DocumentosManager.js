const { getFirestore, collection, addDoc, getDocs, doc, getDoc, deleteDoc, updateDoc } = require('firebase/firestore');
const db = getFirestore(); // Inicializar Firestore
const uploadAndStoreUrls = require('../middleware/uploads'); // Importar la función que maneja las URLs de los archivos

class DocumentosManager {
    // Método para subir un nuevo documento (ahora soporta múltiples archivos)
    static async subirDocumento(documento, archivos) {
        this.validarDocumento(documento, archivos); // Validaciones

        try {
            // Obtener las rutas de los archivos subidos y sus URLs
            const archivosUrls = await uploadAndStoreUrls(archivos); 

            const nuevoDocumentoRef = await addDoc(collection(db, 'documentos'), {
                categoria: documento.categoria,
                fecha: documento.fecha,
                archivos: archivosUrls,  // Ahora es un array con las URLs de los archivos
                descripcion: documento.descripcion || ''  // Descripción opcional del documento
            });

            return { id: nuevoDocumentoRef.id, ...documento, archivos: archivosUrls };
        } catch (error) {
            throw new Error(`Error al subir los documentos: ${error.message}`);
        }
    }

    // Método para listar todos los documentos (accesible para todos)
    static async listarDocumentos() {
        try {
            const snapshot = await getDocs(collection(db, 'documentos'));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error al listar los documentos: ${error.message}`);
        }
    }

    // Método para obtener un documento específico por ID (accesible para todos)
    static async obtenerDocumentoPorId(id) {
        try {
            const documentoRef = doc(db, 'documentos', id);
            const documentoSnap = await getDoc(documentoRef);
            if (!documentoSnap.exists()) {
                throw new Error('Documento no encontrado');
            }
            return { id: documentoSnap.id, ...documentoSnap.data() };
        } catch (error) {
            throw new Error(`Error al obtener el documento: ${error.message}`);
        }
    }

    // Método para actualizar un documento (ahora también soporta múltiples archivos)
    static async actualizarDocumento(id, datosActualizados, archivos) {
        try {
            const documentoRef = doc(db, 'documentos', id);
            const updates = { ...datosActualizados };
            if (archivos && archivos.length > 0) {
                const archivosUrls = await uploadAndStoreUrls(archivos);  // Obtener URLs de los nuevos archivos
                updates.archivos = archivosUrls;  // Actualizamos el array de archivos con las URLs
            }
            await updateDoc(documentoRef, updates);
            return { message: 'Documento actualizado con éxito' };
        } catch (error) {
            throw new Error(`Error al actualizar el documento: ${error.message}`);
        }
    }

    // Método para eliminar un documento (solo para administradores)
    static async eliminarDocumento(id) {
        try {
            const documentoRef = doc(db, 'documentos', id);
            await deleteDoc(documentoRef);
            return { message: 'Documento eliminado con éxito' };
        } catch (error) {
            throw new Error(`Error al eliminar el documento: ${error.message}`);
        }
    }

    // Método para validar un documento (ahora también soporta múltiples archivos)
    static validarDocumento(documento, archivos) {
        // Verificar categoría
        if (!documento.categoria || typeof documento.categoria !== 'string') {
            throw new Error('La categoría es obligatoria y debe ser una cadena de texto.');
        }
        // Verificar fecha
        if (!documento.fecha || isNaN(new Date(documento.fecha).getTime())) {
            throw new Error('La fecha es obligatoria y debe tener un formato válido.');
        }
        // Verificar archivos
        if (!archivos || archivos.length === 0) {
            throw new Error('Al menos un archivo debe ser proporcionado.');
        }
    }
}

module.exports = DocumentosManager;
