// /routes/email.js
const express = require('express');
const router = express.Router();
const EmailManager = require('../manager/EmailManager');
const authenticateUser = require('../middleware/authenticateUser'); // Middleware para autenticar al usuario
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para verificar que el usuario sea administrador
const upload = require('../middleware/upload'); // Middleware para manejar la subida de archivos

// Ruta para enviar un correo electrónico
router.post('/enviar', authenticateUser, verifyAdmin, upload.single('archivo'), async (req, res) => {
    const { destinatario, asunto, mensaje } = req.body;

    // Validaciones
    if (!destinatario || !asunto || !mensaje) {
        return res.status(400).json({ mensaje: 'Faltan datos necesarios: destinatario, asunto y mensaje son obligatorios.' });
    }

    // Si hay un archivo adjunto, se puede usar req.file
    const archivoAdjunto = req.file ? req.file.path : null; // Guarda la ruta del archivo, si existe

    try {
        const resultado = await EmailManager.enviarCorreo(destinatario, asunto, mensaje, archivoAdjunto); // Enviar correo
        res.status(200).json(resultado);
    } catch (error) {
        // Manejar errores específicos si es necesario
        if (error.message.includes('formato válido')) {
            return res.status(400).json({ mensaje: error.message }); // Error de formato de correo
        }
        res.status(500).json({ mensaje: 'Error al enviar el correo: ' + error.message }); // Error general
    }
});

module.exports = router; // Exportar el router para usarlo en el servidor
