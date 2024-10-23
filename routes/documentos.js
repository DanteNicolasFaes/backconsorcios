// /routes/documentos.js
require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const router = express.Router();
const DocumentosManager = require('../manager/DocumentosManager');
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticación
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar si es administrador
const multer = require('multer');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los documentos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre del archivo
    }
});

const upload = multer({ storage });

// Ruta para crear un nuevo documento
router.post('/', authenticateUser, verifyAdmin, upload.single('documento'), async (req, res) => {
    try {
        const nuevoDocumento = await DocumentosManager.crearDocumento(req.body);
        if (req.file) {
            nuevoDocumento.documento = req.file.path; // Agrega la ruta del archivo si se subió
        }
        res.status(201).json(nuevoDocumento);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los documentos
router.get('/', authenticateUser, async (req, res) => {
    try {
        const documentos = await DocumentosManager.obtenerDocumentos();
        res.status(200).json(documentos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un documento por su ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const documento = await DocumentosManager.obtenerDocumentoPorId(req.params.id);
        res.status(200).json(documento);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un documento
router.put('/:id', authenticateUser, verifyAdmin, upload.single('documento'), async (req, res) => {
    try {
        const documentoActualizado = await DocumentosManager.actualizarDocumento(req.params.id, req.body);
        if (req.file) {
            documentoActualizado.documento = req.file.path; // Agrega la ruta del archivo si se subió
        }
        res.status(200).json(documentoActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un documento
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const mensaje = await DocumentosManager.eliminarDocumento(req.params.id);
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
