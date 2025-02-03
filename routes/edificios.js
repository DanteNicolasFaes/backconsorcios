import express from 'express';
import authenticateUser from '../middleware/authenticatedUser.js'; 
import verifyAdmin from '../middleware/verifyAdmin.js';
import upload from '../middleware/upload.js';  // Este es el middleware de uploads
import EdificiosManager from '../manager/EdificiosManager.js';

const router = express.Router();

// Ruta para crear un nuevo edificio (incluyendo archivos)
router.post('/', authenticateUser, verifyAdmin, upload.single('file'), async (req, res) => {
    try {
        const adminEmail = req.user.email;  // Obtener el email del administrador de la solicitud autenticada
        const edificioData = req.body; // Los datos del edificio
        const archivo = req.file;  // El archivo subido

        // Si se subió un archivo, manejar su almacenamiento o URL
        if (archivo) {
            // Puedes agregar lógica para guardar la URL del archivo (por ejemplo, en Firebase Storage)
            edificioData.archivoUrl = archivo.path; // O cualquier cosa que necesites hacer con el archivo
        }

        const nuevoEdificio = await EdificiosManager.crearEdificio(edificioData, adminEmail);  // Pasamos el email del admin
        res.status(201).json(nuevoEdificio);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los edificios
router.get('/', authenticateUser, async (req, res) => {
    try {
        const edificios = await EdificiosManager.obtenerEdificios();
        res.status(200).json(edificios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un edificio por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const edificio = await EdificiosManager.obtenerEdificioPorId(req.params.id);
        res.status(200).json(edificio);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un edificio
router.put('/:id', authenticateUser, verifyAdmin, upload.single('file'), async (req, res) => {
    try {
        const edificioId = req.params.id;
        const edificioData = req.body;
        const archivo = req.file;

        // Si se subió un archivo, manejar su almacenamiento o URL
        if (archivo) {
            // Puedes agregar lógica para guardar la URL del archivo (por ejemplo, en Firebase Storage)
            edificioData.archivoUrl = archivo.path;
        }

        const edificioActualizado = await EdificiosManager.actualizarEdificio(edificioId, edificioData);
        res.status(200).json(edificioActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un edificio
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        await EdificiosManager.eliminarEdificio(req.params.id);
        res.status(200).json({ mensaje: 'Edificio eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;
