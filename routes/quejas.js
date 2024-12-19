import express from 'express';
import multer from 'multer';
import QuejasManager from '../manager/QuejasManager.js';
import authenticateUser from '../middleware/authenticatedUser.js'; // Asegúrate de que el nombre del archivo sea correcto
import verifyAdmin from '../middleware/verifyAdmin.js';

// Configuración de Multer para manejo de archivos
const storage = multer.memoryStorage(); // Usamos memoria temporal en lugar de disco
const upload = multer({ storage });

const router = express.Router();

// Ruta para crear una nueva queja
router.post('/', authenticateUser, upload.array('documentos', 10), async (req, res) => {
    try {
        // Extraemos los valores necesarios del cuerpo de la solicitud
        const { contenido, unidadFuncionalId } = req.body;
        const archivos = req.files;  // Los archivos se guardan en `req.files`
        const esPropietario = req.user.role === 'propietario' || req.user.role === 'inquilino';  // Verificamos que el usuario sea propietario o inquilino

        // Llamamos a `crearQueja` del `QuejasManager`, pasándole los datos necesarios
        const queja = await QuejasManager.crearQueja({ contenido }, archivos, unidadFuncionalId, esPropietario);

        res.status(201).json({ message: 'Queja creada con éxito', queja });  // Enviamos una respuesta exitosa con la queja creada
    } catch (error) {
        res.status(400).json({ message: error.message });  // Si hay un error, devolvemos el mensaje de error
    }
});

// Ruta para responder a una queja (solo para administradores)
router.put('/:id/responder', authenticateUser, verifyAdmin, async (req, res) => {
    const { respuesta } = req.body;
    const { id } = req.params;

    try {
        const resultado = await QuejasManager.responderQueja(id, respuesta, req.user.isAdmin);
        res.status(200).json({ message: resultado.message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Ruta para eliminar una queja (solo para administradores)
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await QuejasManager.eliminarQueja(id, req.user.isAdmin);
        res.status(200).json({ message: resultado.message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Ruta para obtener todas las quejas
router.get('/', authenticateUser, async (req, res) => {
    try {
        const quejas = await QuejasManager.obtenerQuejas();
        res.status(200).json(quejas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener una queja específica por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const queja = await QuejasManager.obtenerQuejaPorId(req.params.id);
        res.status(200).json(queja);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;