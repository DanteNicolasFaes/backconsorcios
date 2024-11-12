const express = require('express');
const router = express.Router();
const EdificiosManager = require('../manager/EdificiosManager');
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticación
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar si es administrador
const multer = require('multer');

// Configuración de Multer para manejar la carga de archivos
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
router.post('/', authenticateUser, verifyAdmin, upload.array('documentos', 10), async (req, res) => {
    try {
        const edificioData = { 
            ...req.body, 
            documentos: req.files ? req.files.map(file => file.path) : [] // Si hay archivos, se agregan sus rutas
        };
        const nuevoEdificio = await EdificiosManager.crearEdificio(edificioData, true); // `true` asegura que solo admin accede
        res.status(201).json(nuevoEdificio);
    } catch (error) {
        res.status(500).json({ mensaje: `Error al crear el edificio: ${error.message}` });
    }
});

// Ruta para obtener todos los edificios
router.get('/', authenticateUser, async (req, res) => {
    try {
        const edificios = await EdificiosManager.obtenerEdificios();
        res.status(200).json(edificios);
    } catch (error) {
        res.status(500).json({ mensaje: `Error al obtener los edificios: ${error.message}` });
    }
});

// Ruta para obtener un edificio por su ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const edificio = await EdificiosManager.obtenerEdificioPorId(req.params.id);
        if (!edificio) {
            return res.status(404).json({ mensaje: 'Edificio no encontrado' });
        }
        res.status(200).json(edificio);
    } catch (error) {
        res.status(500).json({ mensaje: `Error al obtener el edificio: ${error.message}` });
    }
});

// Ruta para actualizar un edificio
router.put('/:id', authenticateUser, verifyAdmin, upload.array('documentos', 10), async (req, res) => {
    try {
        const edificioData = { ...req.body };
        if (req.files && req.files.length > 0) {
            edificioData.documentos = req.files.map(file => file.path); // Actualizar con las rutas de archivos si existen
        }
        const edificioActualizado = await EdificiosManager.actualizarEdificio(req.params.id, edificioData);
        if (!edificioActualizado) {
            return res.status(404).json({ mensaje: 'Edificio no encontrado para actualizar' });
        }
        res.status(200).json(edificioActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: `Error al actualizar el edificio: ${error.message}` });
    }
});

// Ruta para eliminar un edificio
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const resultado = await EdificiosManager.eliminarEdificio(req.params.id);
        if (!resultado) {
            return res.status(404).json({ mensaje: 'Edificio no encontrado para eliminar' });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: `Error al eliminar el edificio: ${error.message}` });
    }
});

module.exports = router;
