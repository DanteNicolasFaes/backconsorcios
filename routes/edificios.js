// /routes/edificios.js
const express = require('express');
const router = express.Router();
const EdificiosManager = require('../manager/EdificiosManager');
const verifyAdmin = require('../middleware/verifyAdmin');
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

// Ruta para crear un nuevo edificio
router.post('/', verifyAdmin, upload.single('documento'), async (req, res) => {
    try {
        const nuevoEdificio = await EdificiosManager.crearEdificio(req.body);
        if (req.file) {
            nuevoEdificio.documento = req.file.path; // Agrega la ruta del archivo si se subió
        }
        res.status(201).json(nuevoEdificio);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los edificios (sin verificación)
router.get('/', async (req, res) => {
    try {
        const edificios = await EdificiosManager.obtenerEdificios();
        res.status(200).json(edificios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un edificio por su ID
router.get('/:id', async (req, res) => {
    try {
        const edificio = await EdificiosManager.obtenerEdificioPorId(req.params.id);
        res.status(200).json(edificio);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un edificio
router.put('/:id', verifyAdmin, upload.single('documento'), async (req, res) => {
    try {
        const edificioActualizado = await EdificiosManager.actualizarEdificio(req.params.id, req.body);
        if (req.file) {
            edificioActualizado.documento = req.file.path; // Agrega la ruta del archivo si se subió
        }
        res.status(200).json(edificioActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un edificio
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const mensaje = await EdificiosManager.eliminarEdificio(req.params.id);
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
