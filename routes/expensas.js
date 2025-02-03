import express from 'express';
import ExpensasManager from '../manager/ExpensasManager.js';
import { authenticateUser, verifyAdmin } from '../middlewares/authMiddleware.js'; // Asegúrate de que los archivos de autenticación estén correctos
import upload from '../middleware/uploads.js'; // Importamos el middleware de carga de archivos

const router = express.Router();

// Ruta para obtener todas las expensas
router.get('/', authenticateUser, async (req, res) => {
    try {
        const expensas = await ExpensasManager.obtenerExpensas();
        res.status(200).json(expensas);
    } catch (error) {
        console.error('Error al obtener las expensas:', error);
        res.status(500).json({ error: 'Error al obtener las expensas' });
    }
});

// Ruta para obtener una expensa por ID
router.get('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    try {
        const expensa = await ExpensasManager.obtenerExpensaPorId(id);
        res.status(200).json(expensa);
    } catch (error) {
        console.error('Error al obtener la expensa:', error);
        res.status(500).json({ error: 'Error al obtener la expensa' });
    }
});

// Ruta para crear una nueva expensa
router.post('/', authenticateUser, verifyAdmin, upload.single('file'), async (req, res) => {
    const { body, file } = req; // Datos de la expensa y archivo cargado
    try {
        const expensaCreada = await ExpensasManager.crearExpensa(body, file); // Pasamos el archivo junto con los datos
        res.status(201).json(expensaCreada); // Devuelve la expensa creada
    } catch (error) {
        console.error('Error al crear la expensa:', error);
        res.status(500).json({ error: 'Error al crear la expensa' });
    }
});

// Ruta para actualizar una expensa
router.put('/:id', authenticateUser, verifyAdmin, upload.single('file'), async (req, res) => {
    const { id } = req.params;
    const { body, file } = req;
    try {
        const expensaActualizada = await ExpensasManager.actualizarExpensa(id, body, file);
        res.status(200).json(expensaActualizada); // Devuelve la expensa actualizada
    } catch (error) {
        console.error('Error al actualizar la expensa:', error);
        res.status(500).json({ error: 'Error al actualizar la expensa' });
    }
});

// Ruta para eliminar una expensa
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const respuesta = await ExpensasManager.eliminarExpensa(id);
        res.status(200).json(respuesta); // Devuelve el mensaje de éxito
    } catch (error) {
        console.error('Error al eliminar la expensa:', error);
        res.status(500).json({ error: 'Error al eliminar la expensa' });
    }
});

export default router;
