require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const multer = require('multer'); // Importar multer
const router = express.Router();
const UsuariosManager = require('../manager/UsuariosManager');
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticación
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar si es administrador

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos subidos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para cada archivo
    }
});

const upload = multer({ storage }); // Inicializar multer con la configuración

// Ruta para crear un nuevo usuario (con subida de archivo opcional)
router.post('/', authenticateUser, verifyAdmin, upload.single('archivo'), async (req, res) => {
    try {
        const nuevoUsuario = {
            ...req.body,
            archivo: req.file ? req.file.path : null // Añadir la ruta del archivo si se ha subido
        };
        const usuarioCreado = await UsuariosManager.crearUsuario(nuevoUsuario, true, req.file); // Pasar esAdmin como true
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

// Ruta para actualizar un usuario (con subida de archivo opcional)
router.put('/:id', authenticateUser, verifyAdmin, upload.single('archivo'), async (req, res) => {
    try {
        const usuarioActualizado = {
            ...req.body,
            archivo: req.file ? req.file.path : null // Añadir la ruta del archivo si se ha subido
        };
        const usuario = await UsuariosManager.actualizarUsuario(req.params.id, usuarioActualizado, true, req.file); // Pasar esAdmin como true
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
