import express from 'express';
import DocumentosManager from '../manager/DocumentosManager.js';
import authenticateUser from '../middleware/authenticateUser.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import { upload, uploadAndStoreUrls } from '../middleware/uploads.js'; // Importar middleware de carga de archivos

const router = express.Router();

// Ruta para subir un documento (ahora soporta múltiples archivos)
router.post('/', authenticateUser, verifyAdmin, upload, uploadAndStoreUrls, async (req, res) => {
    try {
        if (!req.fileUrls || req.fileUrls.length === 0) {
            // Error explícito si no se suben archivos
            return res.status(400).json({ message: 'Se deben proporcionar archivos para subir el documento.' });
        }

        const archivos = req.fileUrls;  // URLs de los archivos subidos
        const documento = req.body;  // Los demás datos del documento (categoría, fecha, descripción)

        // Llamar al método para subir los documentos
        const resultado = await DocumentosManager.subirDocumento(documento, archivos);

        res.status(200).json(resultado);
    } catch (error) {
        // Mejor manejo de errores
        res.status(500).json({ message: error.message || 'Ocurrió un error desconocido al subir el documento.' });
    }
});

// Ruta para obtener todos los documentos
router.get('/', authenticateUser, async (req, res) => {
    try {
        const documentos = await DocumentosManager.listarDocumentos();
        res.status(200).json(documentos);
    } catch (error) {
        // Mejor manejo de errores
        res.status(500).json({ message: error.message || 'Ocurrió un error desconocido al listar los documentos.' });
    }
});

// Ruta para obtener un documento por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const documento = await DocumentosManager.obtenerDocumentoPorId(req.params.id);
        res.status(200).json(documento);
    } catch (error) {
        // Mejor manejo de errores
        res.status(500).json({ message: error.message || 'Ocurrió un error desconocido al obtener el documento.' });
    }
});

// Ruta para actualizar un documento (soporta múltiples archivos)
router.put('/:id', authenticateUser, verifyAdmin, upload, uploadAndStoreUrls, async (req, res) => {
    try {
        const archivos = req.fileUrls;  // Nuevas URLs de los archivos subidos
        const datosActualizados = req.body;  // Otros datos a actualizar

        const resultado = await DocumentosManager.actualizarDocumento(req.params.id, datosActualizados, archivos);
        res.status(200).json(resultado);
    } catch (error) {
        // Mejor manejo de errores
        res.status(500).json({ message: error.message || 'Ocurrió un error desconocido al actualizar el documento.' });
    }
});

// Ruta para eliminar un documento
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const resultado = await DocumentosManager.eliminarDocumento(req.params.id);
        res.status(200).json(resultado);
    } catch (error) {
        // Mejor manejo de errores
        res.status(500).json({ message: error.message || 'Ocurrió un error desconocido al eliminar el documento.' });
    }
});

export default router;