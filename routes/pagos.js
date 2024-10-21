// /routes/pagos.js
const express = require('express');
const router = express.Router();
const PagosManager = require('../manager/PagosManager');
const verifyAdmin = require('../middleware/verifyAdmin');

// Ruta para crear un nuevo pago
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const nuevoPago = await PagosManager.crearPago(req.body);
        res.status(201).json(nuevoPago);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los pagos (sin verificación)
router.get('/', async (req, res) => {
    try {
        const pagos = await PagosManager.obtenerPagos();
        res.status(200).json(pagos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un pago por su ID
router.get('/:id', async (req, res) => {
    try {
        const pago = await PagosManager.obtenerPagoPorId(req.params.id);
        res.status(200).json(pago);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un pago
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const pagoActualizado = await PagosManager.actualizarPago(req.params.id, req.body);
        res.status(200).json(pagoActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un pago
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const mensaje = await PagosManager.eliminarPago(req.params.id);
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
