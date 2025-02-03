import { Router } from 'express';
import { authenticateUser } from '../middleware/authenticate.js';  // Middleware de autenticación
import { upload, uploadAndStoreUrls } from '../middleware/uploads.js';  // Middleware para manejar los archivos
import QuejasManager from '../manager/QuejasManager.js';  // El manager para manejar las quejas

const router = Router();

// Ruta para crear una nueva queja (POST)
router.post('/', authenticateUser, upload, uploadAndStoreUrls, async (req, res) => {
    try {
        // Extraemos los datos del cuerpo de la solicitud
        const { contenido, unidadFuncionalId } = req.body;
        const archivos = req.fileUrls;  // Las URLs de los archivos subidos a Firebase
        const esPropietario = req.user.role === 'propietario' || req.user.role === 'inquilino';  // Verificación del rol

        // Llamamos al método de QuejasManager para crear la queja
        const queja = await QuejasManager.crearQueja({ contenido }, archivos, unidadFuncionalId, esPropietario);

        // Respondemos con el mensaje de éxito y la queja creada
        res.status(201).json({ message: 'Queja creada con éxito', queja });
    } catch (error) {
        // Si ocurre un error, respondemos con un mensaje de error
        res.status(400).json({ message: error.message });
    }
});

// Ruta para obtener todas las quejas (GET)
router.get('/', authenticateUser, async (req, res) => {
    try {
        // Llamamos al método de QuejasManager para obtener todas las quejas
        const quejas = await QuejasManager.obtenerQuejas();

        // Respondemos con las quejas obtenidas
        res.status(200).json({ quejas });
    } catch (error) {
        // Si ocurre un error, respondemos con un mensaje de error
        res.status(400).json({ message: error.message });
    }
});

// Ruta para obtener una queja por su ID (GET)
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;  // Obtenemos el ID de la queja desde los parámetros de la URL
        const queja = await QuejasManager.obtenerQuejaPorId(id);  // Llamamos al método para obtener la queja

        if (!queja) {
            return res.status(404).json({ message: 'Queja no encontrada' });
        }

        // Respondemos con la queja encontrada
        res.status(200).json({ queja });
    } catch (error) {
        // Si ocurre un error, respondemos con un mensaje de error
        res.status(400).json({ message: error.message });
    }
});

// Ruta para actualizar una queja (PUT)
router.put('/:id', authenticateUser, upload, uploadAndStoreUrls, async (req, res) => {
    try {
        const { id } = req.params;  // Obtenemos el ID de la queja desde los parámetros de la URL
        const { contenido, unidadFuncionalId } = req.body;
        const archivos = req.fileUrls;  // Las URLs de los archivos subidos a Firebase
        const esPropietario = req.user.role === 'propietario' || req.user.role === 'inquilino';  // Verificación del rol

        // Llamamos al método de QuejasManager para actualizar la queja
        const queja = await QuejasManager.actualizarQueja(id, { contenido, unidadFuncionalId }, archivos);

        // Respondemos con el mensaje de éxito
        res.status(200).json({ message: 'Queja actualizada con éxito', queja });
    } catch (error) {
        // Si ocurre un error, respondemos con un mensaje de error
        res.status(400).json({ message: error.message });
    }
});

// Ruta para eliminar una queja (DELETE)
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;  // Obtenemos el ID de la queja desde los parámetros de la URL
        const esAdmin = req.user.role === 'admin';  // Verificación del rol de administrador

        // Llamamos al método de QuejasManager para eliminar la queja
        const response = await QuejasManager.eliminarQueja(id, esAdmin);

        // Respondemos con el mensaje de éxito
        res.status(200).json(response);
    } catch (error) {
        // Si ocurre un error, respondemos con un mensaje de error
        res.status(400).json({ message: error.message });
    }
});

export default router;
