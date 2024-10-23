// Dentro de la ruta para crear una nueva invitación en /routes/invitaciones.js
const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser'); // Asegúrate de importar tus middlewares
const verifyAdmin = require('../middleware/verifyAdmin');
const upload = require('../middleware/upload'); // Suponiendo que tienes middleware para subir archivos
const InvitacionesManager = require('../manager/InvitacionesManager');
const UsuariosManager = require('../manager/UsuariosManager');
const EmailManager = require('../manager/EmailManager'); // Importar EmailManager

router.post('/', authenticateUser, verifyAdmin, upload.single('archivo'), async (req, res) => {
    try {
        // Crear la nueva invitación, incluyendo el archivo si se subió
        const nuevaInvitacion = await InvitacionesManager.crearInvitacion(req.body, req.file); // Pasar req.file al manager
        
        // Obtener el administrador para enviar la notificación
        const administrador = await UsuariosManager.obtenerAdministrador();

        // Enviar la notificación al administrador
        await EmailManager.enviarCorreo(administrador.email, 'Nueva Invitación', `Se ha creado una nueva invitación: ${nuevaInvitacion.nombre}.`);

        res.status(201).json(nuevaInvitacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router; // Exportar el router para usarlo en el servidor
