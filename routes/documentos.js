const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const DocumentosManager = require('../manager/DocumentosManager');

// Configuración de Multer para el manejo de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Directorio donde se almacenarán los archivos
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        const fileName = Date.now() + fileExtension;
        cb(null, fileName);  // Usamos la fecha actual para evitar nombres repetidos
    }
});
const upload = multer({ storage: storage });

// Ruta para subir un documento (ahora soporta múltiples archivos)
router.post('/', upload.array('archivos', 10), async (req, res) => {
    try {
        const archivosRutas = req.files.map(file => file.path);  // Obtener las rutas de los archivos subidos
        const documento = req.body;  // Los demás datos del documento (categoría, fecha, descripción)

        // Llamamos al método para subir los documentos
        const resultado = await DocumentosManager.subirDocumento(documento, archivosRutas);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener todos los documentos
router.get('/', async (req, res) => {
    try {
        const documentos = await DocumentosManager.listarDocumentos();
        res.status(200).json(documentos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener un documento por ID
router.get('/:id', async (req, res) => {
    try {
        const documento = await DocumentosManager.obtenerDocumentoPorId(req.params.id);
        res.status(200).json(documento);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para actualizar un documento (soporta múltiples archivos)
router.put('/:id', upload.array('archivos', 10), async (req, res) => {
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
router.delete('/:id', async (req, res) => {
    try {
        const resultado = await DocumentosManager.eliminarDocumento(req.params.id);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
