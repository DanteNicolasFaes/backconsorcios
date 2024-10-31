const { getFirestore, collection, addDoc, getDocs, doc, getDoc, deleteDoc, updateDoc } = require('firebase/firestore');
const db = getFirestore(); // Inicializar Firestore

class DocumentosManager {
    // Método para subir un nuevo documento (solo para administradores)
    static async subirDocumento(documento, archivoRuta) {
        this.validarDocumento(documento, archivoRuta); // Validaciones

        try {
            const nuevoDocumentoRef = await addDoc(collection(db, 'documentos'), {
                categoria: documento.categoria,
                fecha: documento.fecha,
                archivo: archivoRuta,  // Ruta del archivo subida por Multer
                descripcion: documento.descripcion || ''  // Descripción opcional del documento
            });

            return { id: nuevoDocumentoRef.id, ...documento, archivo: archivoRuta };
        } catch (error) {
            throw new Error(`Error al subir el documento: ${error.message}`);
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

    // Método para actualizar un documento (solo para administradores)
    static async actualizarDocumento(id, datosActualizados, archivoRuta) {
        try {
            const documentoRef = doc(db, 'documentos', id);
            const updates = { ...datosActualizados };
            if (archivoRuta) {
                updates.archivo = archivoRuta;
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

    // Método para validar un documento
    static validarDocumento(documento, archivoRuta) {
        // Verificar categoría
        if (!documento.categoria || typeof documento.categoria !== 'string') {
            throw new Error('La categoría es obligatoria y debe ser una cadena de texto.');
        }
        // Verificar fecha
        if (!documento.fecha || isNaN(new Date(documento.fecha).getTime())) {
            throw new Error('La fecha es obligatoria y debe tener un formato válido.');
        }
        // Verificar archivo
        if (!archivoRuta) {
            throw new Error('El archivo es obligatorio.');
        }
    }
}

module.exports = DocumentosManager;
