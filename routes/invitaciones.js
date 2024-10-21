// /routes/invitaciones.js
const express = require('express');
const router = express.Router();
const InvitacionesManager = require('../manager/InvitacionesManager');
const verifyAdmin = require('../middleware/verifyAdmin');

// Ruta para crear una nueva invitación
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const nuevaInvitacion = await InvitacionesManager.crearInvitacion(req.body);
        res.status(201).json(nuevaInvitacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todas las invitaciones (sin verificación)
router.get('/', async (req, res) => {
    try {
        const invitaciones = await InvitacionesManager.obtenerInvitaciones();
        res.status(200).json(invitaciones);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener una invitación por su ID
router.get('/:id', async (req, res) => {
    try {
        const invitacion = await InvitacionesManager.obtenerInvitacionPorId(req.params.id);
        res.status(200).json(invitacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar una invitación
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const invitacionActualizada = await InvitacionesManager.actualizarInvitacion(req.params.id, req.body);
        res.status(200).json(invitacionActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar una invitación
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const mensaje = await InvitacionesManager.eliminarInvitacion(req.params.id);
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
