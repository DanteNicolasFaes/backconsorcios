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
        res.status(200).json(expensas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las expensas', error: error.message });
    }
});

// Ruta para obtener una expensa por su ID (accesible para todos los usuarios autenticados)
router.get('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    try {
        const expensa = await ExpensasManager.obtenerExpensaPorId(id);
        res.status(200).json(expensa);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la expensa', error: error.message });
    }
});

// Ruta para crear una nueva expensa (solo para administradores)
router.post('/', authenticateUser, verifyAdmin, async (req, res) => {
    const expensa = req.body;
    try {
        const expensaCreada = await ExpensasManager.crearExpensa(expensa);
        res.status(201).json({
            message: 'Expensa creada con éxito',
            expensa: expensaCreada
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la expensa', error: error.message });
    }
});

// Ruta para modificar una expensa existente (solo para administradores)
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;
    try {
        const respuesta = await ExpensasManager.modificarExpensa(id, datosActualizados);
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(500).json({ message: 'Error al modificar la expensa', error: error.message });
    }
});

// Ruta para eliminar una expensa (solo para administradores)
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const respuesta = await ExpensasManager.eliminarExpensa(id);
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la expensa', error: error.message });
    }
});

// Ruta para enviar la expensa por correo electrónico (solo para administradores)
router.post('/enviar/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { email } = req.body; // Asumiendo que el email viene en el cuerpo de la solicitud
    try {
        const expensa = await ExpensasManager.obtenerExpensaPorId(id);
        const resultado = await ExpensasManager.enviarExpensaPorEmail(expensa, email);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar la expensa', error: error.message });
    }
});

module.exports = router;
