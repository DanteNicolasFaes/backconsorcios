// routes/encargados.js
const express = require('express');
const {
    crearEncargado,
    obtenerEncargados,
    obtenerEncargadoPorId,
    actualizarEncargado,
    eliminarEncargado,
} = require('../manager/EncargadoManager');
const authenticateUser = require('../middleware/authenticateUser'); // Ajusta la ruta según sea necesario
const verifyAdmin = require('../middleware/verifyAdmin'); // Ajusta la ruta según sea necesario

const router = express.Router();

// Ruta para crear un nuevo encargado
router.post('/', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const encargadoId = await crearEncargado(req.body);
        res.status(201).json({ 
            message: 'Encargado creado con éxito',
            encargadoId: encargadoId // Retornamos el ID del encargado recién creado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener todos los encargados
router.get('/', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const encargados = await obtenerEncargados();
        res.status(200).json(encargados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener un encargado específico por ID
router.get('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const encargado = await obtenerEncargadoPorId(req.params.id);
        res.status(200).json(encargado);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Ruta para actualizar un encargado
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        await actualizarEncargado(req.params.id, req.body);
        res.status(200).json({ message: 'Encargado actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para eliminar un encargado
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        await eliminarEncargado(req.params.id);
        res.status(200).json({ message: 'Encargado eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
