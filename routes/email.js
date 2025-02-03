import express from 'express';
import authenticateUser from '../middleware/authenticatedUser.js'; 
import verifyAdmin from '../middleware/verifyAdmin.js';
import EmailManager from '../manager/EmailManager.js';
import upload from '../middleware/uploads.js'; // Aquí importamos el middleware de uploads

const router = express.Router();

// Ruta para enviar un correo electrónico con archivo adjunto
router.post('/enviar', authenticateUser, verifyAdmin, upload, async (req, res) => {
    try {
        const { destinatario, asunto, mensaje } = req.body;
        const archivoAdjunto = req.file; // El archivo cargado estará en req.file

        // Si se subió un archivo, se lo pasa a la función de envío de correo
        if (archivoAdjunto) {
            await EmailManager.enviarCorreo(destinatario, asunto, mensaje, archivoAdjunto.path); // Usamos archivoAdjunto.path para el archivo
        } else {
            await EmailManager.enviarCorreo(destinatario, asunto, mensaje); // Si no hay archivo, solo enviamos el correo
        }

        res.status(200).json({ mensaje: 'Correo enviado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;
