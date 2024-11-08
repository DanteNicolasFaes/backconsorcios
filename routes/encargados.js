// routes/encargados.js
const express = require('express');
const {
    crearEncargado,
    obtenerEncargados,
    obtenerEncargadoPorId,
    actualizarEncargado,
    eliminarEncargado,
} = require('../manager/EncargadoManager');
const authenticateUser = require('../middleware/authenticateUser'); 
const verifyAdmin = require('../middleware/verifyAdmin'); 

const router = express.Router();

// Ruta para crear un nuevo encargado
router.post('/', authenticateUser, verifyAdmin, async (req, res) => {
    const { nombre, telefono, email } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !telefono || !email) {
        return res.status(400).json({ error: 'Faltan datos necesarios: nombre, teléfono y correo electrónico son obligatorios.' });
    }

    try {
        const encargadoId = await crearEncargado(req.body);
        res.status(201).json({ 
            message: 'Encargado creado con éxito',
            encargadoId: encargadoId 
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
        if (!encargado) {
            return res.status(404).json({ error: 'Encargado no encontrado.' });
        }
        res.status(200).json(encargado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para actualizar un encargado
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { nombre, telefono, email } = req.body;

    // Validación de datos antes de la actualización
    if (!nombre && !telefono && !email) {
        return res.status(400).json({ error: 'No se ha enviado ningún dato para actualizar.' });
    }

    try {
        const result = await actualizarEncargado(req.params.id, req.body);
        if (!result) {
            return res.status(404).json({ error: 'Encargado no encontrado.' });
        }
        res.status(200).json({ message: 'Encargado actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para eliminar un encargado
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const result = await eliminarEncargado(req.params.id);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Encargado no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Encargado eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
