const express = require('express');
const router = express.Router();
const ExpensasManager = require('../manager/ExpensasManager');
const authenticateUser = require('../middleware/authenticateUser');
const verifyAdmin = require('../middleware/verifyAdmin');

// Ruta para obtener todas las expensas
router.get('/', authenticateUser, async (req, res) => {
    try {
        const expensas = await ExpensasManager.obtenerExpensas();
        res.status(200).json({ success: true, data: expensas });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener las expensas', error: error.message });
    }
});

// Ruta para obtener una expensa por ID
router.get('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    try {
        const expensa = await ExpensasManager.obtenerExpensaPorId(id);
        res.status(200).json({ success: true, data: expensa });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener la expensa', error: error.message });
    }
});

// Ruta para crear una nueva expensa (solo para administradores)
router.post('/', authenticateUser, verifyAdmin, async (req, res) => {
    const expensa = req.body;
    if (!expensa.monto || !expensa.fechaVencimiento || !expensa.consorcioId) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos necesarios: monto, fecha y consorcioId son obligatorios.',
        });
    }

    try {
        const expensaCreada = await ExpensasManager.crearExpensa(expensa);
        res.status(201).json({ success: true, message: 'Expensa creada con éxito', data: expensaCreada });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear la expensa', error: error.message });
    }
});

// Ruta para modificar una expensa existente
router.put('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;

    if (!Object.keys(datosActualizados).length) {
        return res.status(400).json({ success: false, message: 'No se ha enviado ningún dato para actualizar.' });
    }

    try {
        const respuesta = await ExpensasManager.modificarExpensa(id, datosActualizados);
        res.status(200).json({ success: true, message: 'Expensa actualizada con éxito', data: respuesta });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al modificar la expensa', error: error.message });
    }
});

// Ruta para eliminar una expensa
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await ExpensasManager.eliminarExpensa(id);
        res.status(200).json({ success: true, message: 'Expensa eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar la expensa', error: error.message });
    }
});

// Ruta para enviar la expensa por correo electrónico
router.post('/enviar/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'El email es obligatorio.' });
    }

    try {
        const expensa = await ExpensasManager.obtenerExpensaPorId(id);
        await ExpensasManager.enviarExpensaPorEmail(expensa, email); // Solo ejecuta la función
        res.status(200).json({ success: true, message: 'Expensa enviada por correo con éxito' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al enviar la expensa por correo', error: error.message });
    }
});


module.exports = router;
