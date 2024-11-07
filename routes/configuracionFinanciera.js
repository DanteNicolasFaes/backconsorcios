// routes/configuracionFinanciera.js
const express = require('express');
const router = express.Router();
const ConfiguracionFinancieraManager = require('../manager/ConfiguracionFinancieraManager');
const authenticateUser = require('../middleware/authenticateUser');
const verifyAdmin = require('../middleware/verifyAdmin');

// Ruta para obtener la configuración financiera de un consorcio
router.get('/:consorcioId', authenticateUser, verifyAdmin, async (req, res) => {
    const { consorcioId } = req.params;
    try {
        const configuracion = await ConfiguracionFinancieraManager.obtenerConfiguracion(consorcioId);
        res.json(configuracion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para crear o actualizar la configuración financiera de un consorcio
router.post('/:consorcioId', authenticateUser, verifyAdmin, async (req, res) => {
    const { consorcioId } = req.params;
    const { interesPorMora, periodoMora } = req.body;

    try {
        const configuracion = {
            consorcioId,
            interesPorMora,
            periodoMora,
        };

        const result = await ConfiguracionFinancieraManager.crearOActualizarConfiguracion(consorcioId, configuracion);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para actualizar la configuración financiera de un consorcio
router.put('/:consorcioId', authenticateUser, verifyAdmin, async (req, res) => {
    const { consorcioId } = req.params;
    const { interesPorMora, periodoMora } = req.body;

    try {
        const configuracion = {
            interesPorMora,
            periodoMora,
        };

        const result = await ConfiguracionFinancieraManager.actualizarConfiguracion(consorcioId, configuracion);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para eliminar la configuración financiera de un consorcio
router.delete('/:consorcioId', authenticateUser, verifyAdmin, async (req, res) => {
    const { consorcioId } = req.params;

    try {
        const result = await ConfiguracionFinancieraManager.eliminarConfiguracion(consorcioId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
