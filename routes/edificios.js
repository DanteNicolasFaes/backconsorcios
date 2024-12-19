import express from 'express';
import authenticateUser from '../middleware/authenticatedUser.js'; // Asegúrate de que el nombre del archivo sea correcto
import verifyAdmin from '../middleware/verifyAdmin.js';
import EdificiosManager from '../manager/EdificiosManager.js';

const router = express.Router();

// Ruta para crear un nuevo edificio
router.post('/', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const nuevoEdificio = await EdificiosManager.crearEdificio(req.body);
        res.status(201).json(nuevoEdificio);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los edificios
router.get('/', authenticateUser, async (req, res) => {
    try {
        const edificios = await EdificiosManager.obtenerEdificios();
        res.status(200).json(edificios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un edificio por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const edificio = await EdificiosManager.obtenerEdificioPorId(req.params.id);
        res.status(200).json(edificio);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un edificio
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const edificioActualizado = await EdificiosManager.actualizarEdificio(req.params.id, req.body);
        res.status(200).json(edificioActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un edificio
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        await EdificiosManager.eliminarEdificio(req.params.id);
        res.status(200).json({ mensaje: 'Edificio eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;