// routes/documentos.js
const express = require('express');
const router = express.Router();
const DocumentosManager = require('../manager/DocumentosManager');
const authenticateUser = require('../middleware/authenticateUser');
const verifyAdmin = require('../middleware/verifyAdmin');
const upload = require('../middleware/uploads'); // Importar middleware de carga de archivos

// Ruta para subir un documento (ahora soporta múltiples archivos)
router.post('/', authenticateUser, verifyAdmin, upload.array('files'), async (req, res) => {
    try {
        const archivosRutas = req.files.map(file => file.path);  // Obtener las rutas de los archivos subidos
        const documento = req.body;  // Los demás datos del documento (categoría, fecha, descripción)

        // Llamar al método para subir los documentos
        const resultado = await DocumentosManager.subirDocumento(documento, archivosRutas);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener todos los documentos
router.get('/', authenticateUser, async (req, res) => {
    try {
        const documentos = await DocumentosManager.listarDocumentos();
        res.status(200).json(documentos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener un documento por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const documento = await DocumentosManager.obtenerDocumentoPorId(req.params.id);
        res.status(200).json(documento);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para actualizar un documento (soporta múltiples archivos)
router.put('/:id', authenticateUser, verifyAdmin, upload.array('files'), async (req, res) => {
    try {
        const archivosRutas = req.files.map(file => file.path);  // Nuevas rutas de archivos
        const datosActualizados = req.body;  // Otros datos a actualizar

        const resultado = await DocumentosManager.actualizarDocumento(req.params.id, datosActualizados, archivosRutas);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para eliminar un documento
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const resultado = await DocumentosManager.eliminarDocumento(req.params.id);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
