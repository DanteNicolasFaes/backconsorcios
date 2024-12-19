import express from 'express';
import authenticateUser from '../middleware/authenticatedUser.js'; // Asegúrate de que el nombre del archivo sea correcto
import verifyAdmin from '../middleware/verifyAdmin.js';
import EmailManager from '../manager/EmailManager.js';

const router = express.Router();

// Ruta para enviar un correo electrónico
router.post('/enviar', authenticateUser, verifyAdmin, async (req, res) => {
    try {
        const { destinatario, asunto, mensaje } = req.body;
        await EmailManager.enviarCorreo(destinatario, asunto, mensaje);
        res.status(200).json({ mensaje: 'Correo enviado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

export default router;