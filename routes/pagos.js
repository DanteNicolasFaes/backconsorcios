// /routes/pagos.js
require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const router = express.Router();
const PagosManager = require('../manager/PagosManager');
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticación
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar si es administrador
const multer = require('multer'); // Importar multer

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Renombrar el archivo
    },
});

const upload = multer({ storage: storage });

// Ruta para crear un nuevo pago
router.post('/', authenticateUser, verifyAdmin, upload.single('archivo'), async (req, res) => {
    try {
        // Registrar el pago usando los datos del cuerpo de la solicitud y el archivo adjunto (si lo hay)
        const nuevoPago = await PagosManager.registrarPago(req.body, req.file, req.user.isAdmin);
        res.status(201).json(nuevoPago);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los pagos
router.get('/', authenticateUser, async (req, res) => {
    try {
        const pagos = await PagosManager.listarPagos(); // Obtener todos los pagos registrados
        res.status(200).json(pagos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un pago específico por su ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const pago = await PagosManager.obtenerPagoPorId(req.params.id); // Obtener pago por ID
        res.status(200).json(pago);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un pago
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const pagoActualizado = await PagosManager.actualizarPago(req.params.id, req.body, req.user.isAdmin); // Actualizar pago
        res.status(200).json(pagoActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un pago
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const mensaje = await PagosManager.eliminarPago(req.params.id, req.user.isAdmin); // Eliminar pago
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router; // Exportar el router para usarlo en otros módulos
