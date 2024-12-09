// routes/configuracionFinanciera.js
const express = require('express');
const router = express.Router();
const ConfiguracionFinancieraManager = require('../manager/ConfiguracionFinancieraManager');
const authenticateUser = require('../middleware/authenticateUser');
const verifyAdmin = require('../middleware/verifyAdmin');
const upload = require('../middleware/uploads'); // Middleware para manejar la carga de archivos

// Ruta para obtener la configuración financiera de un consorcio
router.get('/:consorcioId', authenticateUser, verifyAdmin, async (req, res) => {
    const { consorcioId } = req.params;
    try {
        const configuracion = await ConfiguracionFinancieraManager.obtenerConfiguracion(consorcioId);
        res.json(configuracion);
    } catch (error) {
        // Enviar un mensaje de error más detallado
        res.status(404).json({
            error: `No se pudo obtener la configuración financiera: ${error.message}`
        });
    }
});

// Ruta para crear o actualizar la configuración financiera de un consorcio (con archivos)
router.post('/:consorcioId', authenticateUser, verifyAdmin, upload.array('files'), async (req, res) => {
    const { consorcioId } = req.params;
    const { interesPorMora, periodoMora } = req.body;

    // Manejar archivos subidos
    const archivos = req.files ? req.files.map(file => `http://yourdomain.com/uploads/${file.filename}`) : [];

    try {
        const configuracion = {
            consorcioId,
            interesPorMora,
            periodoMora,
            archivos, // Agregar las rutas de los archivos subidos a la configuración
        };

        const result = await ConfiguracionFinancieraManager.crearOActualizarConfiguracion(consorcioId, configuracion);
        res.json(result);
    } catch (error) {
        // Enviar un mensaje de error más detallado
        res.status(500).json({
            error: `Error al crear o actualizar la configuración financiera: ${error.message}`
        });
    }
});

// Ruta para actualizar la configuración financiera de un consorcio (con archivos)
router.put('/:consorcioId', authenticateUser, verifyAdmin, upload.array('files'), async (req, res) => {
    const { consorcioId } = req.params;
    const { interesPorMora, periodoMora } = req.body;

    // Manejar archivos subidos
    const archivos = req.files ? req.files.map(file => `http://yourdomain.com/uploads/${file.filename}`) : [];

    try {
        const configuracion = {
            interesPorMora,
            periodoMora,
            archivos, // Agregar las rutas de los archivos subidos a la configuración
        };

        const result = await ConfiguracionFinancieraManager.actualizarConfiguracion(consorcioId, configuracion);
        res.json(result);
    } catch (error) {
        // Enviar un mensaje de error más detallado
        res.status(500).json({
            error: `Error al actualizar la configuración financiera: ${error.message}`
        });
    }
});

// Ruta para eliminar la configuración financiera de un consorcio
router.delete('/:consorcioId', authenticateUser, verifyAdmin, async (req, res) => {
    const { consorcioId } = req.params;

    try {
        const result = await ConfiguracionFinancieraManager.eliminarConfiguracion(consorcioId);
        res.json(result);
    } catch (error) {
        // Enviar un mensaje de error más detallado
        res.status(500).json({
            error: `Error al eliminar la configuración financiera: ${error.message}`
        });
    }
});

module.exports = router;
