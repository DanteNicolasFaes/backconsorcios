const express = require('express');
const { crearReciboSueldo, obtenerRecibosPorEncargadoId } = require('../manager/RecibosSueldoManager');
const authenticateUser = require('../middleware/authenticateUser'); // Ajusta la ruta según sea necesario
const verifyAdmin = require('../middleware/verifyAdmin'); // Ajusta la ruta según sea necesario

const router = express.Router();

// Ruta para crear un nuevo recibo de sueldo para un encargado
router.post('/:encargadoId', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const reciboId = await crearReciboSueldo(req.params.encargadoId, req.body);
        res.status(201).json({ message: 'Recibo de sueldo creado con éxito', reciboId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener todos los recibos de sueldo de un encargado
router.get('/:encargadoId', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const recibos = await obtenerRecibosPorEncargadoId(req.params.encargadoId);
        res.status(200).json(recibos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
