// /routes/invitaciones.js
const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticar usuarios
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar si el usuario es administrador
const upload = require('../middleware/upload'); // Middleware para subir archivos
const InvitacionesManager = require('../manager/InvitacionesManager');
const UsuariosManager = require('../manager/UsuariosManager');
const EmailManager = require('../manager/EmailManager'); // Importar EmailManager

// Ruta para crear una nueva invitación
router.post('/', authenticateUser, verifyAdmin, upload.single('archivo'), async (req, res) => {
    try {
        // Crear la nueva invitación, pasando los datos del cuerpo y el usuario autenticado
        // Incluye el contenido del archivo si se subió
        const datosInvitacion = { 
            ...req.body,
            archivo: req.file // Almacenar el archivo directamente para pasarlo al manager
        };

        const nuevaInvitacion = await InvitacionesManager.crearInvitacion(datosInvitacion, req.user, req.file); // Usar req.user para obtener el rol del usuario
        
        // Obtener el administrador para enviar la notificación
        const administrador = await UsuariosManager.obtenerAdministrador();

        // Enviar la notificación al administrador
        await EmailManager.enviarCorreo(administrador.email, 'Nueva Invitación', `Se ha creado una nueva invitación: ${nuevaInvitacion.nombre}.`);

        res.status(201).json(nuevaInvitacion); // Responder con la nueva invitación
    } catch (error) {
        res.status(500).json({ mensaje: error.message }); // Manejo de errores
    }
});

// Ruta para listar todas las invitaciones
router.get('/', authenticateUser, async (req, res) => {
    try {
        const invitaciones = await InvitacionesManager.listarInvitaciones();
        res.status(200).json(invitaciones); // Responder con la lista de invitaciones
    } catch (error) {
        res.status(500).json({ mensaje: error.message }); // Manejo de errores
    }
});

// Ruta para obtener detalles de una invitación específica por ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const invitacion = await InvitacionesManager.obtenerInvitacionPorId(req.params.id);
        res.status(200).json(invitacion); // Responder con la invitación encontrada
    } catch (error) {
        res.status(500).json({ mensaje: error.message }); // Manejo de errores
    }
});

module.exports = router; // Exportar el router para usarlo en el servidor
