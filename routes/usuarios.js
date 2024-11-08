require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const multer = require('multer'); // Importar multer
const router = express.Router();
const UsuariosManager = require('../manager/UsuariosManager');
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticación
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar si es administrador

// Configuración de Multer para manejar múltiples archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos subidos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para cada archivo
    }
});

const upload = multer({ storage }); // Inicializar multer con la configuración

// Ruta para crear un nuevo usuario (con subida de archivos opcionales)
router.post('/', authenticateUser, verifyAdmin, upload.array('archivos', 5), async (req, res) => {
    try {
        // Recoger la información del cuerpo y los archivos subidos
        const nuevosArchivos = req.files ? req.files.map(file => file.path) : []; // Rutas de los archivos subidos
        const nuevoUsuario = {
            ...req.body,
            archivos: nuevosArchivos // Guardamos las rutas de los archivos en un array
        };

        // Pasar los archivos a `UsuariosManager` para que los procese según se necesite
        const usuarioCreado = await UsuariosManager.crearUsuario(nuevoUsuario, true, req.files); // Pasar esAdmin como true
        res.status(201).json(usuarioCreado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los usuarios
router.get('/', authenticateUser, async (req, res) => {
    try {
        const usuarios = await UsuariosManager.obtenerUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un usuario por su ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const usuario = await UsuariosManager.obtenerUsuarioPorId(req.params.id);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un usuario (con subida de archivos opcionales)
router.put('/:id', authenticateUser, verifyAdmin, upload.array('archivos', 5), async (req, res) => {
    try {
        // Recoger los archivos subidos (si hay) y su ruta
        const archivosActualizados = req.files ? req.files.map(file => file.path) : []; // Rutas de los archivos subidos
        const usuarioActualizado = {
            ...req.body,
            archivos: archivosActualizados // Actualizamos los archivos del usuario
        };

        // Llamar a `UsuariosManager` para actualizar el usuario con los nuevos datos
        const usuario = await UsuariosManager.actualizarUsuario(req.params.id, usuarioActualizado, true, req.files); // Pasar esAdmin como true
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un usuario
router.delete('/:id', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const mensaje = await UsuariosManager.eliminarUsuario(req.params.id, true); // Pasar esAdmin como true
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
