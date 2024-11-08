// routes/expensas.js

const express = require('express');
const router = express.Router();
const ExpensasManager = require('../manager/ExpensasManager');
const authenticateUser = require('../middleware/authenticateUser');  // Middleware de autenticación
const verifyAdmin = require('../middleware/verifyAdmin');  // Middleware de verificación de administrador

// Ruta para obtener todas las expensas (accesible para todos los usuarios autenticados)
router.get('/', authenticateUser, async (req, res) => {
    try {
        const expensas = await ExpensasManager.obtenerExpensas();
        res.status(200).json({
            success: true,
            data: expensas,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las expensas',
            error: error.message,
        });
    }
});

// Ruta para obtener una expensa por su ID (accesible para todos los usuarios autenticados)
router.get('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    try {
        const expensa = await ExpensasManager.obtenerExpensaPorId(id);
        if (!expensa) {
            return res.status(404).json({
                success: false,
                message: 'Expensa no encontrada',
            });
        }
        res.status(200).json({
            success: true,
            data: expensa,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la expensa',
            error: error.message,
        });
    }
});

// Ruta para crear una nueva expensa (solo para administradores)
router.post('/', authenticateUser, verifyAdmin, async (req, res) => {
    const expensa = req.body;
    // Validación de campos obligatorios
    if (!expensa.monto || !expensa.fecha || !expensa.edificioId) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos necesarios: monto, fecha y edificioId son obligatorios.',
        });
    }

    try {
        const expensaCreada = await ExpensasManager.crearExpensa(expensa);
        res.status(201).json({
            success: true,
            message: 'Expensa creada con éxito',
            data: expensaCreada,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la expensa',
            error: error.message,
        });
    }
});

// Ruta para modificar una expensa existente (solo para administradores)
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Validación de datos antes de la actualización
    if (!datosActualizados.monto && !datosActualizados.fecha && !datosActualizados.edificioId) {
        return res.status(400).json({
            success: false,
            message: 'No se ha enviado ningún dato para actualizar.',
        });
    }

    try {
        const respuesta = await ExpensasManager.modificarExpensa(id, datosActualizados);
        if (!respuesta) {
            return res.status(404).json({
                success: false,
                message: 'Expensa no encontrada para actualizar',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Expensa actualizada con éxito',
            data: respuesta,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al modificar la expensa',
            error: error.message,
        });
    }
});

// Ruta para eliminar una expensa (solo para administradores)
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const respuesta = await ExpensasManager.eliminarExpensa(id);
        if (!respuesta) {
            return res.status(404).json({
                success: false,
                message: 'Expensa no encontrada para eliminar',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Expensa eliminada con éxito',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la expensa',
            error: error.message,
        });
    }
});

// Ruta para enviar la expensa por correo electrónico (solo para administradores)
router.post('/enviar/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { email } = req.body; // Asumiendo que el email viene en el cuerpo de la solicitud

    // Validación de correo electrónico
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Correo electrónico inválido.',
        });
    }

    try {
        const expensa = await ExpensasManager.obtenerExpensaPorId(id);
        if (!expensa) {
            return res.status(404).json({
                success: false,
                message: 'Expensa no encontrada para enviar',
            });
        }
        const resultado = await ExpensasManager.enviarExpensaPorEmail(expensa, email);
        res.status(200).json({
            success: true,
            message: 'Expensa enviada con éxito',
            data: resultado,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al enviar la expensa',
            error: error.message,
        });
    }
});

module.exports = router;
