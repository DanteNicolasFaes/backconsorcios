require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DocumentosManager = require('../manager/DocumentosManager');
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticación
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar si es administrador
const multer = require('multer');

// Crear carpeta 'uploads' si no existe
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR); // Carpeta donde se guardarán los documentos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre del archivo
    }
});
const upload = multer({ storage });

// Ruta para crear un nuevo documento
router.post('/', authenticateUser, verifyAdmin, upload.single('documento'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ mensaje: 'Archivo de documento no proporcionado' });
        }

        const nuevoDocumento = await DocumentosManager.subirDocumento(req.body, req.file.path);
        res.status(201).json(nuevoDocumento);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los documentos
router.get('/', authenticateUser, async (req, res) => {
    try {
        const documentos = await DocumentosManager.listarDocumentos();
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
        const archivoRuta = req.file ? req.file.path : null;

        const documentoActualizado = await DocumentosManager.actualizarDocumento(req.params.id, req.body, archivoRuta);
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
