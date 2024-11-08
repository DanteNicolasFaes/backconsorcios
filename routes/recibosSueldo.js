const express = require('express');
const multer = require('multer');
const { crearReciboSueldo, obtenerRecibosPorEncargadoId } = require('../manager/RecibosSueldoManager');
const authenticateUser = require('../middleware/authenticateUser'); // Ajusta la ruta según sea necesario
const verifyAdmin = require('../middleware/verifyAdmin'); // Ajusta la ruta según sea necesario

const router = express.Router();

// Configuración de Multer para permitir múltiples archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/recibos'); // Carpeta donde se guardarán los recibos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nombre único para cada archivo
    }
});
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
    next(); // Si la validación pasa, continuamos
};

// Ruta para crear un nuevo recibo de sueldo para un encargado
router.post('/:encargadoId', authenticateUser, verifyAdmin, upload.array('archivos', 10), validateReciboData, async (req, res) => {
    try {
        // Obtener los archivos subidos
        const archivos = req.files ? req.files : [];

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

module.exports = router; // Exportar el router para usarlo en el servidor
