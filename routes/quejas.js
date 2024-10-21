// /routes/quejas.js
const express = require('express');
const router = express.Router();
const QuejasManager = require('../manager/QuejasManager');
const verifyAdmin = require('../middleware/verifyAdmin');

// Ruta para crear una nueva queja
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const nuevaQueja = await QuejasManager.crearQueja(req.body);
        res.status(201).json(nuevaQueja);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todas las quejas (sin verificación)
router.get('/', async (req, res) => {
    try {
        const quejas = await QuejasManager.obtenerQuejas();
        res.status(200).json(quejas);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener una queja por su ID
router.get('/:id', async (req, res) => {
    try {
        const queja = await QuejasManager.obtenerQuejaPorId(req.params.id);
        res.status(200).json(queja);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar una queja
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const quejaActualizada = await QuejasManager.actualizarQueja(req.params.id, req.body);
        res.status(200).json(quejaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar una queja
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const mensaje = await QuejasManager.eliminarQueja(req.params.id);
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
