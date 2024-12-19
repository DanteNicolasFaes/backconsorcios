import dotenv from 'dotenv'; // Cargar variables de entorno
import express from 'express';
import multer from 'multer'; // Importar multer
import UsuariosManager from '../manager/UsuariosManager.js';
import authenticateUser from '../middleware/authenticatedUser.js'; // Asegúrate de que el nombre del archivo sea correcto
import verifyAdmin from '../middleware/verifyAdmin.js'; // Middleware para verificar si es administrador

dotenv.config(); // Cargar variables de entorno

const router = express.Router();

// Configuración de Multer para manejar múltiples archivos
const storage = multer.memoryStorage(); // Usamos memoria temporal en lugar de disco
const upload = multer({ storage }); // Inicializar multer con la configuración

// Ruta para crear un nuevo usuario (con subida de archivos opcionales)
router.post('/', authenticateUser, verifyAdmin, upload.array('archivos', 5), async (req, res) => {
    try {
        // Recoger la información del cuerpo y los archivos subidos
        const nuevosArchivos = req.files ? req.files.map(file => file.buffer) : []; // Buffers de los archivos subidos
        const nuevoUsuario = {
            ...req.body,
            archivos: nuevosArchivos // Guardamos los buffers de los archivos en un array
        };

        // Pasar los archivos a `UsuariosManager` para que los procese según se necesite
        const usuarioCreado = await UsuariosManager.crearUsuario(nuevoUsuario, req.user, req.files); // Pasar el usuario autenticado
        res.status(201).json(usuarioCreado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los usuarios
router.get('/', authenticateUser, async (req, res) => {
    try {
        const usuarios = await UsuariosManager.obtenerUsuarios(req.user); // Pasar el usuario autenticado
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un usuario por su ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const usuario = await UsuariosManager.obtenerUsuarioPorId(req.params.id, req.user); // Pasar el usuario autenticado
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un usuario (con subida de archivos opcionales)
router.put('/:id', authenticateUser, verifyAdmin, upload.array('archivos', 5), async (req, res) => {
    try {
        // Recoger los archivos subidos (si hay) y su buffer
        const archivosActualizados = req.files ? req.files.map(file => file.buffer) : []; // Buffers de los archivos subidos
        const usuarioActualizado = {
            ...req.body,
            archivos: archivosActualizados // Actualizamos los archivos del usuario
        };

        // Llamar a `UsuariosManager` para actualizar el usuario con los nuevos datos
        const usuario = await UsuariosManager.actualizarUsuario(req.params.id, usuarioActualizado, req.user, req.files); // Pasar el usuario autenticado
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un usuario
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const mensaje = await UsuariosManager.eliminarUsuario(req.params.id, req.user); // Pasar el usuario autenticado
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;