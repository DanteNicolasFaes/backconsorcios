import express from 'express';
import { obtenerConfiguracion, crearOActualizarConfiguracion } from '../manager/ConfiguracionFinancieraManager.js';
import authenticateUser from '../middleware/authenticateUser.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

// Ruta para obtener la configuración financiera
router.get('/:consorcioId', authenticateUser, async (req, res) => {
    try {
        const configuracion = await obtenerConfiguracion(req.params.consorcioId);
        res.status(200).json(configuracion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para crear o actualizar la configuración financiera
router.post('/:consorcioId', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const configuracion = await crearOActualizarConfiguracion(req.params.consorcioId, req.body);
        res.status(200).json(configuracion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;