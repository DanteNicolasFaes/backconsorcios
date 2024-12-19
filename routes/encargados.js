import express from 'express';
import authenticateUser from '../middleware/authenticatedUser.js'; // Asegúrate de que el nombre del archivo sea correcto
import verifyAdmin from '../middleware/verifyAdmin.js';
import EncargadoManager from '../manager/EncargadoManager.js';

const router = express.Router();

// Ruta para crear un nuevo encargado
router.post('/', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const nuevoEncargado = await EncargadoManager.crearEncargado(req.body);
        res.status(201).json(nuevoEncargado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los encargados
router.get('/', authenticateUser, async (req, res) => {
    try {
        const encargados = await EncargadoManager.obtenerEncargados();
        res.status(200).json(encargados);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un encargado por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const encargado = await EncargadoManager.obtenerEncargadoPorId(req.params.id);
        res.status(200).json(encargado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un encargado
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const encargadoActualizado = await EncargadoManager.actualizarEncargado(req.params.id, req.body);
        res.status(200).json(encargadoActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un encargado
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        await EncargadoManager.eliminarEncargado(req.params.id);
        res.status(200).json({ mensaje: 'Encargado eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;