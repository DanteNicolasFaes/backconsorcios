import express from 'express';
import authenticateUser from '../middleware/authenticatedUser.js'; 
import verifyAdmin from '../middleware/verifyAdmin.js';
import upload from '../middleware/upload.js';  // El middleware de uploads
import EncargadoManager from '../manager/EncargadoManager.js'; 

const router = express.Router();

// Ruta para crear un nuevo encargado (incluyendo archivo)
router.post('/', authenticateUser, verifyAdmin, upload.single('file'), async (req, res) => {
    try {
        // Si se sube un archivo, se puede manejar aquí
        const encargadoData = req.body;
        if (req.file) {
            // Se puede agregar la URL del archivo a los datos del encargado si se necesita
            encargadoData.archivoUrl = req.file.path; // Esto asume que estás guardando la ruta del archivo
        }

        const nuevoEncargado = await EncargadoManager.crearEncargado(encargadoData);
        res.status(201).json(nuevoEncargado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los encargados
router.get('/', authenticateUser, async (req, res) => {
    try {
        const encargados = await EncargadoManager.obtenerEncargados();
        res.status(200).json(encargados);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un encargado por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const encargado = await EncargadoManager.obtenerEncargadoPorId(req.params.id);
        res.status(200).json(encargado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un encargado (incluyendo archivo)
router.put('/:id', authenticateUser, verifyAdmin, upload.single('file'), async (req, res) => {
    try {
        const encargadoData = req.body;
        if (req.file) {
            // Si se sube un archivo, se puede manejar aquí
            encargadoData.archivoUrl = req.file.path; // Se agrega la URL del archivo actualizado
        }

        const encargadoActualizado = await EncargadoManager.actualizarEncargado(req.params.id, encargadoData);
        res.status(200).json(encargadoActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un encargado
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        await EncargadoManager.eliminarEncargado(req.params.id);
        res.status(200).json({ mensaje: 'Encargado eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;
