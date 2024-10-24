const { getFirestore, collection, addDoc, getDocs, doc, getDoc, deleteDoc, updateDoc } = require('firebase/firestore'); // Importar funciones de Firestore
const db = getFirestore(); // Inicializar Firestore

class DocumentosManager {
    // Método para subir un nuevo documento (solo para administradores)
    static async subirDocumento(documento, archivoRuta) {
        this.validarDocumento(documento, archivoRuta); // Validaciones

        try {
            const nuevoDocumentoRef = await addDoc(collection(db, 'documentos'), {
                categoria: documento.categoria,   // Categoría del documento
                fecha: documento.fecha,           // Fecha de subida del documento
                archivo: archivoRuta,             // Ruta del archivo subida por Multer
                descripcion: documento.descripcion || '' // Descripción opcional del documento
            });

            return { id: nuevoDocumentoRef.id, ...documento, archivo: archivoRuta }; // Retornar el documento registrado con su ID y ruta del archivo
        } catch (error) {
            throw new Error(`Error al subir el documento: ${error.message}`);
        }
    }

    // Método para listar todos los documentos (accesible para todos)
    static async listarDocumentos() {
        try {
            const snapshot = await getDocs(collection(db, 'documentos'));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Retornar la lista de documentos
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
            return { id: documentoSnap.id, ...documentoSnap.data() }; // Retornar el documento encontrado
        } catch (error) {
            throw new Error(`Error al obtener el documento: ${error.message}`);
        }
    }

    // Método para actualizar un documento (solo para administradores)
    static async actualizarDocumento(id, datosActualizados, archivoRuta) {
        try {
            const documentoRef = doc(db, 'documentos', id);
            await updateDoc(documentoRef, {
                ...datosActualizados,
                ...(archivoRuta && { archivo: archivoRuta }) // Actualiza la ruta del archivo si se proporciona
            });
            return { message: 'Documento actualizado con éxito' }; // Mensaje de éxito
        } catch (error) {
            throw new Error(`Error al actualizar el documento: ${error.message}`);
        }
    }

    // Método para eliminar un documento (solo para administradores)
    static async eliminarDocumento(id) {
        try {
            const documentoRef = doc(db, 'documentos', id);
            await deleteDoc(documentoRef);
            return { message: 'Documento eliminado con éxito' }; // Mensaje de éxito
        } catch (error) {
            throw new Error(`Error al eliminar el documento: ${error.message}`);
        }
    }

    // Método para validar un documento
    static validarDocumento(documento, archivoRuta) {
        // 1. Verificar que la categoría esté presente y sea una cadena de texto
        if (!documento.categoria || typeof documento.categoria !== 'string') {
            throw new Error('La categoría es obligatoria y debe ser una cadena de texto.');
        }

        // 2. Verificar que la fecha esté presente y tenga un formato válido
        if (!documento.fecha || isNaN(new Date(documento.fecha).getTime())) {
            throw new Error('La fecha es obligatoria y debe tener un formato válido.');
        }

        // 3. Verificar que el archivo esté presente
        if (!archivoRuta) {
            throw new Error('El archivo es obligatorio.');
        }
    }
}

module.exports = DocumentosManager;
