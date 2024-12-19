import express from 'express';
import multer from 'multer';
import { crearReciboSueldo, obtenerRecibosPorEncargadoId } from '../manager/RecibosSueldoManager.js';
import authenticateUser from '../middleware/authenticateUser.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

// Configuración de Multer para manejar la carga de archivos
const storage = multer.memoryStorage(); // Usamos memoria temporal en lugar de disco
const upload = multer({ storage });

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
router.post('/:encargadoId', authenticateUser, verifyAdmin, upload.array('archivos', 10), validateReciboData, async (req, res) => {
    try {
        // Obtener los archivos subidos
        const archivos = req.files || [];

        // Llamar a la función del manager para crear el recibo
        const reciboId = await crearReciboSueldo(req.params.encargadoId, req.body, archivos);

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