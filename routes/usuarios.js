// /routes/usuarios.js
const express = require('express');
const router = express.Router();
const UsuariosManager = require('../manager/UsuariosManager');
const verifyAdmin = require('../middleware/verifyAdmin');

// Ruta para crear un nuevo usuario
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const nuevoUsuario = await UsuariosManager.crearUsuario(req.body);
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener todos los usuarios (sin verificación)
router.get('/', async (req, res) => {
    try {
        const usuarios = await UsuariosManager.obtenerUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para obtener un usuario por su ID
router.get('/:id', async (req, res) => {
    try {
        const usuario = await UsuariosManager.obtenerUsuarioPorId(req.params.id);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para actualizar un usuario
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const usuarioActualizado = await UsuariosManager.actualizarUsuario(req.params.id, req.body);
        res.status(200).json(usuarioActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ruta para eliminar un usuario
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const mensaje = await UsuariosManager.eliminarUsuario(req.params.id);
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
