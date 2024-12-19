import express from 'express';
import authenticateUser from '../middleware/authenticatedUser.js'; // Asegúrate de que el nombre del archivo sea correcto
import verifyAdmin from '../middleware/verifyAdmin.js';
import ExpensasManager from '../manager/ExpensasManager.js';

const router = express.Router();

// Ruta para obtener todas las expensas
router.get('/', authenticateUser, async (req, res) => {
    try {
        const expensas = await ExpensasManager.obtenerExpensas();
        res.status(200).json(expensas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener una expensa por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const expensa = await ExpensasManager.obtenerExpensaPorId(req.params.id);
        res.status(200).json(expensa);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para crear una nueva expensa
router.post('/', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const nuevaExpensa = await ExpensasManager.crearExpensa(req.body);
        res.status(201).json(nuevaExpensa);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar una expensa
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const expensaActualizada = await ExpensasManager.actualizarExpensa(req.params.id, req.body);
        res.status(200).json(expensaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar una expensa
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        await ExpensasManager.eliminarExpensa(req.params.id);
        res.status(200).json({ mensaje: 'Expensa eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;