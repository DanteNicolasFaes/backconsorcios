import express from 'express';
import multer from 'multer';
import fs from 'fs';
import EmailManager from '../manager/EmailManager.js'; // Importar el servicio de correo
import authenticateUser from '../middleware/authenticateUser.js'; // Middleware para autenticar al usuario
import verifyAdmin from '../middleware/verifyAdmin.js'; // Middleware para verificar que el usuario sea administrador

// Configuración de Multer para manejar la carga de archivos
const storage = multer.memoryStorage(); // Usamos memoria temporal en lugar de disco
const upload = multer({ storage });

const router = express.Router();

// Ruta para enviar un correo electrónico
router.post('/enviar', authenticateUser, verifyAdmin, upload.single('archivo'), async (req, res) => {
    const { destinatario, asunto, mensaje } = req.body;

    // Validaciones
    if (!destinatario || !asunto || !mensaje) {
        return res.status(400).json({ mensaje: 'Faltan datos necesarios: destinatario, asunto y mensaje son obligatorios.' });
    }

    // Si hay un archivo adjunto, se puede usar req.file
    const archivoAdjunto = req.file ? req.file.buffer : null; // Guarda el buffer del archivo, si existe

    try {
        // Enviar correo utilizando EmailManager
        const resultado = await EmailManager.enviarCorreo(destinatario, asunto, mensaje, archivoAdjunto);
        
        return res.status(200).json(resultado); // Respuesta exitosa
    } catch (error) {
        // Manejar errores específicos si es necesario
        console.error('Error al enviar el correo: ', error); // Log de error
        return res.status(500).json({ mensaje: 'Error al enviar el correo: ' + error.message }); // Error general
    }
});

export default router; // Exportar el router para usarlo en el servidor