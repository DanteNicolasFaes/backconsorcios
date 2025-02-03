import dotenv from 'dotenv'; // Cargar variables de entorno
import express from 'express';
import UsuariosManager from '../manager/UsuariosManager.js';
import authenticateUser from '../middleware/authenticatedUser.js'; // Middleware para autenticar al usuario
import verifyAdmin from '../middleware/verifyAdmin.js'; // Middleware para verificar si es administrador
import { uploadAndStoreUrls } from '../middleware/multerMiddleware.js'; // Middleware de Multer

dotenv.config(); // Cargar variables de entorno

const router = express.Router();

// Ruta para crear un nuevo usuario (con subida de archivos opcionales)
router.post('/', authenticateUser, verifyAdmin, uploadAndStoreUrls, async (req, res) => {
    try {
        // Recoger la información del cuerpo y las URLs de los archivos subidos
        const nuevoUsuario = {
            ...req.body,
            archivos: req.fileUrls // Guardamos las URLs de los archivos en un array
        };

        // Pasar los archivos a `UsuariosManager` para que los procese
        const usuarioCreado = await UsuariosManager.crearUsuario(nuevoUsuario, req.user); // Pasar el usuario autenticado
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
router.put('/:id', authenticateUser, verifyAdmin, uploadAndStoreUrls, async (req, res) => {
    try {
        // Recoger las URLs de los archivos subidos (si hay)
        const usuarioActualizado = {
            ...req.body,
            archivos: req.fileUrls // Actualizamos los archivos del usuario
        };

        // Llamar a `UsuariosManager` para actualizar el usuario con los nuevos datos
        const usuario = await UsuariosManager.actualizarUsuario(req.params.id, usuarioActualizado, req.user); // Pasar el usuario autenticado
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
