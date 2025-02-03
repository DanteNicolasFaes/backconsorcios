import express from 'express';
import { crearReciboSueldo, obtenerRecibosPorEncargadoId } from '../manager/RecibosSueldoManager.js';
import authenticateUser from '../middleware/authenticatedUser.js'; 
import verifyAdmin from '../middleware/verifyAdmin.js';
import { upload, uploadAndStoreUrls } from '../middleware/uploadMiddleware.js';  // Traemos el middleware correctamente

// Middleware de validación para los datos del recibo de sueldo
const validateReciboData = (req, res, next) => {
    const { salario, mes, anio } = req.body;
    if (!salario || isNaN(salario) || salario <= 0) {
        return res.status(400).json({ error: 'El salario debe ser un número positivo' });
    }
    if (!mes || !anio) {
        return res.status(400).json({ error: 'El mes y el año son obligatorios' });
    }
    next();
};

const router = express.Router();

// Ruta para crear un nuevo recibo de sueldo para un encargado
router.post('/:encargadoId', authenticateUser, verifyAdmin, upload, uploadAndStoreUrls, validateReciboData, async (req, res) => {
    try {
        const archivoUrls = req.fileUrls;  // URLs de los archivos subidos

        // Llamar a la función del manager para crear el recibo
        const reciboId = await crearReciboSueldo(req.params.encargadoId, req.body, archivoUrls);

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

export default router;
