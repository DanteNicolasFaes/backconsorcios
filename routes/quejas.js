// /routes/quejas.js
require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const router = express.Router();
const QuejasManager = require('../manager/QuejasManager');
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticación
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar si es administrador
const multer = require('multer'); // Importar Multer

// Configuración de Multer para permitir múltiples archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nombre del archivo
    }
});

const upload = multer({ storage });

// Ruta para crear una nueva queja (con posibilidad de múltiples archivos)
router.post('/', authenticateUser, upload.array('archivos', 10), async (req, res) => {
    try {
        // Crear la queja pasando los parámetros necesarios, incluidos los archivos
        const nuevaQueja = await QuejasManager.crearQueja(req.body, req.files, req.body.unidadFuncionalId, req.body.esPropietario);
        res.status(201).json({ mensaje: 'Queja creada con éxito.', queja: nuevaQueja });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todas las quejas
router.get('/', authenticateUser, async (req, res) => {
    try {
        const quejas = await QuejasManager.obtenerQuejas();
        res.status(200).json(quejas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener una queja por su ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const queja = await QuejasManager.obtenerQuejaPorId(req.params.id);
        res.status(200).json(queja);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar una queja
router.put('/:id', authenticateUser, verifyAdmin, upload.array('archivos', 10), async (req, res) => {
    try {
        const quejaActualizada = await QuejasManager.actualizarQueja(req.params.id, req.body, req.files);
        res.status(200).json({ mensaje: 'Queja actualizada con éxito.', queja: quejaActualizada });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar una queja
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const mensaje = await QuejasManager.eliminarQueja(req.params.id, req.user.esAdmin);
        res.status(200).json({ mensaje });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router; // Exportar el router para usarlo en el servidor
