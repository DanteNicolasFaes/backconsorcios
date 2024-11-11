// /routes/pagos.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const PagosManager = require('../manager/PagosManager');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para manejo de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Usar timestamp como nombre de archivo
    }
});

const upload = multer({ storage });

// Ruta para registrar un nuevo pago
router.post('/registrar', upload.single('archivo'), async (req, res) => {
    const { monto, fechaPago, estado, idUnidadFuncional, descripcion } = req.body;
    const archivo = req.file; // El archivo subido

    // Datos del pago
    const pago = {
        monto: parseFloat(monto),
        fechaPago,
        estado,
        idUnidadFuncional,
        descripcion
    };

    try {
        // Llamar al método de PagosManager para registrar el pago
        const nuevoPago = await PagosManager.registrarPago(pago, archivo, req.user.esAdmin);

        res.status(201).json({
            message: 'Pago registrado exitosamente',
            pago: nuevoPago
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Ruta para listar todos los pagos
router.get('/', async (req, res) => {
    try {
        const pagos = await PagosManager.listarPagos();
        res.status(200).json(pagos); // Enviar la lista de pagos
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Ruta para obtener un pago por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pago = await PagosManager.obtenerPagoPorId(id);
        res.status(200).json(pago); // Enviar el pago encontrado
    } catch (error) {
        res.status(404).json({
            error: error.message
        });
    }
});

// Ruta para eliminar un pago
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const respuesta = await PagosManager.eliminarPago(id, req.user.esAdmin);
        res.status(200).json(respuesta); // Enviar mensaje de éxito
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Ruta para actualizar un pago
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { monto, fechaPago, estado, descripcion, archivo } = req.body;

    const datosActualizados = {
        monto: monto ? parseFloat(monto) : undefined,
        fechaPago,
        estado,
        descripcion,
        archivo // En este caso no estamos utilizando Multer, pero podrías hacerlo si se necesitara
    };

    try {
        const pagoActualizado = await PagosManager.actualizarPago(id, datosActualizados, req.user.esAdmin);
        res.status(200).json({
            message: 'Pago actualizado exitosamente',
            pago: pagoActualizado
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router; // Exportar las rutas de pagos
